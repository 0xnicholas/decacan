use std::collections::HashMap;
use std::path::PathBuf;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex};
use std::time::{SystemTime, UNIX_EPOCH};

use decacan_infra::clock::system::SystemClock;
use decacan_infra::filesystem::local::LocalFilesystem;
use decacan_infra::storage::memory::MemoryStorage;
use decacan_runtime::artifact::entity::Artifact as RuntimeArtifact;
use decacan_runtime::events::{TaskEvent, TaskEventPayload};
use decacan_runtime::playbook::modes::PlaybookMode;
use decacan_runtime::playbook::registry::{
    get_registered_playbook, list_registered_playbooks, DISCOVER_TOPICS_PLAYBOOK_KEY,
    SUMMARY_PLAYBOOK_KEY,
};
use decacan_runtime::policy::entity::PolicyProfile;
use decacan_runtime::ports::filesystem::FilesystemPort;
use decacan_runtime::run::entity::Run;
use decacan_runtime::run::service::{
    execute_discovery_playbook, execute_standard_summary_playbook, SummaryPlaybookE2eResult,
    SummaryPlaybookExecutionError,
};
use decacan_runtime::task::entity::{Task, TaskStatus};
use decacan_runtime::workflow::compiler::compile_playbook;
use decacan_runtime::workspace::entity::Workspace;
use tokio::sync::broadcast;

use crate::dto::{
    ApprovalDto, ArtifactContentDto, ArtifactDto, CreateTaskAcceptedResponse, CreateTaskRequest,
    PlaybookDto, RetryTaskRequest, TaskDetailDto, TaskDto, TaskEventEnvelopeDto, TaskPlanDto,
    TaskSummaryDto, WorkspaceDto,
};

#[derive(Clone)]
pub struct AppState {
    inner: Arc<AppStateInner>,
}

struct AppStateInner {
    next_id: AtomicU64,
    default_workspace_root: PathBuf,
    workspaces: Vec<WorkspaceDto>,
    playbooks: Vec<PlaybookDto>,
    tasks: Mutex<HashMap<String, StoredTask>>,
    artifacts: Mutex<HashMap<String, StoredArtifact>>,
    approvals: Mutex<HashMap<String, ApprovalDto>>,
    task_events: Mutex<HashMap<String, Vec<TaskEventEnvelopeDto>>>,
    task_event_bus: broadcast::Sender<TaskEventEnvelopeDto>,
}

#[derive(Debug, Clone)]
struct StoredTask {
    id: String,
    workspace_id: String,
    playbook_key: String,
    input: String,
    artifact_id: Option<String>,
    status: String,
    status_summary: String,
    runtime_task: Task,
    runtime_run: Run,
}

#[derive(Debug, Clone)]
struct StoredArtifact {
    dto: ArtifactDto,
    physical_path: PathBuf,
}

#[derive(Debug, Clone)]
struct PreparedExecution {
    task_id: String,
    playbook_key: String,
    workspace_root: PathBuf,
    input_path: PathBuf,
    input_contents: String,
    runtime_task: Task,
    runtime_run: Run,
}

#[derive(Debug)]
struct ExecutionOutcome {
    task: Task,
    run: Run,
    result: Result<SummaryPlaybookE2eResult, String>,
}

impl AppState {
    pub fn new_for_test() -> Self {
        let root = std::env::temp_dir().join(format!(
            "decacan-app-runtime-{}",
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .expect("system time should be after unix epoch")
                .as_nanos()
        ));
        Self::new_with_workspace_root(root)
            .expect("test app state should create a default workspace root")
    }

    pub fn new_local() -> std::io::Result<Self> {
        let root = std::env::current_dir()?.join(".decacan-local-workspace");
        Self::new_with_workspace_root(root)
    }

