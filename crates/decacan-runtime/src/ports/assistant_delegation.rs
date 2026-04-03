use crate::assistant::session::{AssistantDelegationBinding, AssistantSession};

#[derive(Debug, Clone)]
pub struct StartAssistantDelegationRequest {
    pub assistant_session_id: String,
    pub task_id: String,
    pub run_id: String,
    pub team_session_id: String,
}

#[derive(Debug, Clone)]
pub struct StartAssistantDelegationResult {
    pub assistant_session: AssistantSession,
    pub binding: AssistantDelegationBinding,
}

#[async_trait::async_trait]
pub trait AssistantDelegationPort: Send + Sync {
    type Error;

    async fn start_delegation(
        &self,
        request: StartAssistantDelegationRequest,
    ) -> Result<StartAssistantDelegationResult, Self::Error>;
}
