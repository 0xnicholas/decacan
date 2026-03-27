use serde::{Deserialize, Serialize};

use crate::semantic::tool_protocol::ToolCall;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SemanticPlanStep {
    RequestTool(ToolCall),
    ProduceOutputCandidate,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct LocalPlan {
    pub steps: Vec<SemanticPlanStep>,
}

impl LocalPlan {
    pub fn summary() -> Self {
        Self {
            steps: vec![
                SemanticPlanStep::RequestTool(
                    ToolCall::new(
                        "workspace.read",
                        "Read markdown materials required for the summary invocation.",
                    )
                    .with_target_path("/tmp/workspace/notes.md"),
                ),
                SemanticPlanStep::ProduceOutputCandidate,
            ],
        }
    }
}