    fn new_with_workspace_root(default_workspace_root: PathBuf) -> std::io::Result<Self> {
        std::fs::create_dir_all(&default_workspace_root)?;
        let (task_event_bus, _) = broadcast::channel(64);
        let playbooks = list_registered_playbooks()
            .into_iter()
            .map(playbook_to_dto)
            .collect();

        Ok(Self {
            inner: Arc::new(AppStateInner {
                next_id: AtomicU64::new(1),
                workspaces: vec![WorkspaceDto {
                    id: "workspace-1".to_owned(),
                    title: "Default Workspace".to_owned(),
                    root_path: default_workspace_root.display().to_string(),
                }],
                playbooks,
                default_workspace_root,
                tasks: Mutex::new(HashMap::new()),
                artifacts: Mutex::new(HashMap::new()),
                approvals: Mutex::new(HashMap::new()),
                task_events: Mutex::new(HashMap::new()),
                task_event_bus,
            }),
        })
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

    pub fn list_tasks(&self) -> Vec<TaskDto> {
        self.inner
            .tasks
            .lock()
            .expect("task lock should not be poisoned")
            .values()
            .map(task_to_dto)
            .collect()
    }

    pub fn get_task(&self, task_id: &str) -> Option<TaskDto> {
        self.inner
            .tasks
            .lock()
            .expect("task lock should not be poisoned")
            .get(task_id)
            .map(task_to_dto)
    }

    pub fn get_task_detail(&self, task_id: &str) -> Option<TaskDetailDto> {
        let task = self
            .inner
            .tasks
            .lock()
            .expect("task lock should not be poisoned")
            .get(task_id)
            .cloned()?;
        let plan = plan_for_task(&task);

        Some(TaskDetailDto {
            task: TaskSummaryDto {
                id: task.id.clone(),
                workspace_id: task.workspace_id.clone(),
                playbook_key: task.playbook_key.clone(),
                input: task.input.clone(),
                status: task.status.clone(),
                status_summary: task.status_summary.clone(),
                artifact_id: task.artifact_id.clone(),
            },
            plan,
            approvals: self.list_approvals_for_task(task_id),
            artifacts: self.list_artifacts_for_task(task_id),
            timeline: self.list_task_events(task_id),
        })
    }

    pub fn has_task(&self, task_id: &str) -> bool {
        self.inner
            .tasks
            .lock()
            .expect("task lock should not be poisoned")
            .contains_key(task_id)
    }

    pub async fn create_task_execution(
        &self,
        request: CreateTaskRequest,
    ) -> Result<CreateTaskAcceptedResponse, CreateTaskError> {
        if !self.is_known_workspace(&request.workspace_id) {
            return Err(CreateTaskError::WorkspaceNotFound);
        }
        if !self.is_known_playbook(&request.playbook_key) {
            return Err(CreateTaskError::UnknownPlaybook);
        }

        let prepared = self.prepare_execution(&request)?;
        let artifact = pending_artifact_for_task(&prepared.task_id, &prepared.playbook_key);
        let artifact_id = artifact.id.clone();
        let event = self.new_task_event(
            &prepared.task_id,
            "task.accepted",
            "Task accepted by API".to_owned(),
        );

        self.inner
            .artifacts
            .lock()
            .expect("artifact lock should not be poisoned")
            .insert(
                artifact_id.clone(),
                StoredArtifact {
                    dto: artifact,
                    physical_path: prepared
                        .workspace_root
                        .join(expected_output_path(&prepared.playbook_key)),
                },
            );

        self.inner
            .tasks
            .lock()
            .expect("task lock should not be poisoned")
            .insert(
                prepared.task_id.clone(),
                StoredTask {
                    id: prepared.task_id.clone(),
                    workspace_id: "workspace-1".to_owned(),
                    playbook_key: prepared.playbook_key.clone(),
                    input: request.input,
                    artifact_id: Some(artifact_id),
                    status: "accepted".to_owned(),
                    status_summary: "Task accepted and queued for runtime execution".to_owned(),
                    runtime_task: prepared.runtime_task.clone(),
                    runtime_run: prepared.runtime_run.clone(),
                },
            );
        self.append_task_event(event);
        let task_id = prepared.task_id.clone();
        self.spawn_execution(prepared);

        Ok(CreateTaskAcceptedResponse {
            task: self
                .get_task(&task_id)
                .expect("newly created task should exist"),
            events_url: format!("/api/tasks/{task_id}/events"),
            stream_url: format!("/api/tasks/{task_id}/events/stream"),
        })
    }

    pub fn get_artifact(&self, artifact_id: &str) -> Option<ArtifactDto> {
        self.inner
            .artifacts
            .lock()
            .expect("artifact lock should not be poisoned")
            .get(artifact_id)
            .map(|artifact| artifact.dto.clone())
    }

    pub fn get_artifact_content(&self, artifact_id: &str) -> Option<ArtifactContentDto> {
        let artifact = self
            .inner
            .artifacts
            .lock()
            .expect("artifact lock should not be poisoned")
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
            .expect("approval lock should not be poisoned")
            .insert(approval.id.clone(), approval);
    }

    pub fn get_approval(&self, approval_id: &str) -> Option<ApprovalDto> {
        self.inner
            .approvals
            .lock()
            .expect("approval lock should not be poisoned")
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
            .expect("approval lock should not be poisoned");
        let approval = approvals.get_mut(approval_id)?;
        mutate(approval);
        Some(approval.clone())
    }

    pub fn list_approvals_for_task(&self, task_id: &str) -> Vec<ApprovalDto> {
        self.inner
            .approvals
            .lock()
            .expect("approval lock should not be poisoned")
            .values()
            .filter(|approval| approval.task_id == task_id)
            .cloned()
            .collect()
    }

    pub fn append_task_event(&self, event: TaskEventEnvelopeDto) {
        self.inner
            .task_events
            .lock()
            .expect("task event lock should not be poisoned")
            .entry(event.task_id.clone())
            .or_default()
            .push(event.clone());
        let _ = self.inner.task_event_bus.send(event);
    }

    pub fn list_task_events(&self, task_id: &str) -> Vec<TaskEventEnvelopeDto> {
        self.inner
            .task_events
            .lock()
            .expect("task event lock should not be poisoned")
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
            .expect("artifact lock should not be poisoned")
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

    pub async fn retry_task(&self, task_id: &str, request: RetryTaskRequest) -> Option<TaskSummaryDto> {
        let existing = self
            .inner
            .tasks
            .lock()
            .expect("task lock should not be poisoned")
            .get(task_id)
            .cloned()?;
        let create_request = CreateTaskRequest {
            workspace_id: existing.workspace_id.clone(),
            playbook_key: existing.playbook_key.clone(),
            input: existing.input.clone(),
        };
        let prepared = self.prepare_execution_with_task_id(task_id.to_owned(), &create_request).ok()?;

        self.inner
            .tasks
            .lock()
            .expect("task lock should not be poisoned")
            .insert(
                task_id.to_owned(),
                StoredTask {
                    id: task_id.to_owned(),
                    workspace_id: existing.workspace_id.clone(),
                    playbook_key: existing.playbook_key.clone(),
                    input: existing.input.clone(),
                    artifact_id: Some(expected_primary_artifact_id(task_id, &existing.playbook_key)),
                    status: "accepted".to_owned(),
                    status_summary: format!("Task retry requested: {}", request.note),
                    runtime_task: prepared.runtime_task.clone(),
                    runtime_run: prepared.runtime_run.clone(),
                },
            );

        self.inner
            .artifacts
            .lock()
            .expect("artifact lock should not be poisoned")
            .retain(|_, artifact| artifact.dto.task_id != task_id);
        let pending = pending_artifact_for_task(task_id, &existing.playbook_key);
        self.inner
            .artifacts
            .lock()
            .expect("artifact lock should not be poisoned")
            .insert(
                pending.id.clone(),
                StoredArtifact {
                    physical_path: prepared
                        .workspace_root
                        .join(expected_output_path(&existing.playbook_key)),
                    dto: pending,
                },
            );

        self.append_task_event(self.new_task_event(
            task_id,
            "task.retried",
            format!("Task retry requested: {}", request.note),
        ));
        self.spawn_execution(prepared);

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
        let playbook =
            get_registered_playbook(&request.playbook_key).ok_or(CreateTaskError::UnknownPlaybook)?;
        let workflow = compile_playbook(&playbook).ok_or(CreateTaskError::UnknownPlaybook)?;
        let run_id = self.next_id("run");
        let workspace_root = self
            .inner
            .default_workspace_root
            .join("tasks")
            .join(&task_id);
        let workspace = Workspace::new(
            request.workspace_id.clone(),
            "Default Workspace",
            workspace_root.display().to_string(),
        );
        let policy = PolicyProfile::new_default(self.next_id("policy"), &workspace.id, "default");
        let runtime_task = Task::new(
            task_id.clone(),
            workspace.id.clone(),
            playbook.id.clone(),
            workflow.version_id,
        );
        let runtime_run = Run::new(
            run_id.clone(),
            task_id.clone(),
            workflow,
            policy,
            workspace,
            playbook,
        );

        Ok(PreparedExecution {
            task_id,
            playbook_key: request.playbook_key.clone(),
            workspace_root: workspace_root.clone(),
            input_path: workspace_root.join("notes.md"),
            input_contents: request.input.clone(),
            runtime_task,
            runtime_run,
        })
    }

    fn spawn_execution(&self, prepared: PreparedExecution) {
        let state = self.clone();
        let fallback_task = prepared.runtime_task.clone();
        let fallback_run = prepared.runtime_run.clone();
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

            let playbook_key = prepared.playbook_key.clone();
            let task_id = prepared.task_id.clone();
            let outcome = tokio::task::spawn_blocking(move || run_runtime_execution(prepared))
                .await
                .unwrap_or_else(|error| ExecutionOutcome {
                    task: fallback_task,
                    run: fallback_run,
                    result: Err(format!("background execution join failed for {playbook_key}: {error}")),
                });

            state.finish_execution(task_id, outcome);
        });
    }

