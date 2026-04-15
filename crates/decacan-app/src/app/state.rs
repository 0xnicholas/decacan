use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};

use async_trait::async_trait;
use time::OffsetDateTime;

use decacan_auth::{AuthService, SqliteUserStorage};
use decacan_infra::clock::system::SystemClock;
use decacan_infra::filesystem::local::LocalFilesystem;
use decacan_infra::storage::memory::MemoryStorage;
use decacan_agent_contract::{ExecutionContext, ExecutionEvent, ExecutionProfile, PlaybookSnapshot};
use decacan_agent_contract::events::{RiskLevel, StepOutput};
use decacan_agent_contract::snapshot::{CompiledWorkflow, CapabilityKind, CapabilityRef};
use decacan_infra::execution_engine::CoordinatorHttpExecutionEngineClient;
use decacan_runtime::artifact::entity::Artifact as RuntimeArtifact;
use decacan_runtime::assistant::session::{AssistantDelegationBinding, AssistantSession};
use decacan_runtime::persistence::assistant_delegations::AssistantDelegationBindingStore;
use decacan_runtime::events::{TaskEvent, TaskEventPayload};
use decacan_runtime::execution::coordinator::{
    ApprovalStore, ArtifactStore, CoordinatorError, ExecutionCoordinator, ExecutionIndex, TaskStore,
};
use decacan_runtime::playbook::authoring::{save_draft, SaveDraftCommand};
use decacan_runtime::playbook::entity::{
    DraftHealthIssue, DraftHealthReport, DraftValidationState, PlaybookDraft, PlaybookHandle,
    PlaybookHandleOrigin, PlaybookOwnerScope, PlaybookVersion, StoreEntry,
};
use decacan_runtime::playbook::execution::{
    execute_registered_playbook_run, prepare_registered_playbook_run, preview_registered_playbook,
    RegisteredPlaybookError, RegisteredPlaybookExecutionRequest,
};
use decacan_runtime::playbook::modes::PlaybookMode;
use decacan_runtime::playbook::publish::{publish_draft, PublishDraftCommand};
use decacan_runtime::playbook::registry::{
    list_registered_playbooks, DISCOVER_TOPICS_PLAYBOOK_KEY, SUMMARY_PLAYBOOK_KEY,
};
use decacan_runtime::ports::clock::ClockPort;
use decacan_runtime::ports::execution_engine::ExecutionEnginePort;
use decacan_runtime::ports::filesystem::FilesystemPort;
use decacan_runtime::run::entity::Run;
use decacan_runtime::run::service::{SummaryPlaybookE2eResult, SummaryPlaybookExecutionError};
use decacan_runtime::task::entity::{Task, TaskStatus};
use decacan_runtime::team_session::snapshot::TeamSessionSnapshot;
use decacan_runtime::workspace::entity::WorkspaceMembership;
use decacan_runtime::workspace::rbac::WorkspaceRole;
use decacan_runtime::workspace::service::member_service::{
    CreateMembershipInput, MemberService, UpdateRoleInput,
};
use tokio::sync::broadcast;

use crate::app::recovery::RecoveryReport;

use crate::dto::{
    AccountHomeDto, AccountPlaybookShortcutDto, AccountTaskSummaryDto, AccountWorkItemDto,
    ApprovalDto, ArtifactContentDto, ArtifactDto, AssistantDelegationDto, AssistantObjectiveDto,
    AssistantSessionResponseDto, CreateAssistantDelegationRequestDto,
    CreateAssistantSessionRequestDto, CreatePlaybookRequestDto, CreatePlaybookResponseDto,
    CreateTaskAcceptedResponse, CreateTaskRequest, CreateTeamRequestDto, CreateTeamResponseDto,
    DraftHealthIssueDto, DraftHealthReportDto, ForkPlaybookResponseDto, ListTeamsResponseDto,
    PermissionDto, PlaybookDetailDto, PlaybookDraftDto, PlaybookDto, PlaybookHandleDto,
    PlaybookStudioListItemDto, PlaybookVersionDto, PublishPlaybookResponseDto,
    PublishedPlaybookDto, RetryTaskRequest, SavePlaybookDraftResponseDto, StoreEntryDto,
    TaskAgentMessageDto, TaskCollaborationDto, TaskDetailDto, TaskDto, TaskEventEnvelopeDto,
    TaskInstructionActionDto, TaskPlanDto, TaskPreviewDto, TaskPreviewRequest, TaskSummaryDto,
    TeamRoleDto, TeamSessionSnapshotDto, TeamSpecDto, UpdatePlaybookRequestDto,
    UpdatePlaybookResponseDto, UpdateTeamRequestDto, UserPermissionsResponseDto, WorkspaceDto,
    WorkspacePermissionDto, EvolutionProposalDto, EvolutionProposalReviewUpdateRequestDto,
};
use crate::middleware::CurrentUser;

#[derive(Clone)]
pub struct AppState {
    inner: Arc<AppStateInner>,
    execution_coordinator: std::sync::OnceLock<ExecutionCoordinator>,
}

struct AppStateInner {
    next_id: AtomicU64,
    default_workspace_root: PathBuf,
    workspaces: Vec<WorkspaceDto>,
    playbooks: Vec<PlaybookDto>,
    playbook_store: Vec<StoreEntry>,
    lifecycle_playbooks: Mutex<HashMap<String, StoredLifecyclePlaybook>>,
    teams: Mutex<HashMap<String, StoredTeamSpec>>,
    tasks: Mutex<HashMap<String, StoredTask>>,
    assistant_sessions: Mutex<HashMap<String, StoredAssistantSession>>,
    evolution_proposals: Mutex<HashMap<String, StoredEvolutionProposalRecord>>,
    artifacts: Mutex<HashMap<String, StoredArtifact>>,
    approvals: Mutex<HashMap<String, ApprovalDto>>,
    task_events: Mutex<HashMap<String, Vec<TaskEventEnvelopeDto>>>,
    execution_mappings: Mutex<HashMap<String, decacan_runtime::execution::coordinator::ExecutionMapping>>,
    task_event_bus: broadcast::Sender<TaskEventEnvelopeDto>,
    auth_service: AuthService<SqliteUserStorage>,
    member_service: MemberService,
}

#[derive(Debug, Clone)]
struct StoredTask {
    id: String,
    workspace_id: String,
    playbook_key: String,
    input_payload: String,
    playbook_handle_id: String,
    playbook_version_id: String,
    artifact_id: Option<String>,
    status: String,
    status_summary: String,
    agent_messages: Vec<TaskAgentMessageDto>,
    runtime_task: Task,
    runtime_run: Run,
}

#[derive(Debug, Clone)]
struct StoredAssistantSession {
    workspace_id: String,
    execution_mode: String,
    objective: AssistantObjectiveDto,
    session: AssistantSession,
}

#[derive(Debug, Clone)]
struct StoredArtifact {
    dto: ArtifactDto,
    physical_path: PathBuf,
}

#[derive(Debug, Clone)]
struct StoredEvolutionProposalRecord {
    proposal_id: String,
    team_session_id: String,
    title: String,
    review_state: String,
}

#[derive(Debug, Clone)]
struct StoredLifecyclePlaybook {
    handle: PlaybookHandle,
    draft: PlaybookDraft,
    versions: Vec<PlaybookVersion>,
}

#[derive(Debug, Clone)]
struct StoredTeamSpec {
    spec: TeamSpecDto,
    created_at: String,
}

#[derive(Debug, Clone)]
struct PreparedExecution {
    task_id: String,
    workspace_root: PathBuf,
    input_path: PathBuf,
    input_contents: String,
    pending_artifact: ArtifactDto,
    runtime_task: Task,
    runtime_run: Run,
    playbook_snapshot: PlaybookSnapshot,
}

