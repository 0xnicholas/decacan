use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::synthesis::tool_protocol::ToolCall;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum SynthesisPlanStep {
    RequestTool(ToolCall),
    ProduceOutputCandidate,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct LocalPlan {
    pub steps: Vec<SynthesisPlanStep>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PlannerInput {
    pub read_target_path: Option<PathBuf>,
}

impl LocalPlan {
    pub fn summary(input: &PlannerInput) -> Self {
        let tool_call = match input.read_target_path.clone() {
            Some(target_path) => ToolCall::new(
                "workspace.read",
                "Read markdown materials required for the summary invocation.",
            )
            .with_target_path(target_path),
            None => ToolCall::new(
                "workspace.read",
                "Read markdown materials required for the summary invocation.",
            ),
        };

        Self {
            steps: vec![
                SynthesisPlanStep::RequestTool(tool_call),
                SynthesisPlanStep::ProduceOutputCandidate,
            ],
        }
    }
}
