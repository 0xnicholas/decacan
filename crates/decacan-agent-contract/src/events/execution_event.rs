use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "event_type", rename_all = "snake_case")]
pub enum ExecutionEvent {
    ExecutionStarted {
        execution_id: String,
        run_id: String,
        playbook_handle_id: String,
        version_id: String,
    },

    PhaseChanged {
        execution_id: String,
        phase: ExecutionPhase,
    },

    StepStarted {
        execution_id: String,
        step_id: String,
        capability_ref: String,
    },

    StepCompleted {
        execution_id: String,
        step_id: String,
        outputs: Vec<StepOutput>,
    },

    ToolWillExecute {
        execution_id: String,
        step_id: String,
        tool_name: String,
        tool_args: serde_json::Value,
        workspace_id: String,
        risk_level: RiskLevel,
        estimated_cost: Option<CostEstimate>,
    },

    ToolDidExecute {
        execution_id: String,
        step_id: String,
        tool_name: String,
        result_status: ToolResultStatus,
        result_summary: String,
        artifacts_created: Vec<ArtifactReference>,
        error_detail: Option<String>,
    },

    FileWrite {
        execution_id: String,
        step_id: String,
        relative_path: String,
        size_bytes: u64,
        content_hash: String,
    },

    ModelCalled {
        execution_id: String,
        step_id: String,
        provider: String,
        model: String,
        prompt_tokens: u32,
        completion_tokens: u32,
        total_tokens: u32,
        latency_ms: u64,
    },

    ApprovalRequired {
        execution_id: String,
        approval_id: String,
        step_id: String,
        prompt: String,
        risk_level: RiskLevel,
        suggested_action: Option<String>,
        expires_at: Option<String>,
    },

    InputRequired {
        execution_id: String,
        step_id: String,
        prompt: String,
    },

    ArtifactProduced {
        execution_id: String,
        step_id: String,
        artifact_id: String,
        artifact_name: String,
        artifact_type: String,
        canonical_path: String,
        content_summary: Option<String>,
    },

    Completed {
        execution_id: String,
        final_outputs: Vec<StepOutput>,
    },

    Failed {
        execution_id: String,
        reason: String,
        recoverable: bool,
        failed_step_id: Option<String>,
    },

    Heartbeat {
        execution_id: String,
        timestamp_ms: u64,
    },
}

impl ExecutionEvent {
    pub fn execution_id(&self) -> &str {
        match self {
            ExecutionEvent::ExecutionStarted { execution_id, .. } => execution_id,
            ExecutionEvent::PhaseChanged { execution_id, .. } => execution_id,
            ExecutionEvent::StepStarted { execution_id, .. } => execution_id,
            ExecutionEvent::StepCompleted { execution_id, .. } => execution_id,
            ExecutionEvent::ToolWillExecute { execution_id, .. } => execution_id,
            ExecutionEvent::ToolDidExecute { execution_id, .. } => execution_id,
            ExecutionEvent::FileWrite { execution_id, .. } => execution_id,
            ExecutionEvent::ModelCalled { execution_id, .. } => execution_id,
            ExecutionEvent::ApprovalRequired { execution_id, .. } => execution_id,
            ExecutionEvent::InputRequired { execution_id, .. } => execution_id,
            ExecutionEvent::ArtifactProduced { execution_id, .. } => execution_id,
            ExecutionEvent::Completed { execution_id, .. } => execution_id,
            ExecutionEvent::Failed { execution_id, .. } => execution_id,
            ExecutionEvent::Heartbeat { execution_id, .. } => execution_id,
        }
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum RiskLevel {
    Low,
    Medium,
    High,
    Critical,
}

impl RiskLevel {
    pub fn requires_approval(&self) -> bool {
        matches!(self, RiskLevel::High | RiskLevel::Critical)
    }
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ToolResultStatus {
    Success,
    Failed,
    BlockedByPolicy,
    RateLimited,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ExecutionPhase {
    Planning,
    Executing,
    Reviewing,
    Finalizing,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArtifactReference {
    pub artifact_id: String,
    pub name: String,
    pub path: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct StepOutput {
    pub key: String,
    pub value: serde_json::Value,
    pub content_type: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CostEstimate {
    pub token_estimate: u32,
    pub cost_usd: Option<f64>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionStartedEvent {
    pub execution_id: String,
    pub run_id: String,
    pub playbook_handle_id: String,
    pub version_id: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PhaseChangedEvent {
    pub execution_id: String,
    pub phase: ExecutionPhase,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepStartedEvent {
    pub execution_id: String,
    pub step_id: String,
    pub capability_ref: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepCompletedEvent {
    pub execution_id: String,
    pub step_id: String,
    pub outputs: Vec<StepOutput>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolWillExecuteEvent {
    pub execution_id: String,
    pub step_id: String,
    pub tool_name: String,
    pub tool_args: serde_json::Value,
    pub workspace_id: String,
    pub risk_level: RiskLevel,
    pub estimated_cost: Option<CostEstimate>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolDidExecuteEvent {
    pub execution_id: String,
    pub step_id: String,
    pub tool_name: String,
    pub result_status: ToolResultStatus,
    pub result_summary: String,
    pub artifacts_created: Vec<ArtifactReference>,
    pub error_detail: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FileWriteEvent {
    pub execution_id: String,
    pub step_id: String,
    pub relative_path: String,
    pub size_bytes: u64,
    pub content_hash: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ModelCalledEvent {
    pub execution_id: String,
    pub step_id: String,
    pub provider: String,
    pub model: String,
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
    pub latency_ms: u64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ApprovalRequiredEvent {
    pub execution_id: String,
    pub approval_id: String,
    pub step_id: String,
    pub prompt: String,
    pub risk_level: RiskLevel,
    pub suggested_action: Option<String>,
    pub expires_at: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct InputRequiredEvent {
    pub execution_id: String,
    pub step_id: String,
    pub prompt: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ArtifactProducedEvent {
    pub execution_id: String,
    pub step_id: String,
    pub artifact_id: String,
    pub artifact_name: String,
    pub artifact_type: String,
    pub canonical_path: String,
    pub content_summary: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompletedEvent {
    pub execution_id: String,
    pub final_outputs: Vec<StepOutput>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FailedEvent {
    pub execution_id: String,
    pub reason: String,
    pub recoverable: bool,
    pub failed_step_id: Option<String>,
}
