use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SemanticInvocationEvent {
    LocalPlanPrepared { step_count: usize },
    ToolRequested { tool_name: String },
    ContinuationAdvanced { state: String },
    OutputCandidateReturned { logical_name: String },
}