#[derive(Debug)]
struct ExecutionOutcome {
    task: Task,
    run: Run,
    result: Result<SummaryPlaybookE2eResult, String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum AssistantDelegationError {
    WorkspaceNotFound,
    SessionNotFound,
    ActiveDelegationExists,
    OrchestrationFailed,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum EvolutionProposalError {
    TeamSessionNotFound,
    ProposalNotFound,
    ProposalTeamSessionMismatch,
    InvalidReviewState,
}

impl AppState {
    pub async fn new_for_test() -> Self {
        Self::new_for_test_with_workspaces(vec![(
            "workspace-1".to_owned(),
            "Default Workspace".to_owned(),
            Self::test_workspace_root().display().to_string(),
        )])
        .await
        .expect("test app state should create a default workspace root")
    }

    pub async fn new_for_test_with_workspaces(
        workspaces: Vec<(String, String, String)>,
    ) -> std::io::Result<Self> {
        let workspaces = workspaces
            .into_iter()
            .map(|(id, title, root_path)| WorkspaceDto {
                id,
                title,
                root_path,
            })
            .collect();

        Self::new_with_workspace_root_and_workspaces(Self::test_workspace_root(), workspaces).await
    }

    pub async fn new_local() -> std::io::Result<Self> {
        let root = std::env::current_dir()?.join(".decacan-local-workspace");
        Self::new_with_workspace_root(root).await
    }

    pub fn auth_service(&self) -> &AuthService<SqliteUserStorage> {
        &self.inner.auth_service
    }

    pub fn member_service(&self) -> &MemberService {
        &self.inner.member_service
    }

    fn test_workspace_root() -> PathBuf {
        std::env::temp_dir().join(format!(
            "decacan-app-runtime-{}",
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("system time should be after unix epoch")
                .as_nanos()
        ))
    }

    pub async fn find_user_by_id(&self, user_id: &str) -> Option<decacan_auth::entities::User> {
        self.inner
            .auth_service
            .find_user_by_id(user_id)
            .await
            .ok()
            .flatten()
    }

    pub async fn find_user_by_email(&self, email: &str) -> Option<decacan_auth::entities::User> {
        self.inner
            .auth_service
            .find_user_by_email(email)
            .await
            .ok()
            .flatten()
    }

    /// Create a workspace membership for testing purposes
    pub fn create_test_membership(
        &self,
        workspace_id: String,
        user_id: String,
        role: decacan_runtime::workspace::rbac::WorkspaceRole,
    ) -> decacan_runtime::workspace::entity::WorkspaceMembership {
        use decacan_runtime::workspace::service::member_service::CreateMembershipInput;

        let input = CreateMembershipInput {
            workspace_id,
            user_id,
            role,
            invited_by: None,
        };

        self.member_service()
            .invite_member(input)
            .expect("Failed to create test membership")
    }

    async fn new_with_workspace_root(default_workspace_root: PathBuf) -> std::io::Result<Self> {
        let workspaces = vec![WorkspaceDto {
            id: "workspace-1".to_owned(),
            title: "Default Workspace".to_owned(),
            root_path: default_workspace_root.display().to_string(),
        }];
        Self::new_with_workspace_root_and_workspaces(default_workspace_root, workspaces).await
    }

    async fn new_with_workspace_root_and_workspaces(
        default_workspace_root: PathBuf,
        workspaces: Vec<WorkspaceDto>,
    ) -> std::io::Result<Self> {
        std::fs::create_dir_all(&default_workspace_root)?;
        let (task_event_bus, _) = broadcast::channel(64);
        let playbooks = list_registered_playbooks()
            .into_iter()
            .map(playbook_to_dto)
            .collect();
        let playbook_store = builtin_store_entries();

        // 初始化认证服务
        // 检测测试模式：路径包含 "decacan-app-runtime" 或者是 .decacan-local-workspace
        let path_str = default_workspace_root.to_string_lossy();
        let is_test_mode = path_str.contains("decacan-app-runtime")
            || path_str.contains(".decacan-local-workspace");

        let db_url = if is_test_mode {
            ":memory:".to_string()
        } else {
            let db_path = default_workspace_root.join("auth.db");
            format!("sqlite:{}", db_path.display())
        };

        let storage = Arc::new(
            SqliteUserStorage::new(&db_url)
                .await
                .map_err(|e| std::io::Error::new(std::io::ErrorKind::Other, e.to_string()))?,
        );

        // 生产环境必须设置 JWT_SECRET，否则报错（测试模式使用默认密钥）
        let jwt_secret = if is_test_mode {
            "test-secret-key".to_string()
        } else {
            std::env::var("JWT_SECRET").map_err(|_| {
                std::io::Error::new(
                    std::io::ErrorKind::InvalidInput,
                    "JWT_SECRET environment variable must be set for production",
                )
            })?
        };

        let auth_service = AuthService::new(storage, jwt_secret);
        let member_service = MemberService::new();

        let engine_url = std::env::var("DECACAN_EXECUTION_ENGINE_URL")
            .unwrap_or_else(|_| "http://localhost:8080".to_string());
        let engine: Arc<dyn ExecutionEnginePort<Error = CoordinatorError>> =
            Arc::new(CoordinatorHttpExecutionEngineClient::new(
                engine_url,
                std::time::Duration::from_secs(60),
            ));

        let inner = Arc::new(AppStateInner {
            next_id: AtomicU64::new(1),
            workspaces,
            playbooks,
            playbook_store,
            default_workspace_root,
            lifecycle_playbooks: Mutex::new(HashMap::new()),
            teams: Mutex::new(HashMap::new()),
            tasks: Mutex::new(HashMap::new()),
            assistant_sessions: Mutex::new(HashMap::new()),
            evolution_proposals: Mutex::new(HashMap::new()),
            artifacts: Mutex::new(HashMap::new()),
            approvals: Mutex::new(HashMap::new()),
            task_events: Mutex::new(HashMap::new()),
            execution_mappings: Mutex::new(HashMap::new()),
            task_event_bus: task_event_bus.clone(),
            auth_service,
            member_service,
        });

        let state = AppState {
            inner: inner.clone(),
            execution_coordinator: std::sync::OnceLock::new(),
        };

        let state_for_callback = state.clone();
        let event_callback: Arc<dyn Fn(decacan_runtime::events::TaskEvent) + Send + Sync> =
            Arc::new(move |event: decacan_runtime::events::TaskEvent| {
                let envelope = state_for_callback.runtime_event_to_envelope(event);
                state_for_callback.append_task_event(envelope);
            });

        let coordinator = ExecutionCoordinator::new(
            engine,
            Arc::new(state.clone()),
            Arc::new(state.clone()),
            Arc::new(state.clone()),
            Arc::new(state.clone()),
            event_callback,
        );
        state.execution_coordinator.set(coordinator)
            .expect("execution coordinator should initialize once");

        Ok(state)
    }

    /// Recover assistant sessions from persistence after app restart
    /// This should be called once during application startup in production
    pub async fn recover_assistant_sessions<Store>(
        &self,
        delegation_store: Store,
    ) -> Result<RecoveryReport, Store::Error>
    where
        Store: AssistantDelegationBindingStore,
    {
        use crate::app::recovery::RecoveryService;

        let recovery_service = RecoveryService::new(delegation_store);
        let mut sessions_guard = self
            .inner
            .assistant_sessions
            .lock()
            .unwrap_or_else(|e| e.into_inner());

        // Extract just the AssistantSession part for recovery
        let mut sessions_to_recover: HashMap<String, AssistantSession> = HashMap::new();

        let report = recovery_service
            .recover_sessions(&mut sessions_to_recover)
            .await?;

        // Merge recovered sessions into stored sessions
        for (session_id, session) in sessions_to_recover {
            // Extract workspace_id from the delegation binding
            let workspace_id = session
                .active_delegation
                .as_ref()
                .map(|d| d.workspace_id.clone())
                .unwrap_or_else(|| "recovered".to_string());

            // Create a StoredAssistantSession with values from the binding
            let stored_session = StoredAssistantSession {
                workspace_id,
                execution_mode: "standard".to_string(), // Would come from persistence
                objective: crate::dto::AssistantObjectiveDto {
                    title: "Recovered session".to_string(),
                    user_goal: "Recovered from persistence".to_string(),
                },
                session,
            };
            sessions_guard.insert(session_id, stored_session);
        }

        Ok(report)
    }

    pub fn next_id(&self, prefix: &str) -> String {
        let next = self.inner.next_id.fetch_add(1, Ordering::Relaxed);
        format!("{prefix}-{next}")
    }

    pub fn workspaces(&self) -> Vec<WorkspaceDto> {
        self.inner.workspaces.clone()
    }

    pub fn playbooks(&self) -> Vec<PlaybookDto> {
        self.inner.playbooks.clone()
    }

    pub fn default_workspace_id(&self) -> String {
        self.inner
            .workspaces
            .first()
            .map(|workspace| workspace.id.clone())
            .unwrap_or_default()
    }

    pub fn default_current_user(&self) -> CurrentUser {
        CurrentUser {
            user_id: "current-user".to_owned(),
            default_workspace_id: self.default_workspace_id(),
        }
    }

    pub async fn create_assistant_session(
        &self,
        request: CreateAssistantSessionRequestDto,
    ) -> Result<AssistantSessionResponseDto, AssistantDelegationError> {
        if !self.is_known_workspace(&request.workspace_id) {
            return Err(AssistantDelegationError::WorkspaceNotFound);
        }

        let assistant_session_id = self.next_id("assistant-session");
        let task_id = self.next_id("assistant-task");
        let run_id = self.next_id("assistant-run");
        let team_session_id = self.next_id("team-session");

        let snapshot = TeamSessionSnapshot::new_for_test(team_session_id.clone());

        let session = AssistantSession::new_for_test(assistant_session_id.clone())
            .with_active_delegation(
                request.workspace_id.clone(),
                task_id.clone(),
                run_id.clone(),
                team_session_id.clone(),
            );

        let binding = session
            .active_delegation
            .clone()
            .ok_or(AssistantDelegationError::OrchestrationFailed)?;

        let mut sessions = self
            .inner
            .assistant_sessions
            .lock()
            .unwrap_or_else(|e| e.into_inner());
        sessions.insert(
            assistant_session_id.clone(),
            StoredAssistantSession {
                workspace_id: request.workspace_id.clone(),
                execution_mode: request.execution_mode.clone(),
                objective: request.objective.clone(),
                session,
            },
        );

        Ok(build_assistant_session_response(
            assistant_session_id,
            request.workspace_id,
            request.execution_mode,
            request.objective,
            binding,
            snapshot,
        ))
    }

    pub async fn create_assistant_delegation(
        &self,
        assistant_session_id: &str,
        request: CreateAssistantDelegationRequestDto,
    ) -> Result<AssistantSessionResponseDto, AssistantDelegationError> {
        if !self.is_known_workspace(&request.workspace_id) {
            return Err(AssistantDelegationError::WorkspaceNotFound);
        }

        let existing = {
            let sessions = self
                .inner
                .assistant_sessions
                .lock()
                .unwrap_or_else(|e| e.into_inner());
            sessions
                .get(assistant_session_id)
                .cloned()
                .ok_or(AssistantDelegationError::SessionNotFound)?
        };

        if existing.session.can_start_new_delegation().is_err() {
            return Err(AssistantDelegationError::ActiveDelegationExists);
        }

        let task_id = self.next_id("assistant-task");
        let run_id = self.next_id("assistant-run");
        let team_session_id = self.next_id("team-session");

        let snapshot = TeamSessionSnapshot::new_for_test(team_session_id.clone());

        let session = existing.session.with_active_delegation(
            request.workspace_id.clone(),
            task_id.clone(),
            run_id.clone(),
            team_session_id.clone(),
        );
        let binding = session
            .active_delegation
            .clone()
            .ok_or(AssistantDelegationError::OrchestrationFailed)?;

        let mut sessions = self
            .inner
            .assistant_sessions
            .lock()
            .unwrap_or_else(|e| e.into_inner());
        sessions.insert(
            assistant_session_id.to_owned(),
            StoredAssistantSession {
                workspace_id: request.workspace_id.clone(),
                execution_mode: request.execution_mode.clone(),
                objective: request.objective.clone(),
                session,
            },
        );

        Ok(build_assistant_session_response(
            assistant_session_id.to_owned(),
            request.workspace_id,
            request.execution_mode,
            request.objective,
            binding,
            snapshot,
        ))
    }

    pub async fn get_team_session_snapshot(
        &self,
        team_session_id: &str,
    ) -> Option<TeamSessionSnapshotDto> {
        Some(TeamSessionSnapshotDto::from(
            TeamSessionSnapshot::new_for_test(team_session_id),
        ))
    }

    pub async fn get_assistant_session(
        &self,
        assistant_session_id: &str,
    ) -> Result<AssistantSessionResponseDto, AssistantDelegationError> {
        let stored = {
            let sessions = self
                .inner
                .assistant_sessions
                .lock()
                .unwrap_or_else(|e| e.into_inner());
            sessions
                .get(assistant_session_id)
                .cloned()
                .ok_or(AssistantDelegationError::SessionNotFound)?
        };

        let delegation = stored
            .session
            .active_delegation
            .clone()
            .ok_or(AssistantDelegationError::SessionNotFound)?;

        let snapshot = TeamSessionSnapshot::new_for_test(&delegation.team_session_id);

        Ok(build_assistant_session_response(
            assistant_session_id.to_owned(),
            stored.workspace_id,
            stored.execution_mode,
            stored.objective,
            delegation,
            snapshot,
        ))
    }

    pub fn latest_assistant_session_summary_for_workspace(
        &self,
        workspace_id: &str,
    ) -> Option<crate::dto::AssistantSessionSummaryDto> {
        let sessions = self
            .inner
            .assistant_sessions
            .lock()
            .unwrap_or_else(|e| e.into_inner());

        sessions
            .iter()
            .filter(|(_, stored)| stored.workspace_id == workspace_id)
            .max_by_key(|(session_id, _)| assistant_session_id_sequence(session_id))
            .map(|(assistant_session_id, stored)| crate::dto::AssistantSessionSummaryDto {
                assistant_session_id: assistant_session_id.clone(),
                active_team_session_id: stored
                    .session
                    .active_delegation
                    .as_ref()
                    .map(|delegation| delegation.team_session_id.clone()),
                state: if stored.session.active_delegation.is_some() {
                    "active".to_owned()
                } else {
                    "idle".to_owned()
                },
            })
    }

    pub fn list_evolution_proposals(&self, team_session_id: Option<&str>) -> Vec<EvolutionProposalDto> {
        let proposals = self
            .inner
            .evolution_proposals
            .lock()
            .unwrap_or_else(|e| e.into_inner());

        proposals
            .values()
            .filter(|proposal| {
                if let Some(team_session_id) = team_session_id {
                    proposal.team_session_id == team_session_id
                } else {
                    true
                }
            })
            .map(|proposal| EvolutionProposalDto {
                proposal_id: proposal.proposal_id.clone(),
                team_session_id: proposal.team_session_id.clone(),
                title: proposal.title.clone(),
                review_state: proposal.review_state.clone(),
            })
            .collect()
    }

    pub async fn update_evolution_proposal_review(
        &self,
        proposal_id: &str,
        request: EvolutionProposalReviewUpdateRequestDto,
    ) -> Result<EvolutionProposalDto, EvolutionProposalError> {
        if !matches!(request.review_state.as_str(), "pending" | "approved" | "rejected") {
            return Err(EvolutionProposalError::InvalidReviewState);
        }

        let mut proposals = self
            .inner
            .evolution_proposals
            .lock()
            .unwrap_or_else(|e| e.into_inner());

        let existing = proposals
            .get_mut(proposal_id)
            .ok_or(EvolutionProposalError::ProposalNotFound)?;
        if existing.team_session_id != request.team_session_id {
            return Err(EvolutionProposalError::ProposalTeamSessionMismatch);
        }
        if existing.title != request.title {
            return Err(EvolutionProposalError::ProposalTeamSessionMismatch);
        }

        existing.review_state = request.review_state;
        let updated = existing.clone();

        Ok(EvolutionProposalDto {
            proposal_id: updated.proposal_id,
            team_session_id: updated.team_session_id,
            title: updated.title,
            review_state: updated.review_state,
        })
    }

    fn sync_evolution_proposals_from_snapshot(&self, snapshot: &TeamSessionSnapshot) {
        if snapshot.evolution_proposals.is_empty() {
            return;
        }

        let mut proposals = self
            .inner
            .evolution_proposals
            .lock()
            .unwrap_or_else(|e| e.into_inner());
        for proposal in &snapshot.evolution_proposals {
            proposals.entry(proposal.proposal_id.clone()).or_insert_with(|| {
                StoredEvolutionProposalRecord {
                    proposal_id: proposal.proposal_id.clone(),
                    team_session_id: snapshot.session_id.clone(),
                    title: proposal.title.clone(),
                    review_state: proposal.review_state.clone(),
                }
            });
        }
    }

    pub fn build_account_home(&self) -> AccountHomeDto {
        self.build_account_home_for_user(&self.default_current_user())
    }

    pub fn build_account_home_for_user(&self, current_user: &CurrentUser) -> AccountHomeDto {
        let workspaces = self.workspaces_for_user(current_user);
        let recent_tasks = self.recent_tasks_for_user(current_user);
        let waiting_on_me = self.waiting_on_me_for_user(current_user);
        let playbook_shortcuts = self.playbook_shortcuts_for_user(current_user);

        AccountHomeDto {
            default_workspace_id: current_user.default_workspace_id.clone(),
            workspaces,
            waiting_on_me,
            recent_tasks,
            playbook_shortcuts,
        }
    }

    pub(crate) fn workspaces_for_user(
        &self,
        _current_user: &CurrentUser,
    ) -> Vec<crate::dto::AccountWorkspaceDto> {
        // Home should expose the user's visible workspace list, not collapse it to the default.
        self.inner
            .workspaces
            .clone()
            .into_iter()
            .map(crate::dto::AccountWorkspaceDto::from)
            .collect()
    }

    pub(crate) fn recent_tasks_for_user(
        &self,
        current_user: &CurrentUser,
    ) -> Vec<AccountTaskSummaryDto> {
        self.list_tasks_in_workspace(&current_user.default_workspace_id)
            .into_iter()
            .map(AccountTaskSummaryDto::from)
            .collect()
    }

    pub(crate) fn waiting_on_me_for_user(
        &self,
        current_user: &CurrentUser,
    ) -> Vec<AccountWorkItemDto> {
        self.inner
            .approvals
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .values()
            .filter(|approval| approval.workspace_id == current_user.default_workspace_id)
            .map(|approval| AccountWorkItemDto {
                id: approval.id.clone(),
                workspace_id: approval.workspace_id.clone(),
                task_id: approval.task_id.clone(),
                title: approval.task_playbook_key.clone(),
                kind: "approval".to_owned(),
                status: approval.status.clone(),
            })
            .collect()
    }

    pub(crate) fn playbook_shortcuts_for_user(
        &self,
        _current_user: &CurrentUser,
    ) -> Vec<AccountPlaybookShortcutDto> {
        self.playbooks()
            .into_iter()
            .map(AccountPlaybookShortcutDto::from)
            .collect()
    }

    pub fn list_studio_playbooks(&self) -> Vec<PlaybookStudioListItemDto> {
        self.inner
            .lifecycle_playbooks
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .values()
            .cloned()
            .map(|stored| PlaybookStudioListItemDto {
                handle: playbook_handle_to_dto(stored.handle),
                draft: playbook_draft_to_dto(stored.draft.clone()),
                latest_version: stored.versions.last().cloned().map(playbook_version_to_dto),
                publishable: stored.draft.validation_state == DraftValidationState::Validated,
            })
            .collect()
    }

    pub fn list_playbook_store(&self) -> Vec<StoreEntryDto> {
        self.inner
            .playbook_store
            .iter()
            .cloned()
            .map(store_entry_to_dto)
            .collect()
    }

    pub fn list_published_playbooks(&self) -> Vec<PublishedPlaybookDto> {
        self.inner
            .lifecycle_playbooks
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .values()
            .filter_map(|stored| {
                let version = stored.versions.last()?.clone();
                let store_entry_id = stored.handle.source_store_entry_id.as_deref()?;
                let playbook_key = playbook_key_for_store_entry(store_entry_id)?;
                let playbook = self
                    .inner
                    .playbooks
                    .iter()
                    .find(|playbook| playbook.key == playbook_key)?
                    .clone();

                Some(PublishedPlaybookDto {
                    playbook_handle_id: stored.handle.playbook_handle_id.clone(),
                    playbook_version_id: version.playbook_version_id.to_string(),
                    title: playbook.title,
                    summary: playbook.summary,
                    mode_label: playbook.mode_label,
                    expected_output_label: playbook.expected_output_label,
                    expected_output_path: playbook.expected_output_path,
                })
            })
            .collect()
    }

    pub fn fork_playbook_from_store(
        &self,
        store_entry_id: &str,
    ) -> Result<ForkPlaybookResponseDto, PlaybookLifecycleError> {
        let store_entry = self
            .inner
            .playbook_store
            .iter()
            .find(|entry| entry.store_entry_id == store_entry_id)
            .cloned()
            .ok_or(PlaybookLifecycleError::StoreEntryNotFound)?;
        let handle = build_playbook_handle(
            self.next_id("handle"),
            store_entry.store_entry_id.clone(),
            store_entry.title.clone(),
        );
        let draft = build_playbook_draft(
            self.next_id("draft"),
            handle.playbook_handle_id.clone(),
            initial_draft_document(&store_entry),
        );

        self.inner
            .lifecycle_playbooks
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .insert(
                handle.playbook_handle_id.clone(),
                StoredLifecyclePlaybook {
                    handle: handle.clone(),
                    draft: draft.clone(),
                    versions: Vec::new(),
                },
            );

        Ok(ForkPlaybookResponseDto {
            handle: playbook_handle_to_dto(handle),
            draft: playbook_draft_to_dto(draft),
        })
    }

    pub fn get_playbook_detail(
        &self,
        handle_id: &str,
    ) -> Result<PlaybookDetailDto, PlaybookLifecycleError> {
        let stored = self
            .inner
            .lifecycle_playbooks
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .get(handle_id)
            .cloned()
            .ok_or(PlaybookLifecycleError::HandleNotFound)?;

        Ok(PlaybookDetailDto {
            handle: playbook_handle_to_dto(stored.handle),
            draft: playbook_draft_to_dto(stored.draft),
            versions: stored
                .versions
                .into_iter()
                .map(playbook_version_to_dto)
                .collect(),
        })
    }

    pub fn save_playbook_draft(
        &self,
        handle_id: &str,
        spec_document: String,
    ) -> Result<SavePlaybookDraftResponseDto, PlaybookLifecycleError> {
        let mut playbooks = self
            .inner
            .lifecycle_playbooks
            .lock()
            .unwrap_or_else(|e| e.into_inner());
        let stored = playbooks
            .get_mut(handle_id)
            .ok_or(PlaybookLifecycleError::HandleNotFound)?;
        let result = save_draft(SaveDraftCommand {
            draft: stored.draft.clone(),
            spec_document,
            saved_at: stored.draft.last_saved_at,
        });

        stored.draft = result.draft.clone();

        Ok(SavePlaybookDraftResponseDto {
            draft: playbook_draft_to_dto(result.draft),
            health_report: draft_health_report_to_dto(result.health_report),
        })
    }

    pub fn publish_playbook_draft(
        &self,
        handle_id: &str,
    ) -> Result<PublishPlaybookOutcome, PlaybookLifecycleError> {
        let mut playbooks = self
            .inner
            .lifecycle_playbooks
            .lock()
            .unwrap_or_else(|e| e.into_inner());
        let stored = playbooks
            .get_mut(handle_id)
            .ok_or(PlaybookLifecycleError::HandleNotFound)?;
        let result = publish_draft(PublishDraftCommand {
            draft: stored.draft.clone(),
            playbook_version_id: Default::default(),
            version_number: stored.versions.len() as u32 + 1,
            published_at: stored.draft.last_saved_at,
        });

        let publishable = result.health_report.publishable;
        if let Some(version) = result.version.clone() {
            stored.versions.push(version);
        }

        Ok(PublishPlaybookOutcome {
            publishable,
            response: PublishPlaybookResponseDto {
                version: result.version.map(playbook_version_to_dto),
                health_report: draft_health_report_to_dto(result.health_report),
                resolved_refs: result.resolved_refs,
            },
        })
    }

    pub fn create_playbook(
        &self,
        request: CreatePlaybookRequestDto,
    ) -> Result<CreatePlaybookResponseDto, ()> {
        use decacan_runtime::playbook::entity::{
            PlaybookHandle, PlaybookHandleOrigin, PlaybookOwnerScope,
        };
        use decacan_runtime::ports::clock::ClockPort;

        let handle_id = self.next_id("pb");
        let draft_id = self.next_id("draft");
        let now = SystemClock::new().now_utc();

        let handle = PlaybookHandle {
            playbook_handle_id: handle_id.clone(),
            owner_scope: PlaybookOwnerScope::LocalPrivate,
            origin: PlaybookHandleOrigin::LocalCopy,
            source_store_entry_id: None,
            title: request.title,
            created_at: now,
            updated_at: now,
        };

        // Create an initial empty spec document
        let spec_document = format!(
            r#"metadata:
  title: "{}"
  description: "{}"
  mode: {}
  version: "1.0.0"
  tags: []

input_schema: []

workflow:
  steps: []

output_contract:
  primary_artifact: null
  secondary_artifacts: null
  backup_policy: none
"#,
            handle.title, request.description, request.mode
        );

        let draft = build_playbook_draft(draft_id, handle_id.clone(), spec_document);

        let mut playbooks = self
            .inner
            .lifecycle_playbooks
            .lock()
            .unwrap_or_else(|e| e.into_inner());

        playbooks.insert(
            handle_id,
            StoredLifecyclePlaybook {
                handle: handle.clone(),
                draft: draft.clone(),
                versions: vec![],
            },
        );

        Ok(CreatePlaybookResponseDto {
            handle: playbook_handle_to_dto(handle),
            draft: playbook_draft_to_dto(draft),
        })
    }

    pub fn update_playbook(
        &self,
        handle_id: &str,
        request: UpdatePlaybookRequestDto,
    ) -> Result<UpdatePlaybookResponseDto, PlaybookLifecycleError> {
        use time::OffsetDateTime;

        // Validate that at least one field is provided
        if request.title.is_none()
            && request.description.is_none()
            && request.mode.is_none()
            && request.tags.is_none()
        {
            return Err(PlaybookLifecycleError::InvalidUpdate);
        }

        let mut playbooks = self
            .inner
            .lifecycle_playbooks
            .lock()
            .unwrap_or_else(|e| e.into_inner());

        let stored = playbooks
            .get_mut(handle_id)
            .ok_or(PlaybookLifecycleError::HandleNotFound)?;

        let mut updated = false;

        if let Some(title) = request.title {
            if !title.is_empty() {
                stored.handle.title = title;
                updated = true;
            }
        }

        // Note: description, mode, and tags are stored in the draft spec_document
        // not in the PlaybookHandle. To update these, you need to update the draft.
        // For now, we only support updating the title via this endpoint.

        if updated {
            stored.handle.updated_at = OffsetDateTime::now_utc();
        }

        Ok(UpdatePlaybookResponseDto {
            handle: playbook_handle_to_dto(stored.handle.clone()),
        })
    }

    pub fn delete_playbook(&self, handle_id: &str) -> Result<(), PlaybookLifecycleError> {
        let mut playbooks = self
            .inner
            .lifecycle_playbooks
            .lock()
            .unwrap_or_else(|e| e.into_inner());

        playbooks
            .remove(handle_id)
            .ok_or(PlaybookLifecycleError::HandleNotFound)?;

        Ok(())
    }

    pub fn list_teams(&self) -> ListTeamsResponseDto {
        let teams = self.inner.teams.lock().unwrap_or_else(|e| e.into_inner());

        ListTeamsResponseDto {
            teams: teams.values().map(|t| t.spec.clone()).collect(),
        }
    }

    pub fn get_team(&self, team_id: &str) -> Option<TeamSpecDto> {
        let teams = self.inner.teams.lock().unwrap_or_else(|e| e.into_inner());

        teams.get(team_id).map(|t| t.spec.clone())
    }

    pub fn create_team(&self, request: CreateTeamRequestDto) -> Result<CreateTeamResponseDto, ()> {
        use decacan_runtime::ports::clock::ClockPort;

        let team_id = self.next_id("team");
        let created_at = SystemClock::new().now_utc().to_string();

        let roles: Vec<TeamRoleDto> = request
            .roles
            .into_iter()
            .enumerate()
            .map(|(idx, r)| TeamRoleDto {
                id: format!("{}-role-{}", team_id, idx + 1),
                name: r.name,
                description: r.description,
                focus: r.focus,
                instructions: r.instructions,
            })
            .collect();

        // Validate lead_role_id exists in roles
        let lead_role_exists = roles.iter().any(|r| r.id == request.lead_role_id);
        if !lead_role_exists {
            return Err(()); // Return error if lead_role_id doesn't exist in roles
        }

        let spec = TeamSpecDto {
            id: team_id.clone(),
            name: request.name,
            description: request.description,
            roles,
            lead_role_id: request.lead_role_id,
            created_at: created_at.clone(),
        };

        let mut teams = self.inner.teams.lock().unwrap_or_else(|e| e.into_inner());

        teams.insert(
            team_id,
            StoredTeamSpec {
                spec: spec.clone(),
                created_at,
            },
        );

        Ok(CreateTeamResponseDto { team: spec })
    }

    pub fn update_team(
        &self,
        team_id: &str,
        request: UpdateTeamRequestDto,
    ) -> Result<TeamSpecDto, String> {
        // Validate that at least one field is provided
        if request.name.is_none()
            && request.description.is_none()
            && request.roles.is_none()
            && request.lead_role_id.is_none()
        {
            return Err("At least one field must be provided for update".to_string());
        }

        let mut teams = self.inner.teams.lock().unwrap_or_else(|e| e.into_inner());

        let stored = teams
            .get_mut(team_id)
            .ok_or_else(|| "Team not found".to_string())?;

        // Update roles first if provided
        if let Some(roles) = request.roles {
            stored.spec.roles = roles;
        }

        // Validate lead_role_id exists in roles if provided
        if let Some(ref lead_role_id) = request.lead_role_id {
            let role_exists = stored.spec.roles.iter().any(|r| &r.id == lead_role_id);
            if !role_exists {
                return Err(format!(
                    "Lead role '{}' does not exist in team roles",
                    lead_role_id
                ));
            }
            stored.spec.lead_role_id = lead_role_id.clone();
        }

        if let Some(name) = request.name {
            stored.spec.name = name;
        }
        if let Some(description) = request.description {
            stored.spec.description = description;
        }

        Ok(stored.spec.clone())
    }

    pub fn delete_team(&self, team_id: &str) -> Result<(), ()> {
        let mut teams = self.inner.teams.lock().unwrap_or_else(|e| e.into_inner());

        teams.remove(team_id).ok_or(())?;
        Ok(())
    }

    pub fn get_current_user_permissions(&self) -> Result<UserPermissionsResponseDto, ()> {
        self.get_current_user_permissions_for_user(&self.default_current_user())
    }

    pub fn get_current_user_permissions_for_user(
        &self,
        current_user: &CurrentUser,
    ) -> Result<UserPermissionsResponseDto, ()> {
        use decacan_runtime::workspace::rbac::WorkspaceRole;

        let role = WorkspaceRole::Owner;
        let permissions: Vec<PermissionDto> = role
            .permissions()
            .into_iter()
            .map(|p| PermissionDto {
                resource: format!("{:?}", p.resource).to_lowercase(),
                action: format!("{:?}", p.action).to_lowercase(),
            })
            .collect();
        let studio_playbooks = self.can_manage_studio_playbooks(current_user);

        Ok(UserPermissionsResponseDto {
            user_id: current_user.user_id.clone(),
            console_home: true,
            studio_playbooks,
            global_permissions: permissions.clone(),
            workspace_permissions: vec![WorkspacePermissionDto {
                workspace_id: current_user.default_workspace_id.clone(),
                role: "owner".to_string(),
                permissions: permissions.clone(),
            }],
        })
    }

    pub fn check_permission(
        &self,
        workspace_id: Option<&str>,
        resource: &str,
        action: &str,
    ) -> bool {
        // For now, always allow if workspace_id is provided
        // In production, check actual membership and permissions
        workspace_id.is_some()
    }

    fn can_manage_studio_playbooks(&self, current_user: &CurrentUser) -> bool {
        use decacan_runtime::workspace::rbac::WorkspaceRole;

        self.inner.member_service.has_role(
            &current_user.default_workspace_id,
            &current_user.user_id,
            WorkspaceRole::Owner,
        ) || self.inner.member_service.has_role(
            &current_user.default_workspace_id,
            &current_user.user_id,
            WorkspaceRole::Admin,
        )
    }

    pub fn list_tasks(&self) -> Vec<TaskDto> {
        let mut tasks = self
            .inner
            .tasks
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .values()
            .map(task_to_dto)
            .collect::<Vec<_>>();
        sort_tasks_newest_first(&mut tasks);
        tasks
    }

    pub fn list_tasks_in_workspace(&self, workspace_id: &str) -> Vec<TaskDto> {
        let mut tasks = self
            .inner
            .tasks
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .values()
            .filter(|task| task.workspace_id == workspace_id)
            .map(task_to_dto)
            .collect::<Vec<_>>();
        sort_tasks_newest_first(&mut tasks);
        tasks
    }

    pub fn get_task(&self, task_id: &str) -> Option<TaskDto> {
        self.inner
            .tasks
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .get(task_id)
            .map(task_to_dto)
    }

    pub fn get_task_detail(&self, task_id: &str) -> Option<TaskDetailDto> {
        let task = self
            .inner
            .tasks
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .get(task_id)
            .cloned()?;
        let plan = plan_for_task(&task);

        Some(TaskDetailDto {
            task: TaskSummaryDto {
                id: task.id.clone(),
                workspace_id: task.workspace_id.clone(),
                playbook_key: task.playbook_key.clone(),
                input: task.input_payload.clone(),
                status: task.status.clone(),
                status_summary: task.status_summary.clone(),
                artifact_id: task.artifact_id.clone(),
            },
            plan,
            approvals: self.list_approvals_for_task(task_id),
            artifacts: self.list_artifacts_for_task(task_id),
            timeline: self.list_task_events(task_id),
            collaboration: TaskCollaborationDto {
                agent_messages: task.agent_messages.clone(),
                instruction_actions: instruction_actions(),
            },
        })
    }

    pub fn get_task_detail_in_workspace(
        &self,
        workspace_id: &str,
        task_id: &str,
    ) -> Option<TaskDetailDto> {
        let detail = self.get_task_detail(task_id)?;
        if detail.task.workspace_id != workspace_id {
            return None;
        }
        Some(detail)
    }

    pub fn has_task(&self, task_id: &str) -> bool {
        self.inner
            .tasks
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .contains_key(task_id)
    }

    pub fn has_task_in_workspace(&self, workspace_id: &str, task_id: &str) -> bool {
        self.inner
            .tasks
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .get(task_id)
            .map(|task| task.workspace_id == workspace_id)
            .unwrap_or(false)
    }

    pub async fn create_task_execution(
        &self,
        request: CreateTaskRequest,
    ) -> Result<CreateTaskAcceptedResponse, CreateTaskError> {
        if !self.is_known_workspace(&request.workspace_id) {
            return Err(CreateTaskError::WorkspaceNotFound);
        }

        let prepared = self.prepare_execution(&request)?;
        let artifact = prepared.pending_artifact.clone();
        let artifact_id = artifact.id.clone();
        let event = self.new_task_event(
            &prepared.task_id,
            "task.accepted",
            "Task accepted by API".to_owned(),
        );

        self.inner
            .artifacts
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .insert(
                artifact_id.clone(),
                StoredArtifact {
                    dto: artifact,
                    physical_path: prepared
                        .workspace_root
                        .join(&prepared.pending_artifact.canonical_path),
                },
            );

        self.inner
            .tasks
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .insert(
                prepared.task_id.clone(),
                StoredTask {
                    id: prepared.task_id.clone(),
                    workspace_id: request.workspace_id.clone(),
                    playbook_key: prepared.runtime_run.playbook_snapshot.key.clone(),
                    input_payload: request.input_payload,
                    playbook_handle_id: request.playbook_handle_id,
                    playbook_version_id: request.playbook_version_id,
                    artifact_id: Some(artifact_id),
                    status: "accepted".to_owned(),
                    status_summary: "Task accepted and queued for runtime execution".to_owned(),
                    agent_messages: vec![TaskAgentMessageDto {
                        id: self.next_id("agent-message"),
                        task_id: prepared.task_id.clone(),
                        role: "agent".to_owned(),
                        summary: "Current task status".to_owned(),
                        detail: "Task accepted and queued for runtime execution".to_owned(),
                    }],
                    runtime_task: prepared.runtime_task.clone(),
                    runtime_run: prepared.runtime_run.clone(),
                },
            );
        self.append_task_event(event);
        let task_id = prepared.task_id.clone();
        let coordinator = self.execution_coordinator.get().expect("coordinator initialized");
        if let Err(e) = coordinator
            .launch(
                &prepared.task_id,
                &prepared.runtime_run.id,
                prepared.playbook_snapshot,
                ExecutionContext::new(&prepared.input_contents),
            )
            .await
        {
            self.append_task_event(self.new_task_event(
                &prepared.task_id,
                "task.launch_failed",
                format!("Failed to launch execution: {e}"),
            ));
        }

        Ok(CreateTaskAcceptedResponse {
            task: self
                .get_task(&task_id)
                .expect("newly created task should exist"),
            events_url: format!("/api/tasks/{task_id}/events"),
            stream_url: format!("/api/tasks/{task_id}/events/stream"),
        })
    }

    pub fn create_task_preview(
        &self,
        request: TaskPreviewRequest,
    ) -> Result<TaskPreviewDto, CreateTaskError> {
        if !self.is_known_workspace(&request.workspace_id) {
            return Err(CreateTaskError::WorkspaceNotFound);
        }

        let (playbook_key, _) = self.resolve_bound_playbook_version_ids(
            &request.playbook_handle_id,
            &request.playbook_version_id,
        )?;
        let preview =
            preview_registered_playbook(&playbook_key).map_err(map_registered_playbook_error)?;

        Ok(TaskPreviewDto {
            preview_id: self.next_id("preview"),
            plan_steps: preview.plan_steps,
            expected_artifact_label: preview.expected_artifact_label,
            expected_artifact_path: preview.expected_artifact_path,
            will_auto_start: true,
        })
    }

    pub fn get_artifact(&self, artifact_id: &str) -> Option<ArtifactDto> {
        self.inner
            .artifacts
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .get(artifact_id)
            .map(|artifact| artifact.dto.clone())
    }

    pub fn get_artifact_content(&self, artifact_id: &str) -> Option<ArtifactContentDto> {
        let artifact = self
            .inner
            .artifacts
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .get(artifact_id)
            .cloned()?;
        let content = std::fs::read_to_string(&artifact.physical_path).ok()?;

        Some(ArtifactContentDto {
            artifact_id: artifact.dto.id,
            content_type: "text/markdown".to_owned(),
            content,
        })
    }

    pub fn put_approval(&self, approval: ApprovalDto) {
        self.inner
            .approvals
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .insert(approval.id.clone(), approval);
    }

    pub fn get_approval(&self, approval_id: &str) -> Option<ApprovalDto> {
        self.inner
            .approvals
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .get(approval_id)
            .cloned()
    }

    pub fn update_approval<F>(&self, approval_id: &str, mutate: F) -> Option<ApprovalDto>
    where
        F: FnOnce(&mut ApprovalDto),
    {
        let mut approvals = self
            .inner
            .approvals
            .lock()
            .unwrap_or_else(|e| e.into_inner());
        let approval = approvals.get_mut(approval_id)?;
        mutate(approval);
        Some(approval.clone())
    }

    pub fn list_approvals_for_task(&self, task_id: &str) -> Vec<ApprovalDto> {
        self.inner
            .approvals
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .values()
            .filter(|approval| approval.task_id == task_id)
            .cloned()
            .collect()
    }

    pub fn append_task_event(&self, event: TaskEventEnvelopeDto) {
        self.inner
            .task_events
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .entry(event.task_id.clone())
            .or_default()
            .push(event.clone());
        let _ = self.inner.task_event_bus.send(event);
    }

    pub fn list_task_events(&self, task_id: &str) -> Vec<TaskEventEnvelopeDto> {
        self.inner
            .task_events
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .get(task_id)
            .cloned()
            .unwrap_or_default()
    }

    pub fn subscribe_task_events(&self) -> broadcast::Receiver<TaskEventEnvelopeDto> {
        self.inner.task_event_bus.subscribe()
    }

    pub fn list_artifacts_for_task(&self, task_id: &str) -> Vec<ArtifactDto> {
        self.inner
            .artifacts
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .values()
            .filter(|artifact| artifact.dto.task_id == task_id)
            .map(|artifact| artifact.dto.clone())
            .collect()
    }

    pub fn is_known_workspace(&self, workspace_id: &str) -> bool {
        self.inner
            .workspaces
            .iter()
            .any(|workspace| workspace.id == workspace_id)
    }

    pub fn is_known_playbook(&self, playbook_key: &str) -> bool {
        self.inner
            .playbooks
            .iter()
            .any(|playbook| playbook.key == playbook_key)
    }

    pub fn next_task_sequence(&self, task_id: &str) -> u64 {
        self.list_task_events(task_id).len() as u64 + 1
    }

    pub fn append_instruction_message(
        &self,
        task_id: &str,
        instruction_key: &str,
    ) -> Option<TaskAgentMessageDto> {
        let definition = find_instruction_definition(instruction_key)?;
        let message = TaskAgentMessageDto {
            id: self.next_id("agent-message"),
            task_id: task_id.to_owned(),
            role: "agent".to_owned(),
            summary: definition.summary.to_owned(),
            detail: definition.detail.to_owned(),
        };

        let mut tasks = self.inner.tasks.lock().unwrap_or_else(|e| e.into_inner());
        let task = tasks.get_mut(task_id)?;
        task.agent_messages.push(message.clone());

        Some(message)
    }

    pub async fn retry_task(
        &self,
        task_id: &str,
        request: RetryTaskRequest,
    ) -> Option<TaskSummaryDto> {
        let existing = self
            .inner
            .tasks
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .get(task_id)
            .cloned()?;
        let create_request = CreateTaskRequest {
            workspace_id: existing.workspace_id.clone(),
            playbook_handle_id: existing.playbook_handle_id.clone(),
            playbook_version_id: existing.playbook_version_id.clone(),
            input_payload: existing.input_payload.clone(),
        };
        let prepared = self
            .prepare_execution_with_task_id(task_id.to_owned(), &create_request)
            .ok()?;

        self.inner
            .tasks
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .insert(
                task_id.to_owned(),
                StoredTask {
                    id: task_id.to_owned(),
                    workspace_id: existing.workspace_id.clone(),
                    playbook_key: existing.playbook_key.clone(),
                    input_payload: existing.input_payload.clone(),
                    playbook_handle_id: existing.playbook_handle_id.clone(),
                    playbook_version_id: existing.playbook_version_id.clone(),
                    artifact_id: Some(prepared.pending_artifact.id.clone()),
                    status: "accepted".to_owned(),
                    status_summary: format!("Task retry requested: {}", request.note),
                    agent_messages: {
                        let mut messages = existing.agent_messages.clone();
                        messages.push(TaskAgentMessageDto {
                            id: self.next_id("agent-message"),
                            task_id: task_id.to_owned(),
                            role: "agent".to_owned(),
                            summary: "Task retried".to_owned(),
                            detail: format!("Task retry requested: {}", request.note),
                        });
                        messages
                    },
                    runtime_task: prepared.runtime_task.clone(),
                    runtime_run: prepared.runtime_run.clone(),
                },
            );

        self.inner
            .artifacts
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .retain(|_, artifact| artifact.dto.task_id != task_id);
        let pending = prepared.pending_artifact.clone();
        self.inner
            .artifacts
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .insert(
                pending.id.clone(),
                StoredArtifact {
                    physical_path: prepared.workspace_root.join(&pending.canonical_path),
                    dto: pending,
                },
            );

        self.append_task_event(self.new_task_event(
            task_id,
            "task.retried",
            format!("Task retry requested: {}", request.note),
        ));
        let coordinator = self.execution_coordinator.get().expect("coordinator initialized");
        if let Err(e) = coordinator
            .launch(
                &prepared.task_id,
                &prepared.runtime_run.id,
                prepared.playbook_snapshot,
                ExecutionContext::new(&prepared.input_contents),
            )
            .await
        {
            self.append_task_event(self.new_task_event(
                &prepared.task_id,
                "task.launch_failed",
                format!("Failed to launch execution: {e}"),
            ));
        }

        self.get_task_detail(task_id).map(|detail| detail.task)
    }

    fn prepare_execution(
        &self,
        request: &CreateTaskRequest,
    ) -> Result<PreparedExecution, CreateTaskError> {
        self.prepare_execution_with_task_id(self.next_id("task"), request)
    }

    fn prepare_execution_with_task_id(
        &self,
        task_id: String,
        request: &CreateTaskRequest,
    ) -> Result<PreparedExecution, CreateTaskError> {
        let (playbook_key, version) = self.resolve_bound_playbook_version(request)?;
        let run_id = self.next_id("run");
        let workspace_root = self
            .inner
            .default_workspace_root
            .join("tasks")
            .join(&task_id);
        let prepared_run = prepare_registered_playbook_run(RegisteredPlaybookExecutionRequest {
            task_id: task_id.clone(),
            run_id,
            workspace_id: request.workspace_id.clone(),
            workspace_root: workspace_root.display().to_string(),
            playbook_key,
            playbook_version_id: version.playbook_version_id,
        })
        .map_err(map_registered_playbook_error)?;

        let playbook_snapshot = PlaybookSnapshot {
            playbook_handle_id: request.playbook_handle_id.clone(),
            version_id: version.playbook_version_id.to_string(),
            workflow: CompiledWorkflow {
                steps: vec![],
                entry_points: vec![],
            },
            capability_refs: vec![],
            execution_profile: ExecutionProfile {
                mode: "single".to_string(),
                timeout_seconds: 3600,
                max_retries: 3,
            },
        };

        Ok(PreparedExecution {
            task_id,
            workspace_root: workspace_root.clone(),
            input_path: workspace_root.join("notes.md"),
            input_contents: request.input_payload.clone(),
            pending_artifact: ArtifactDto {
                id: prepared_run.pending_artifact.id,
                task_id: prepared_run.task.id.clone(),
                label: prepared_run.pending_artifact.label,
                canonical_path: prepared_run.pending_artifact.canonical_path,
                status: "pending".to_owned(),
            },
            runtime_task: prepared_run.task,
            runtime_run: prepared_run.run,
            playbook_snapshot,
        })
    }

    fn resolve_bound_playbook_version(
        &self,
        request: &CreateTaskRequest,
    ) -> Result<(String, PlaybookVersion), CreateTaskError> {
        self.resolve_bound_playbook_version_ids(
            &request.playbook_handle_id,
            &request.playbook_version_id,
        )
    }

    fn resolve_bound_playbook_version_ids(
        &self,
        playbook_handle_id: &str,
        playbook_version_id: &str,
    ) -> Result<(String, PlaybookVersion), CreateTaskError> {
        let playbooks = self
            .inner
            .lifecycle_playbooks
            .lock()
            .unwrap_or_else(|e| e.into_inner());
        let stored = playbooks
            .get(playbook_handle_id)
            .ok_or(CreateTaskError::InvalidPlaybookBinding)?;
        let version = stored
            .versions
            .iter()
            .find(|version| version.playbook_version_id.to_string() == playbook_version_id)
            .ok_or(CreateTaskError::InvalidPlaybookBinding)?;
        let store_entry_id = stored
            .handle
            .source_store_entry_id
            .as_deref()
            .ok_or(CreateTaskError::InvalidPlaybookBinding)?;
        let playbook_key = playbook_key_for_store_entry(store_entry_id)
            .ok_or(CreateTaskError::InvalidPlaybookBinding)?;

        if version.playbook_handle_id != stored.handle.playbook_handle_id {
            return Err(CreateTaskError::InvalidPlaybookBinding);
        }

        Ok((playbook_key.to_owned(), version.clone()))
    }

    fn spawn_execution(&self, prepared: PreparedExecution) {
        let state = self.clone();
        let fallback_task = prepared.runtime_task.clone();
        let fallback_run = prepared.runtime_run.clone();
        let run_id = prepared.runtime_run.id.clone();
        tokio::spawn(async move {
            state.append_task_event(state.new_task_event(
                &prepared.task_id,
                "task.running",
                "Runtime execution started".to_owned(),
            ));
            state.update_task_status(
                &prepared.task_id,
                "running",
                "Runtime execution is in progress".to_owned(),
                prepared.runtime_task.clone(),
                prepared.runtime_run.clone(),
            );

            let task_id = prepared.task_id.clone();
            let outcome = tokio::task::spawn_blocking(move || run_runtime_execution(prepared))
                .await
                .unwrap_or_else(|error| ExecutionOutcome {
                    task: fallback_task,
                    run: fallback_run,
                    result: Err(format!("background execution join failed: {error}")),
                });

            state.finish_execution(task_id, &run_id, outcome);
        });
    }

    fn finish_execution(&self, task_id: String, run_id: &str, outcome: ExecutionOutcome) {
        if !self.is_current_run(&task_id, run_id) {
            return;
        }

        match outcome.result {
            Ok(result) => {
                self.update_task_status(
                    &task_id,
                    task_status_to_dto(result.task.status),
                    "Runtime execution completed successfully".to_owned(),
                    result.task.clone(),
                    result.run.clone(),
                );
                self.store_runtime_artifact(result.primary_artifact.clone());
                if let Some(backup_artifact) = result.backup_artifact.clone() {
                    self.store_runtime_artifact(backup_artifact);
                }
                self.append_task_event(self.runtime_event_to_envelope(result.projected_task_event));
                self.append_task_event(self.new_task_event(
                    &task_id,
                    "task.succeeded",
                    "Task succeeded".to_owned(),
                ));
            }
            Err(reason) => {
                let status = if outcome.task.status == TaskStatus::Failed {
                    task_status_to_dto(outcome.task.status)
                } else {
                    "failed"
                };
                self.update_task_status(
                    &task_id,
                    status,
                    format!("Runtime execution failed: {reason}"),
                    outcome.task,
                    outcome.run,
                );
                self.append_task_event(self.new_task_event(
                    &task_id,
                    "task.failed",
                    format!("Runtime execution failed: {reason}"),
                ));
            }
        }
    }

    fn update_task_status(
        &self,
        task_id: &str,
        status: &str,
        status_summary: String,
        runtime_task: Task,
        runtime_run: Run,
    ) {
        if let Some(task) = self
            .inner
            .tasks
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .get_mut(task_id)
        {
            task.status = status.to_owned();
            task.status_summary = status_summary;
            task.runtime_task = runtime_task;
            task.runtime_run = runtime_run;
        }
    }

    fn store_runtime_artifact(&self, artifact: RuntimeArtifact) {
        self.inner
            .artifacts
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .insert(
                artifact.id.clone(),
                StoredArtifact {
                    physical_path: PathBuf::from(&artifact.physical_path),
                    dto: ArtifactDto {
                        id: artifact.id,
                        task_id: artifact.task_id,
                        label: artifact.label,
                        canonical_path: artifact.canonical_path,
                        status: "ready".to_owned(),
                    },
                },
            );
    }

    fn runtime_event_to_envelope(&self, event: TaskEvent) -> TaskEventEnvelopeDto {
        let message = match event.payload {
            TaskEventPayload::ArtifactReady { canonical_path, .. } => {
                format!("Artifact ready at {canonical_path}")
            }
            TaskEventPayload::ExecutionStarted { run_id } => {
                format!("Execution started: {run_id}")
            }
            TaskEventPayload::PhaseChanged { phase } => {
                format!("Phase changed to {phase}")
            }
            TaskEventPayload::StepStarted { step_id, .. } => {
                format!("Step started: {step_id}")
            }
            TaskEventPayload::StepCompleted { .. } => "Step completed".to_owned(),
            TaskEventPayload::ToolPending { tool_name, .. } => {
                format!("Tool pending: {tool_name}")
            }
            TaskEventPayload::ToolFinished { tool_name, .. } => {
                format!("Tool finished: {tool_name}")
            }
            TaskEventPayload::ApprovalCreated { approval_id, .. } => {
                format!("Approval created: {approval_id}")
            }
            TaskEventPayload::InputRequired { .. } => "Input required".to_owned(),
            TaskEventPayload::RunCompleted => "Run completed".to_owned(),
            TaskEventPayload::RunFailed { reason } => {
                format!("Run failed: {reason}")
            }
            TaskEventPayload::Heartbeat => "Heartbeat".to_owned(),
        };

        TaskEventEnvelopeDto {
            event_id: self.next_id("event"),
            task_id: event.task_id.clone(),
            sequence: self.next_task_sequence(&event.task_id),
            event_type: event.event_type,
            snapshot_version: self.next_task_sequence(&event.task_id),
            message,
        }
    }

    fn new_task_event(
        &self,
        task_id: &str,
        event_type: &str,
        message: String,
    ) -> TaskEventEnvelopeDto {
        let sequence = self.next_task_sequence(task_id);
        TaskEventEnvelopeDto {
            event_id: self.next_id("event"),
            task_id: task_id.to_owned(),
            sequence,
            event_type: event_type.to_owned(),
            snapshot_version: sequence,
            message,
        }
    }

    fn is_current_run(&self, task_id: &str, run_id: &str) -> bool {
        self.inner
            .tasks
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .get(task_id)
            .map(|task| task.runtime_run.id == run_id)
            .unwrap_or(false)
    }

    fn update_task_status_only(&self, task_id: &str, status: &str, status_summary: String) {
        if let Some(task) = self
            .inner
            .tasks
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .get_mut(task_id)
        {
            task.status = status.to_owned();
            task.status_summary = status_summary;
        }
    }
}

#[async_trait]
impl ExecutionIndex for AppState {
    async fn register(
        &self,
        execution_id: &str,
        task_id: &str,
        run_id: &str,
    ) -> Result<(), CoordinatorError> {
        let mut mappings = self
            .inner
            .execution_mappings
            .lock()
            .unwrap_or_else(|e| e.into_inner());
        mappings.insert(
            execution_id.to_string(),
            decacan_runtime::execution::coordinator::ExecutionMapping {
                task_id: task_id.to_string(),
                run_id: run_id.to_string(),
            },
        );
        Ok(())
    }

    async fn resolve(
        &self,
        execution_id: &str,
    ) -> Result<Option<decacan_runtime::execution::coordinator::ExecutionMapping>, CoordinatorError> {
        let mappings = self
            .inner
            .execution_mappings
            .lock()
            .unwrap_or_else(|e| e.into_inner());
        Ok(mappings.get(execution_id).cloned())
    }

    async fn mark_completed(&self, _execution_id: &str) -> Result<(), CoordinatorError> {
        Ok(())
    }

    async fn mark_failed(&self, _execution_id: &str) -> Result<(), CoordinatorError> {
        Ok(())
    }
}

#[async_trait]
impl TaskStore for AppState {
    async fn mark_running(&self, task_id: &str) -> Result<(), CoordinatorError> {
        self.update_task_status_only(
            task_id,
            "running",
            "Runtime execution is in progress".to_owned(),
        );
        Ok(())
    }

    async fn block_on_approval(
        &self,
        task_id: &str,
        approval_id: &str,
    ) -> Result<(), CoordinatorError> {
        self.update_task_status_only(
            task_id,
            "blocked_on_approval",
            format!("Waiting on approval: {approval_id}"),
        );
        Ok(())
    }

    async fn block_on_input(&self, task_id: &str, prompt: &str) -> Result<(), CoordinatorError> {
        self.update_task_status_only(
            task_id,
            "blocked_on_input",
            format!("Waiting for input: {prompt}"),
        );
        Ok(())
    }

    async fn complete(
        &self,
        task_id: &str,
        _outputs: &[StepOutput],
    ) -> Result<(), CoordinatorError> {
        self.update_task_status_only(
            task_id,
            "succeeded",
            "Runtime execution completed successfully".to_owned(),
        );
        self.append_task_event(self.new_task_event(
            task_id,
            "task.succeeded",
            "Task succeeded".to_owned(),
        ));
        Ok(())
    }

    async fn fail(
        &self,
        task_id: &str,
        reason: &str,
        _recoverable: bool,
    ) -> Result<(), CoordinatorError> {
        self.update_task_status_only(
            task_id,
            "failed",
            format!("Runtime execution failed: {reason}"),
        );
        self.append_task_event(self.new_task_event(
            task_id,
            "task.failed",
            format!("Runtime execution failed: {reason}"),
        ));
        Ok(())
    }

    async fn update_phase(&self, task_id: &str, phase: &str) -> Result<(), CoordinatorError> {
        self.update_task_status_only(task_id, "running", format!("Phase: {phase}"));
        Ok(())
    }

    async fn record_pending_tool(
        &self,
        task_id: &str,
        event: &ExecutionEvent,
    ) -> Result<(), CoordinatorError> {
        let msg = format!("Pending high-risk tool: {:?}", event);
        self.append_task_event(self.new_task_event(task_id, "task.tool_pending", msg));
        Ok(())
    }

    async fn record_file_write(
        &self,
        task_id: &str,
        path: &str,
        size_bytes: u64,
        _content_hash: &str,
    ) -> Result<(), CoordinatorError> {
        let msg = format!("File write: {path} ({size_bytes} bytes)");
        self.append_task_event(self.new_task_event(task_id, "task.file_write", msg));
        Ok(())
    }
}

#[async_trait]
impl ApprovalStore for AppState {
    async fn create_pending(
        &self,
        task_id: &str,
        _run_id: &str,
        approval_id: &str,
        prompt: &str,
        _risk_level: &RiskLevel,
    ) -> Result<(), CoordinatorError> {
        let (workspace_id, playbook_key) = {
            let tasks = self.inner.tasks.lock().unwrap_or_else(|e| e.into_inner());
            match tasks.get(task_id) {
                Some(task) => (task.workspace_id.clone(), task.playbook_key.clone()),
                None => {
                    return Err(CoordinatorError::Store(format!(
                        "Task not found: {task_id}"
                    )))
                }
            }
        };
        self.put_approval(ApprovalDto {
            id: approval_id.to_string(),
            workspace_id,
            task_id: task_id.to_string(),
            task_playbook_key: playbook_key,
            decision: "pending".to_string(),
            comment: Some(prompt.to_string()),
            status: "pending".to_string(),
        });
        Ok(())
    }
}

#[async_trait]
impl ArtifactStore for AppState {
    async fn register(
        &self,
        task_id: &str,
        _run_id: &str,
        artifact_id: &str,
        artifact_name: &str,
        _artifact_type: &str,
        canonical_path: &str,
    ) -> Result<(), CoordinatorError> {
        let workspace_root = self
            .inner
            .default_workspace_root
            .join("tasks")
            .join(task_id);
        self.inner
            .artifacts
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .insert(
                artifact_id.to_string(),
                StoredArtifact {
                    dto: ArtifactDto {
                        id: artifact_id.to_string(),
                        task_id: task_id.to_string(),
                        label: artifact_name.to_string(),
                        canonical_path: canonical_path.to_string(),
                        status: "ready".to_owned(),
                    },
                    physical_path: workspace_root.join(canonical_path),
                },
            );
        Ok(())
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CreateTaskError {
    WorkspaceNotFound,
    UnknownPlaybook,
    InvalidPlaybookBinding,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum PlaybookLifecycleError {
    StoreEntryNotFound,
    HandleNotFound,
    InvalidUpdate,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PublishPlaybookOutcome {
    pub publishable: bool,
    pub response: PublishPlaybookResponseDto,
}

fn plan_for_task(task: &StoredTask) -> TaskPlanDto {
    let steps = task
        .runtime_run
        .workflow_snapshot
        .steps
        .iter()
        .map(|step| step.purpose.clone())
        .collect::<Vec<_>>();

    let current_step_index = if task.status == "succeeded" || task.status == "failed" {
        steps.len().saturating_sub(1)
    } else {
        task.runtime_run
            .step_cursor
            .min(steps.len().saturating_sub(1))
    };

    TaskPlanDto {
        steps,
        current_step_index,
        status: match task.status.as_str() {
            "accepted" => "ready".to_owned(),
            other => other.to_owned(),
        },
    }
}

fn task_to_dto(task: &StoredTask) -> TaskDto {
    TaskDto {
        id: task.id.clone(),
        workspace_id: task.workspace_id.clone(),
        playbook_key: task.playbook_key.clone(),
        input: task.input_payload.clone(),
        status: task.status.clone(),
        status_summary: task.status_summary.clone(),
        artifact_id: task.artifact_id.clone(),
    }
}

fn playbook_key_for_store_entry(store_entry_id: &str) -> Option<&'static str> {
    match store_entry_id {
        "store-entry-summary" => Some(SUMMARY_PLAYBOOK_KEY),
        "store-entry-discovery" => Some(DISCOVER_TOPICS_PLAYBOOK_KEY),
        _ => None,
    }
}

fn builtin_store_entries() -> Vec<StoreEntry> {
    list_registered_playbooks()
        .into_iter()
        .filter_map(|playbook| match playbook.key.as_str() {
            SUMMARY_PLAYBOOK_KEY => Some(StoreEntry {
                store_entry_id: "store-entry-summary".to_owned(),
                title: playbook.title,
                summary: "Builtin summary playbook".to_owned(),
                category: "summary".to_owned(),
                tags: vec!["builtin".to_owned(), "official".to_owned()],
                mode: playbook.mode,
                official_version: "builtin-v1".to_owned(),
                embedded_spec_ref: "builtin://summary-playbook".to_owned(),
            }),
            DISCOVER_TOPICS_PLAYBOOK_KEY => Some(StoreEntry {
                store_entry_id: "store-entry-discovery".to_owned(),
                title: playbook.title,
                summary: "Builtin discovery playbook".to_owned(),
                category: "discovery".to_owned(),
                tags: vec!["builtin".to_owned(), "official".to_owned()],
                mode: playbook.mode,
                official_version: "builtin-v1".to_owned(),
                embedded_spec_ref: "builtin://discovery-playbook".to_owned(),
            }),
            _ => None,
        })
        .collect()
}

fn initial_draft_document(store_entry: &StoreEntry) -> String {
    format!("metadata:\n  title: {}\n", store_entry.title)
}

fn build_playbook_handle(
    playbook_handle_id: String,
    source_store_entry_id: String,
    title: String,
) -> PlaybookHandle {
    let now = SystemClock::new().now_utc();
    PlaybookHandle {
        playbook_handle_id,
        owner_scope: PlaybookOwnerScope::LocalPrivate,
        origin: PlaybookHandleOrigin::OfficialFork,
        source_store_entry_id: Some(source_store_entry_id),
        title,
        created_at: now,
        updated_at: now,
    }
}

fn build_playbook_draft(
    draft_id: String,
    playbook_handle_id: String,
    spec_document: String,
) -> PlaybookDraft {
    let now = SystemClock::new().now_utc();
    PlaybookDraft {
        draft_id,
        playbook_handle_id,
        spec_document,
        last_saved_at: now,
        last_validated_at: None,
        validation_state: DraftValidationState::NeedsReview,
    }
}

fn store_entry_to_dto(store_entry: StoreEntry) -> StoreEntryDto {
    StoreEntryDto {
        store_entry_id: store_entry.store_entry_id,
        title: store_entry.title,
        summary: store_entry.summary,
        category: store_entry.category,
        tags: store_entry.tags,
        mode: store_entry.mode,
        official_version: store_entry.official_version,
    }
}

fn playbook_handle_to_dto(handle: PlaybookHandle) -> PlaybookHandleDto {
    PlaybookHandleDto {
        playbook_handle_id: handle.playbook_handle_id,
        owner_scope: handle.owner_scope,
        origin: handle.origin,
        source_store_entry_id: handle.source_store_entry_id,
        title: handle.title,
    }
}

fn playbook_draft_to_dto(draft: PlaybookDraft) -> PlaybookDraftDto {
    PlaybookDraftDto {
        draft_id: draft.draft_id,
        playbook_handle_id: draft.playbook_handle_id,
        spec_document: draft.spec_document,
        validation_state: draft.validation_state,
    }
}

fn draft_health_report_to_dto(report: DraftHealthReport) -> DraftHealthReportDto {
    DraftHealthReportDto {
        publishable: report.publishable,
        summary: report.summary,
        issues: report
            .issues
            .into_iter()
            .map(draft_health_issue_to_dto)
            .collect(),
    }
}

fn draft_health_issue_to_dto(issue: DraftHealthIssue) -> DraftHealthIssueDto {
    DraftHealthIssueDto {
        severity: issue.severity,
        domain: issue.domain,
        kind: issue.kind,
        location: issue.location,
        message: issue.message,
        related_ref: issue.related_ref,
    }
}

fn playbook_version_to_dto(version: PlaybookVersion) -> PlaybookVersionDto {
    PlaybookVersionDto {
        playbook_version_id: version.playbook_version_id.to_string(),
        playbook_handle_id: version.playbook_handle_id,
        version_number: version.version_number,
    }
}

fn playbook_to_dto(playbook: decacan_runtime::playbook::entity::Playbook) -> PlaybookDto {
    let summary = match playbook.key.as_str() {
        SUMMARY_PLAYBOOK_KEY => {
            "Create a concise summary from markdown notes in the selected workspace."
        }
        DISCOVER_TOPICS_PLAYBOOK_KEY => {
            "Cluster markdown notes into themes and open questions for follow-up work."
        }
        _ => "Run a workspace task with a formal artifact output.",
    };
    let preview = preview_registered_playbook(&playbook.key).ok();
    let expected_output_label = preview
        .as_ref()
        .map(|preview| preview.expected_artifact_label.as_str())
        .unwrap_or("Result document");
    let expected_output_path = preview
        .as_ref()
        .map(|preview| preview.expected_artifact_path.as_str())
        .unwrap_or("output/result.md");

    PlaybookDto {
        key: playbook.key,
        title: playbook.title,
        summary: summary.to_owned(),
        mode_label: match playbook.mode {
            PlaybookMode::Standard => "标准模式".to_owned(),
            PlaybookMode::Discovery => "发现模式".to_owned(),
        },
        expected_output_label: expected_output_label.to_owned(),
        expected_output_path: expected_output_path.to_owned(),
    }
}

fn task_status_to_dto(status: TaskStatus) -> &'static str {
    match status {
        TaskStatus::Created => "accepted",
        TaskStatus::Planning => "planning",
        TaskStatus::Running => "running",
        TaskStatus::Paused => "paused",
        TaskStatus::Succeeded => "succeeded",
        TaskStatus::Failed => "failed",
        TaskStatus::Cancelled => "cancelled",
    }
}

fn instruction_actions() -> Vec<TaskInstructionActionDto> {
    instruction_definitions()
        .iter()
        .map(|definition| definition.action.clone())
        .collect()
}

struct InstructionDefinition {
    action: TaskInstructionActionDto,
    summary: &'static str,
    detail: &'static str,
}

fn instruction_definitions() -> Vec<InstructionDefinition> {
    vec![
        InstructionDefinition {
            action: TaskInstructionActionDto {
                key: "status-brief".to_owned(),
                label: "Status brief".to_owned(),
                instruction: "Provide a concise status update for this task.".to_owned(),
            },
            summary: "Status brief ready",
            detail: "Task remains on track. Continue current execution and monitor pending approvals.",
        },
        InstructionDefinition {
            action: TaskInstructionActionDto {
                key: "risk-check".to_owned(),
                label: "Risk check".to_owned(),
                instruction: "List blockers or risks that could delay completion.".to_owned(),
            },
            summary: "Risk check ready",
            detail: "Watch for pending approvals and unresolved artifact validation before final completion.",
        },
        InstructionDefinition {
            action: TaskInstructionActionDto {
                key: "next-step-options".to_owned(),
                label: "Next-step options".to_owned(),
                instruction: "Suggest the next structured actions for this task.".to_owned(),
            },
            summary: "Next-step options ready",
            detail: "1) Confirm latest approval status. 2) Review output artifact. 3) Close with final timeline check.",
        },
    ]
}

fn find_instruction_definition(instruction_key: &str) -> Option<InstructionDefinition> {
    instruction_definitions()
        .into_iter()
        .find(|definition| definition.action.key == instruction_key)
}

fn run_runtime_execution(prepared: PreparedExecution) -> ExecutionOutcome {
    let filesystem = LocalFilesystem::new();
    let storage = MemoryStorage::new();
    let clock = SystemClock::new();
    let mut task = prepared.runtime_task;
    let mut run = prepared.runtime_run;

    let result = (|| -> Result<SummaryPlaybookE2eResult, String> {
        std::fs::create_dir_all(&prepared.workspace_root).map_err(|error| error.to_string())?;
        filesystem
            .write_string(&prepared.input_path, &prepared.input_contents)
            .map_err(|error| error.to_string())?;

        execute_registered_playbook_run(&mut task, &mut run, &filesystem, &storage, &clock)
            .map_err(summary_execution_error_to_string)
    })();

    ExecutionOutcome { task, run, result }
}

fn summary_execution_error_to_string(error: SummaryPlaybookExecutionError) -> String {
    match error {
        SummaryPlaybookExecutionError::Task(error) => format!("task transition failed: {error:?}"),
        SummaryPlaybookExecutionError::Routine(error) => error,
    }
}

fn map_registered_playbook_error(error: RegisteredPlaybookError) -> CreateTaskError {
    match error {
        RegisteredPlaybookError::UnknownPlaybook | RegisteredPlaybookError::UnsupportedPlaybook => {
            CreateTaskError::UnknownPlaybook
        }
    }
}

fn build_assistant_session_response(
    assistant_session_id: String,
    workspace_id: String,
    execution_mode: String,
    objective: AssistantObjectiveDto,
    delegation: AssistantDelegationBinding,
    team_session: TeamSessionSnapshot,
) -> AssistantSessionResponseDto {
    AssistantSessionResponseDto {
        assistant_session_id,
        workspace_id,
        objective,
        execution_mode,
        delegation: AssistantDelegationDto {
            task_id: delegation.task_id,
            run_id: delegation.run_id,
            team_session_id: delegation.team_session_id,
            status: delegation_status_as_str(delegation.status).to_owned(),
        },
        team_session: TeamSessionSnapshotDto::from(team_session),
    }
}

fn delegation_status_as_str(
    status: decacan_runtime::assistant::session::AssistantDelegationStatus,
) -> &'static str {
    match status {
        decacan_runtime::assistant::session::AssistantDelegationStatus::Active => "active",
        decacan_runtime::assistant::session::AssistantDelegationStatus::Completed => "completed",
        decacan_runtime::assistant::session::AssistantDelegationStatus::Cancelled => "cancelled",
    }
}

fn sort_tasks_newest_first(tasks: &mut [TaskDto]) {
    tasks.sort_by(|left, right| {
        task_id_sequence(&right.id)
            .cmp(&task_id_sequence(&left.id))
            .then_with(|| right.id.cmp(&left.id))
    });
}

fn task_id_sequence(task_id: &str) -> u64 {
    task_id
        .rsplit('-')
        .next()
        .and_then(|value| value.parse::<u64>().ok())
        .unwrap_or(0)
}

fn assistant_session_id_sequence(assistant_session_id: &str) -> u64 {
    assistant_session_id
        .rsplit('-')
        .next()
        .and_then(|value| value.parse::<u64>().ok())
        .unwrap_or(0)
}

#[cfg(test)]
mod tests {
    use super::*;
    use decacan_runtime::playbook::entity::Playbook;
    use decacan_runtime::playbook::modes::PlaybookMode;
    use decacan_runtime::policy::entity::PolicyProfile;
    use decacan_runtime::task::entity::Task;
    use decacan_runtime::workflow::entity::Workflow;
    use decacan_runtime::workflow::step::{WorkflowStep, WorkflowStepType};
    use decacan_runtime::workspace::entity::Workspace;

    fn test_stored_task(task_id: &str, workspace_id: &str, playbook_key: &str) -> StoredTask {
        let workflow = Workflow::new_for_test(
            &format!("workflow-{workspace_id}"),
            vec![WorkflowStep::new_for_test(
                "step-1",
                "Step 1",
                WorkflowStepType::Deterministic,
                "Write a result",
                None,
            )],
        );
        let workspace = Workspace::new_for_test(workspace_id, "workspace", "/tmp/workspace");
        let playbook = Playbook::new_for_test(
            &format!("playbook-{workspace_id}"),
            workspace_id,
            playbook_key,
            PlaybookMode::Standard,
        );
        let policy = PolicyProfile::new_for_test("policy-1", workspace_id, "default");
        let runtime_task =
            Task::new_for_test(task_id, workspace_id, &playbook.id, workflow.version_id);
        let runtime_run = decacan_runtime::run::entity::Run::new_for_test(
            &format!("run-{workspace_id}"),
            task_id,
            workflow,
            policy,
            workspace,
            playbook,
        );

        StoredTask {
            id: task_id.to_owned(),
            workspace_id: workspace_id.to_owned(),
            playbook_key: playbook_key.to_owned(),
            input_payload: format!("input-{workspace_id}"),
            playbook_handle_id: format!("handle-{workspace_id}"),
            playbook_version_id: format!("version-{workspace_id}"),
            artifact_id: None,
            status: "running".to_owned(),
            status_summary: "running".to_owned(),
            agent_messages: vec![],
            runtime_task,
            runtime_run,
        }
    }

    #[tokio::test]
    async fn finish_execution_ignores_stale_run_results() {
        let state = AppState::new_for_test().await;
        let handle_id = state
            .fork_playbook_from_store("store-entry-summary")
            .expect("store entry should fork")
            .handle
            .playbook_handle_id;
        let publishable = state
            .save_playbook_draft(
                &handle_id,
                "metadata:\n  title: valid draft\ncapability_refs:\n  routines:\n    - builtin.scan_markdown_files\n  tools:\n    - builtin.workspace.read\n    - builtin.artifact.write\n  validators:\n    - builtin.output_contract.summary\nexecution_profile: single\n".to_owned(),
            )
            .expect("draft should save");
        assert!(publishable.health_report.publishable);
        let published = state
            .publish_playbook_draft(&handle_id)
            .expect("draft should publish");
        let version_id = published
            .response
            .version
            .expect("publish should create a version")
            .playbook_version_id;
        let request = CreateTaskRequest {
            workspace_id: "workspace-1".to_owned(),
            playbook_handle_id: handle_id.clone(),
            playbook_version_id: version_id.clone(),
            input_payload: "alpha\nbeta".to_owned(),
        };

        let first = state
            .prepare_execution_with_task_id("task-stale".to_owned(), &request)
            .expect("first execution should prepare");
        let second = state
            .prepare_execution_with_task_id("task-stale".to_owned(), &request)
            .expect("second execution should prepare");

        state
            .inner
            .tasks
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .insert(
                "task-stale".to_owned(),
                StoredTask {
                    id: "task-stale".to_owned(),
                    workspace_id: "workspace-1".to_owned(),
                    playbook_key: SUMMARY_PLAYBOOK_KEY.to_owned(),
                    input_payload: "alpha\nbeta".to_owned(),
                    playbook_handle_id: handle_id,
                    playbook_version_id: version_id,
                    artifact_id: None,
                    status: "running".to_owned(),
                    status_summary: "running".to_owned(),
                    agent_messages: vec![],
                    runtime_task: second.runtime_task.clone(),
                    runtime_run: second.runtime_run.clone(),
                },
            );

        state.finish_execution(
            "task-stale".to_owned(),
            &first.runtime_run.id,
            ExecutionOutcome {
                task: first.runtime_task.clone(),
                run: first.runtime_run.clone(),
                result: Err("stale run".to_owned()),
            },
        );

        let stored = state
            .inner
            .tasks
            .lock()
            .unwrap_or_else(|e| e.into_inner())
            .get("task-stale")
            .cloned()
            .expect("stored task should exist");

        assert_eq!(stored.runtime_run.id, second.runtime_run.id);
        assert_eq!(stored.status, "running");
    }

    #[tokio::test]
    async fn create_task_execution_persists_requested_workspace_id() {
        let state = AppState::new_for_test_with_workspaces(vec![
            (
                "workspace-1".to_owned(),
                "Default Workspace".to_owned(),
                "/workspace".to_owned(),
            ),
            (
                "workspace-2".to_owned(),
                "Second Workspace".to_owned(),
                "/workspace-2".to_owned(),
            ),
        ])
        .await
        .expect("test state should build");

        let handle_id = state
            .fork_playbook_from_store("store-entry-summary")
            .expect("store entry should fork")
            .handle
            .playbook_handle_id;
        let publishable = state
            .save_playbook_draft(
                &handle_id,
                "metadata:\n  title: valid draft\ncapability_refs:\n  routines:\n    - builtin.scan_markdown_files\n  tools:\n    - builtin.workspace.read\n    - builtin.artifact.write\n  validators:\n    - builtin.output_contract.summary\nexecution_profile: single\n".to_owned(),
            )
            .expect("draft should save");
        assert!(publishable.health_report.publishable);
        let published = state
            .publish_playbook_draft(&handle_id)
            .expect("draft should publish");
        let version_id = published
            .response
            .version
            .expect("publish should create a version")
            .playbook_version_id;

        let response = state
            .create_task_execution(CreateTaskRequest {
                workspace_id: "workspace-2".to_owned(),
                playbook_handle_id: handle_id,
                playbook_version_id: version_id,
                input_payload: "alpha\nbeta".to_owned(),
            })
            .await
            .expect("task creation should succeed");

        assert_eq!(response.task.workspace_id, "workspace-2");
        assert!(state.has_task_in_workspace("workspace-2", &response.task.id));
        assert!(!state.has_task_in_workspace("workspace-1", &response.task.id));
    }

    #[tokio::test]
    async fn build_account_home_filters_user_scoped_collections() {
        let state = AppState::new_for_test_with_workspaces(vec![
            (
                "workspace-1".to_owned(),
                "Default Workspace".to_owned(),
                "/workspace".to_owned(),
            ),
            (
                "workspace-2".to_owned(),
                "Second Workspace".to_owned(),
                "/workspace-2".to_owned(),
            ),
        ])
        .await
        .expect("test state should build");

        {
            let mut tasks = state.inner.tasks.lock().unwrap_or_else(|e| e.into_inner());
            tasks.insert(
                "task-1".to_owned(),
                test_stored_task("task-1", "workspace-1", SUMMARY_PLAYBOOK_KEY),
            );
            tasks.insert(
                "task-2".to_owned(),
                test_stored_task("task-2", "workspace-2", SUMMARY_PLAYBOOK_KEY),
            );
        }

        state.put_approval(ApprovalDto {
            id: "approval-1".to_owned(),
            workspace_id: "workspace-1".to_owned(),
            task_id: "task-1".to_owned(),
            task_playbook_key: SUMMARY_PLAYBOOK_KEY.to_owned(),
            decision: "approve".to_owned(),
            comment: None,
            status: "pending".to_owned(),
        });
        state.put_approval(ApprovalDto {
            id: "approval-2".to_owned(),
            workspace_id: "workspace-2".to_owned(),
            task_id: "task-2".to_owned(),
            task_playbook_key: SUMMARY_PLAYBOOK_KEY.to_owned(),
            decision: "approve".to_owned(),
            comment: None,
            status: "pending".to_owned(),
        });

        let current_user = CurrentUser {
            user_id: "user-1".to_owned(),
            default_workspace_id: "workspace-2".to_owned(),
        };
        let home = state.build_account_home_for_user(&current_user);

        assert_eq!(home.default_workspace_id, "workspace-2");
        assert_eq!(home.workspaces.len(), 2);
        assert_eq!(home.workspaces[0].id, "workspace-1");
        assert_eq!(home.workspaces[1].id, "workspace-2");
        assert_eq!(home.recent_tasks.len(), 1);
        assert_eq!(home.recent_tasks[0].workspace_id, "workspace-2");
        assert_eq!(home.waiting_on_me.len(), 1);
        assert_eq!(home.waiting_on_me[0].workspace_id, "workspace-2");
    }
}
