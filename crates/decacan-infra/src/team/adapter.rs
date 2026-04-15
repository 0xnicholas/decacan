use crate::team::gateway_client::{GatewayClientError, TeamGatewayClient};
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
use std::time::Duration;
use thiserror::Error;

#[derive(Debug, Clone)]
#[deprecated(
    since = "0.2.0",
    note = "Use execution_engine::HttpExecutionEngineClient instead. In-process orchestration is being removed in favor of remote execution engines."
)]
pub struct InProcessTeamOrchestrator {
    team_sessions: Arc<InMemoryTeamSessionStore>,
    action_dispositions: Arc<RwLock<HashMap<String, TeamActionDisposition>>>,
    approval_continuations: Arc<RwLock<HashMap<String, StoredApprovalContinuation>>>,
}

#[derive(Debug, Clone)]
struct StoredApprovalContinuation {
    expected_token: String,
    intent_version: u64,
}

impl Default for InProcessTeamOrchestrator {
    fn default() -> Self {
        Self {
            team_sessions: Arc::new(InMemoryTeamSessionStore::new()),
            action_dispositions: Arc::new(RwLock::new(HashMap::new())),
            approval_continuations: Arc::new(RwLock::new(HashMap::new())),
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

    fn expected_continuation_token(approval_id: &str, intent_version: u64) -> String {
        format!("ct-{approval_id}-{intent_version}")
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
        let session_id = snapshot.session_id.clone();
        snapshot.status = TeamSessionStatus::Running;
        snapshot.phase = TeamExecutionPhase::Planning;
        snapshot.snapshot_version = 1;
        snapshot = snapshot.with_evolution_proposal_for_test(
            format!("proposal-{session_id}"),
            "Enable retrieval pre-pass",
            "pending",
        );
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
            let approval_id = format!("approval-{}", intent.intent_id);
            let expected_token =
                Self::expected_continuation_token(&approval_id, intent.intent_version);
            self.approval_continuations
                .write()
                .unwrap_or_else(|e| e.into_inner())
                .insert(
                    approval_id.clone(),
                    StoredApprovalContinuation {
                        expected_token,
                        intent_version: intent.intent_version,
                    },
                );
            TeamActionDisposition::ApprovalRequired {
                approval_id,
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
        let stored = self
            .approval_continuations
            .read()
            .unwrap_or_else(|e| e.into_inner())
            .get(&continuation.approval_id)
            .cloned();

        let Some(stored) = stored else {
            return Ok(TeamActionDisposition::approval_rejected(
                continuation.approval_id,
                continuation.intent_version,
            ));
        };

        if stored.intent_version != continuation.intent_version
            || stored.expected_token != continuation.continuation_token
        {
            return Ok(TeamActionDisposition::approval_rejected(
                continuation.approval_id,
                continuation.intent_version,
            ));
        }

        Ok(TeamActionDisposition::Applied {
            action_id: format!("action-{}", continuation.approval_id),
            intent_version: continuation.intent_version,
        })
    }
}

#[derive(Debug, Clone)]
#[deprecated(
    since = "0.2.0",
    note = "Use execution_engine::HttpExecutionEngineClient instead. TeamOrchestratorPort is superseded by ExecutionEnginePort."
)]
pub enum AdapterMode {
    InProcess,
    Gateway { url: String, timeout: Duration },
}

impl Default for AdapterMode {
    fn default() -> Self {
        AdapterMode::InProcess
    }
}

#[derive(Debug, Error)]
pub enum AdapterError {
    #[error("in-process adapter error: {0}")]
    InProcessError(String),
    #[error("gateway not configured")]
    GatewayNotConfigured,
    #[error("gateway error: {0}")]
    GatewayError(#[from] GatewayClientError),
}

#[deprecated(
    since = "0.2.0",
    note = "Use execution_engine::HttpExecutionEngineClient instead. TeamOrchestratorPort is superseded by ExecutionEnginePort."
)]
pub struct TeamAdapter {
    mode: AdapterMode,
    in_process: Arc<InProcessTeamOrchestrator>,
    gateway: Option<Arc<TeamGatewayClient>>,
}

impl TeamAdapter {
    pub fn new_in_process() -> Self {
        Self {
            mode: AdapterMode::InProcess,
            in_process: Arc::new(InProcessTeamOrchestrator::default()),
            gateway: None,
        }
    }

    pub fn new_gateway(url: String, timeout: Duration) -> Self {
        let gateway = Arc::new(TeamGatewayClient::new(url.clone(), timeout));
        Self {
            mode: AdapterMode::Gateway { url, timeout },
            in_process: Arc::new(InProcessTeamOrchestrator::default()),
            gateway: Some(gateway),
        }
    }

