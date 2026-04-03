use crate::team_session::snapshot::TeamSessionSnapshot;

#[derive(Debug, Clone)]
pub struct StartTeamSessionRequest {
    pub workspace_id: String,
    pub task_id: String,
    pub session_id: String,
}

impl StartTeamSessionRequest {
    pub fn new_for_test(workspace_id: impl Into<String>, task_id: impl Into<String>) -> Self {
        let workspace_id = workspace_id.into();
        let task_id = task_id.into();
        let session_id = format!("{workspace_id}:{task_id}:session");
        Self {
            workspace_id,
            task_id,
            session_id,
        }
    }
}

#[derive(Debug, Clone)]
pub struct StartTeamSessionResult {
    pub snapshot: TeamSessionSnapshot,
}

#[derive(Debug, Clone)]
pub struct ApplyTeamInputRequest {
    pub session_id: String,
}

impl ApplyTeamInputRequest {
    pub fn new_for_test(session_id: impl Into<String>) -> Self {
        Self {
            session_id: session_id.into(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct AdvanceTeamSessionRequest {
    pub session_id: String,
}

impl AdvanceTeamSessionRequest {
    pub fn new_for_test(session_id: impl Into<String>) -> Self {
        Self {
            session_id: session_id.into(),
        }
    }
}

#[derive(Debug, Clone)]
pub struct TerminateTeamSessionRequest {
    pub session_id: String,
    pub reason: String,
}

#[derive(Debug, Clone)]
pub struct TeamSessionUpdate {
    pub snapshot: TeamSessionSnapshot,
}

#[async_trait::async_trait]
pub trait TeamOrchestratorPort: Send + Sync {
    type Error;

    async fn start_session(
        &self,
        request: StartTeamSessionRequest,
    ) -> Result<StartTeamSessionResult, Self::Error>;

    async fn apply_input(
        &self,
        request: ApplyTeamInputRequest,
    ) -> Result<TeamSessionUpdate, Self::Error>;

    async fn advance_session(
        &self,
        request: AdvanceTeamSessionRequest,
    ) -> Result<TeamSessionUpdate, Self::Error>;

    async fn get_snapshot(
        &self,
        session_id: &str,
    ) -> Result<Option<TeamSessionSnapshot>, Self::Error>;

    async fn terminate_session(
        &self,
        request: TerminateTeamSessionRequest,
    ) -> Result<TeamSessionUpdate, Self::Error>;
}
