use std::path::PathBuf;

use serde::{Deserialize, Serialize};

use crate::semantic::events::{ContinuationState, SemanticInvocationEvent};
use crate::semantic::model::OutputCandidate;
use crate::semantic::planner::{LocalPlan, PlannerInput, SemanticPlanStep};
use crate::semantic::tool_protocol::ToolCall;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct InvocationContext {
    pub source_material: String,
    pub read_target_path: Option<PathBuf>,
    pub source_path: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct InvocationState {
    pub local_plan: LocalPlan,
    pub next_step_index: usize,
    pub requested_tools: Vec<ToolCall>,
    pub pending_tool_call: Option<ToolCall>,
    pub output_candidates: Vec<OutputCandidate>,
    pub continuation: ContinuationState,
    pub events: Vec<SemanticInvocationEvent>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ResumeAction {
    ToolCompleted,
}

impl InvocationState {
    pub fn new(context: &InvocationContext) -> Self {
        let local_plan = LocalPlan::summary(&PlannerInput {
            read_target_path: context.read_target_path.clone(),
        });
        let step_count = local_plan.steps.len();
        Self {
            local_plan,
            next_step_index: 0,
            requested_tools: Vec::new(),
            pending_tool_call: None,
            output_candidates: Vec::new(),
            continuation: ContinuationState::Ready,
            events: vec![SemanticInvocationEvent::LocalPlanPrepared { step_count }],
        }
    }

    pub fn current_step(&self) -> Option<&SemanticPlanStep> {
        self.local_plan.steps.get(self.next_step_index)
    }

    pub fn advance(&mut self) {
        self.next_step_index += 1;
        self.pending_tool_call = None;
        self.continuation = if self.next_step_index >= self.local_plan.steps.len() {
            ContinuationState::Completed
        } else {
            ContinuationState::Ready
        };
    }

    pub fn fail(&mut self) {
        self.continuation = ContinuationState::Failed;
    }
}
