use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ContinuationState {
    Ready,
    AwaitingTool,
    Completed,
    Failed,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SynthesisInvocationEvent {
    LocalPlanPrepared { step_count: usize },
    ToolRequested { tool_name: String },
    ContinuationAdvanced { state: ContinuationState },
    OutputCandidateReturned { logical_name: String },
}