    pub fn from_env() -> Self {
        use std::env;

        let mode = env::var("DECACAN_TEAM_ADAPTER_MODE")
            .unwrap_or_else(|_| "in_process".to_string());

        match mode.as_str() {
            "gateway" => {
                let url = env::var("DECACAN_TEAM_GATEWAY_URL")
                    .expect("DECACAN_TEAM_GATEWAY_URL must be set when mode=gateway");
                let timeout_secs = env::var("DECACAN_TEAM_GATEWAY_TIMEOUT_SECS")
                    .ok()
                    .and_then(|s| s.parse().ok())
                    .unwrap_or(30);
                Self::new_gateway(url, Duration::from_secs(timeout_secs))
            }
            _ => Self::new_in_process(),
        }
    }

    pub fn mode(&self) -> &AdapterMode {
        &self.mode
    }
}

#[async_trait::async_trait]
impl TeamOrchestratorPort for TeamAdapter {
    type Error = AdapterError;

    async fn start_session(
        &self,
        request: StartTeamSessionRequest,
    ) -> Result<StartTeamSessionResult, Self::Error> {
        match &self.mode {
            AdapterMode::InProcess => self
                .in_process
                .start_session(request)
                .await
                .map_err(|e| AdapterError::InProcessError(e.to_string())),
            AdapterMode::Gateway { .. } => {
                let gateway = self.gateway.as_ref().ok_or(AdapterError::GatewayNotConfigured)?;
                gateway.start_session(request).await.map_err(Into::into)
            }
        }
    }

    async fn apply_input(
        &self,
        request: ApplyTeamInputRequest,
    ) -> Result<TeamSessionUpdate, Self::Error> {
        match &self.mode {
            AdapterMode::InProcess => self
                .in_process
                .apply_input(request)
                .await
                .map_err(|e| AdapterError::InProcessError(e.to_string())),
            AdapterMode::Gateway { .. } => {
                let gateway = self.gateway.as_ref().ok_or(AdapterError::GatewayNotConfigured)?;
                gateway.apply_input(request).await.map_err(Into::into)
            }
        }
    }

    async fn advance_session(
        &self,
        request: AdvanceTeamSessionRequest,
    ) -> Result<TeamSessionUpdate, Self::Error> {
        match &self.mode {
            AdapterMode::InProcess => self
                .in_process
                .advance_session(request)
                .await
                .map_err(|e| AdapterError::InProcessError(e.to_string())),
            AdapterMode::Gateway { .. } => {
                let gateway = self.gateway.as_ref().ok_or(AdapterError::GatewayNotConfigured)?;
                gateway.advance_session(request).await.map_err(Into::into)
            }
        }
    }

    async fn get_snapshot(
        &self,
        session_id: &str,
    ) -> Result<Option<TeamSessionSnapshot>, Self::Error> {
        match &self.mode {
            AdapterMode::InProcess => self
                .in_process
                .get_snapshot(session_id)
                .await
                .map_err(|e| AdapterError::InProcessError(e.to_string())),
            AdapterMode::Gateway { .. } => {
                let gateway = self.gateway.as_ref().ok_or(AdapterError::GatewayNotConfigured)?;
                gateway.get_snapshot(session_id).await.map_err(Into::into)
            }
        }
    }

    async fn terminate_session(
        &self,
        request: TerminateTeamSessionRequest,
    ) -> Result<TeamSessionUpdate, Self::Error> {
        match &self.mode {
            AdapterMode::InProcess => self
                .in_process
                .terminate_session(request)
                .await
                .map_err(|e| AdapterError::InProcessError(e.to_string())),
            AdapterMode::Gateway { .. } => {
                let gateway = self.gateway.as_ref().ok_or(AdapterError::GatewayNotConfigured)?;
                gateway.terminate_session(request).await.map_err(Into::into)
            }
        }
    }
}

#[async_trait::async_trait]
impl TeamActionGateway for TeamAdapter {
    type Error = AdapterError;

    async fn submit_action(
        &self,
        intent: TeamActionIntent,
    ) -> Result<TeamActionDisposition, Self::Error> {
        match &self.mode {
            AdapterMode::InProcess => self
                .in_process
                .submit_action(intent)
                .await
                .map_err(|e| AdapterError::InProcessError(e.to_string())),
            AdapterMode::Gateway { .. } => {
                let gateway = self.gateway.as_ref().ok_or(AdapterError::GatewayNotConfigured)?;
                gateway.submit_action(intent).await.map_err(Into::into)
            }
        }
    }

    async fn continue_after_approval(
        &self,
        continuation: ApprovalContinuation,
    ) -> Result<TeamActionDisposition, Self::Error> {
        match &self.mode {
            AdapterMode::InProcess => self
                .in_process
                .continue_after_approval(continuation)
                .await
                .map_err(|e| AdapterError::InProcessError(e.to_string())),
            AdapterMode::Gateway { .. } => {
                let gateway = self.gateway.as_ref().ok_or(AdapterError::GatewayNotConfigured)?;
                gateway.continue_after_approval(continuation).await.map_err(Into::into)
            }
        }
    }
}