    fn finish_execution(&self, task_id: String, outcome: ExecutionOutcome) {
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
            .expect("task lock should not be poisoned")
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
            .expect("artifact lock should not be poisoned")
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
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum CreateTaskError {
    WorkspaceNotFound,
    UnknownPlaybook,
}

fn plan_for_task(task: &StoredTask) -> TaskPlanDto {
    let steps = match task.playbook_key.as_str() {
        SUMMARY_PLAYBOOK_KEY => vec![
            "Scan markdown files in the selected workspace".to_owned(),
            "Draft a concise summary with key takeaways".to_owned(),
            "Write the final summary artifact to output/summary.md".to_owned(),
        ],
        DISCOVER_TOPICS_PLAYBOOK_KEY => vec![
            "Scan markdown files in the selected workspace".to_owned(),
            "Cluster notes into themes and open questions".to_owned(),
            "Write the discovery artifact to output/discovery.md".to_owned(),
        ],
        _ => vec![
            "Inspect the selected workspace".to_owned(),
            "Produce the final result artifact".to_owned(),
        ],
    };

    let current_step_index = if task.status == "succeeded" || task.status == "failed" {
        steps.len().saturating_sub(1)
    } else {
        task.runtime_run.step_cursor.min(steps.len().saturating_sub(1))
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
        input: task.input.clone(),
        status: task.status.clone(),
        artifact_id: task.artifact_id.clone(),
    }
}

fn playbook_to_dto(playbook: decacan_runtime::playbook::entity::Playbook) -> PlaybookDto {
    let (summary, expected_output_label, expected_output_path) = match playbook.key.as_str() {
        SUMMARY_PLAYBOOK_KEY => (
            "Create a concise summary from markdown notes in the selected workspace.",
            "Summary document",
            "output/summary.md",
        ),
        DISCOVER_TOPICS_PLAYBOOK_KEY => (
            "Cluster markdown notes into themes and open questions for follow-up work.",
            "Discovery report",
            "output/discovery.md",
        ),
        _ => (
            "Run a workspace task with a formal artifact output.",
            "Result document",
            "output/result.md",
        ),
    };

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

pub fn pending_artifact_for_task(task_id: &str, playbook_key: &str) -> ArtifactDto {
    ArtifactDto {
        id: expected_primary_artifact_id(task_id, playbook_key),
        task_id: task_id.to_owned(),
        label: expected_output_label(playbook_key).to_owned(),
        canonical_path: expected_output_path(playbook_key).to_owned(),
        status: "pending".to_owned(),
    }
}

fn expected_primary_artifact_id(task_id: &str, playbook_key: &str) -> String {
    match playbook_key {
        SUMMARY_PLAYBOOK_KEY => format!("artifact-{task_id}-summary-primary"),
        DISCOVER_TOPICS_PLAYBOOK_KEY => format!("artifact-{task_id}-discovery-primary"),
        _ => format!("artifact-{task_id}-result-primary"),
    }
}

fn expected_output_path(playbook_key: &str) -> &'static str {
    match playbook_key {
        SUMMARY_PLAYBOOK_KEY => "output/summary.md",
        DISCOVER_TOPICS_PLAYBOOK_KEY => "output/discovery.md",
        _ => "output/result.md",
    }
}

fn expected_output_label(playbook_key: &str) -> &'static str {
    match playbook_key {
        SUMMARY_PLAYBOOK_KEY => "Summary document",
        DISCOVER_TOPICS_PLAYBOOK_KEY => "Discovery report",
        _ => "Result document",
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

        match prepared.playbook_key.as_str() {
            SUMMARY_PLAYBOOK_KEY => execute_standard_summary_playbook(
                &mut task,
                &mut run,
                &filesystem,
                &storage,
                &clock,
            )
            .map_err(summary_execution_error_to_string),
            DISCOVER_TOPICS_PLAYBOOK_KEY => execute_discovery_playbook(
                &mut task,
                &mut run,
                &filesystem,
                &storage,
                &clock,
            )
            .map_err(summary_execution_error_to_string),
            _ => Err(format!("unsupported playbook {}", prepared.playbook_key)),
        }
    })();

    ExecutionOutcome { task, run, result }
}

fn summary_execution_error_to_string(error: SummaryPlaybookExecutionError) -> String {
    match error {
        SummaryPlaybookExecutionError::Task(error) => format!("task transition failed: {error:?}"),
        SummaryPlaybookExecutionError::Routine(error) => error,
    }
}
