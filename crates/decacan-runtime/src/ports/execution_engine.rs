use async_trait::async_trait;
use decacan_agent_contract::{ExecutionEvent, ExecutionInput, ExecutionRequest};
use futures::stream::BoxStream;

pub struct ExecutionHandle {
    pub execution_id: String,
}

#[derive(Debug, Clone)]
pub struct ExecutionStatus {
    pub execution_id: String,
    pub state: ExecutionState,
    pub phase: Option<String>,
    pub outputs: Vec<ExecutionOutput>,
    pub approvals: Vec<PendingApproval>,
    pub artifacts: Vec<ArtifactReference>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ExecutionState {
    Running,
    BlockedOnInput,
    BlockedOnApproval,
    Completed,
    Failed,
}

#[derive(Debug, Clone)]
pub struct ExecutionOutput {
    pub key: String,
    pub value: serde_json::Value,
}

#[derive(Debug, Clone)]
pub struct PendingApproval {
    pub approval_id: String,
    pub prompt: String,
}

#[derive(Debug, Clone)]
pub struct ArtifactReference {
    pub artifact_id: String,
    pub name: String,
    pub path: String,
}

#[async_trait]
pub trait ExecutionEnginePort: Send + Sync {
    type Error;

    async fn start(&self, req: ExecutionRequest) -> Result<ExecutionHandle, Self::Error>;

    async fn submit(
        &self,
        execution_id: &str,
        input: ExecutionInput,
    ) -> Result<(), Self::Error>;

    async fn get_status(
        &self,
        execution_id: &str,
    ) -> Result<Option<ExecutionStatus>, Self::Error>;

    async fn subscribe_events(
        &self,
        execution_id: &str,
    ) -> Result<BoxStream<'static, Result<ExecutionEvent, Self::Error>>, Self::Error>;
}
