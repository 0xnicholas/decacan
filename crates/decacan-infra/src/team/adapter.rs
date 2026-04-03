use crate::team::storage::InMemoryTeamSessionStore;
use decacan_runtime::ports::team_action_gateway::{
    ApprovalContinuation, TeamActionDisposition, TeamActionGateway,
};
use decacan_runtime::ports::team_orchestrator::{
    AdvanceTeamSessionRequest, ApplyTeamInputRequest, StartTeamSessionRequest,
    StartTeamSessionResult, TeamOrchestratorPort, TeamSessionUpdate, TerminateTeamSessionRequest,
};
use decacan_runtime::team_session::action::{ActionRiskLevel, TeamActionIntent};
use decacan_runtime::team_session::entity::{TeamExecutionPhase, TeamSessionStatus};
use decacan_runtime::team_session::snapshot::TeamSessionSnapshot;
use std::collections::HashMap;
use std::convert::Infallible;
use std::sync::{Arc, RwLock};

#[derive(Debug, Clone)]
pub struct InProcessTeamOrchestrator {
    team_sessions: Arc<InMemoryTeamSessionStore>,
    action_dispositions: Arc<RwLock<HashMap<String, TeamActionDisposition>>>,
}

impl Default for InProcessTeamOrchestrator {
    fn default() -> Self {
        Self {
            team_sessions: Arc::new(InMemoryTeamSessionStore::new()),
            action_dispositions: Arc::new(RwLock::new(HashMap::new())),
        }
    }
}

impl InProcessTeamOrchestrator {
    pub fn new_for_test() -> Self {
        Self::default()
    }

    fn next_phase(phase: TeamExecutionPhase) -> TeamExecutionPhase {
        match phase {
            TeamExecutionPhase::Planning => TeamExecutionPhase::Executing,
            TeamExecutionPhase::Executing => TeamExecutionPhase::Reviewing,
            TeamExecutionPhase::Reviewing => TeamExecutionPhase::Finalizing,
            TeamExecutionPhase::Finalizing => TeamExecutionPhase::Finalizing,
        }
    }

    fn idempotency_key_for_intent(intent: &TeamActionIntent) -> String {
        if let Some(key) = &intent.idempotency_key {
            return key.clone();
        }
        format!("{}:{}", intent.intent_id, intent.intent_version)
    }
}

#[async_trait::async_trait]
impl TeamOrchestratorPort for InProcessTeamOrchestrator {
    type Error = Infallible;

    async fn start_session(
        &self,
        request: StartTeamSessionRequest,
    ) -> Result<StartTeamSessionResult, Self::Error> {
        let mut snapshot = TeamSessionSnapshot::new_for_test(request.session_id);
        snapshot.status = TeamSessionStatus::Running;
        snapshot.phase = TeamExecutionPhase::Planning;
        snapshot.snapshot_version = 1;
        self.team_sessions.save(snapshot.clone());
        Ok(StartTeamSessionResult { snapshot })
    }

    async fn apply_input(
        &self,
        request: ApplyTeamInputRequest,
    ) -> Result<TeamSessionUpdate, Self::Error> {
        let mut snapshot = self
            .team_sessions
            .load(&request.session_id)
            .unwrap_or_else(|| TeamSessionSnapshot::new_for_test(request.session_id));
        snapshot.status = TeamSessionStatus::Running;
        snapshot.snapshot_version += 1;
        self.team_sessions.save(snapshot.clone());
        Ok(TeamSessionUpdate { snapshot })
    }

    async fn advance_session(
        &self,
        request: AdvanceTeamSessionRequest,
    ) -> Result<TeamSessionUpdate, Self::Error> {
        let mut snapshot = self
            .team_sessions
            .load(&request.session_id)
            .unwrap_or_else(|| TeamSessionSnapshot::new_for_test(request.session_id));
        snapshot.phase = Self::next_phase(snapshot.phase);
        snapshot.status = TeamSessionStatus::Running;
        snapshot.snapshot_version += 1;
        self.team_sessions.save(snapshot.clone());
        Ok(TeamSessionUpdate { snapshot })
    }

    async fn get_snapshot(
        &self,
        session_id: &str,
    ) -> Result<Option<TeamSessionSnapshot>, Self::Error> {
        Ok(self.team_sessions.load(session_id))
    }

    async fn terminate_session(
        &self,
        request: TerminateTeamSessionRequest,
    ) -> Result<TeamSessionUpdate, Self::Error> {
        let mut snapshot = self
            .team_sessions
            .load(&request.session_id)
            .unwrap_or_else(|| TeamSessionSnapshot::new_for_test(request.session_id));
        snapshot.status = TeamSessionStatus::Terminated;
        snapshot.snapshot_version += 1;
        self.team_sessions.save(snapshot.clone());
        Ok(TeamSessionUpdate { snapshot })
    }
}

#[async_trait::async_trait]
impl TeamActionGateway for InProcessTeamOrchestrator {
    type Error = Infallible;

    async fn submit_action(
        &self,
        intent: TeamActionIntent,
    ) -> Result<TeamActionDisposition, Self::Error> {
        let key = Self::idempotency_key_for_intent(&intent);
        let mut dispositions = self
            .action_dispositions
            .write()
            .unwrap_or_else(|e| e.into_inner());

        if let Some(existing) = dispositions.get(&key) {
            return Ok(existing.clone());
        }

        let disposition = if intent.risk_level == ActionRiskLevel::High
            || intent.kind.is_mandatory_human_confirm()
        {
            TeamActionDisposition::ApprovalRequired {
                approval_id: format!("approval-{}", intent.intent_id),
                intent_version: intent.intent_version,
            }
        } else {
            TeamActionDisposition::Applied {
                action_id: format!("action-{}", intent.intent_id),
                intent_version: intent.intent_version,
            }
        };

        dispositions.insert(key, disposition.clone());
        Ok(disposition)
    }

    async fn continue_after_approval(
        &self,
        continuation: ApprovalContinuation,
    ) -> Result<TeamActionDisposition, Self::Error> {
        Ok(TeamActionDisposition::Applied {
            action_id: format!("action-{}", continuation.approval_id),
            intent_version: continuation.intent_version,
        })
    }
}
