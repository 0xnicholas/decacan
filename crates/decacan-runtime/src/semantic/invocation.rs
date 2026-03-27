use serde::{Deserialize, Serialize};

use crate::semantic::events::SemanticInvocationEvent;
use crate::semantic::model::OutputCandidate;
use crate::semantic::planner::{LocalPlan, SemanticPlanStep};
use crate::semantic::tool_protocol::ToolCall;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum ContinuationState {
    Ready,
    AwaitingTool,
    Completed,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct InvocationState {
    pub task_id: String,
    pub run_id: String,
    pub local_plan: LocalPlan,
    pub next_step_index: usize,
    pub requested_tools: Vec<ToolCall>,
    pub source_material: Option<String>,
    pub output_candidates: Vec<OutputCandidate>,
    pub continuation: ContinuationState,
    pub events: Vec<SemanticInvocationEvent>,
}

impl InvocationState {
    pub fn new(task_id: impl Into<String>, run_id: impl Into<String>, local_plan: LocalPlan) -> Self {
        let step_count = local_plan.steps.len();
        Self {
            task_id: task_id.into(),
            run_id: run_id.into(),
            local_plan,
            next_step_index: 0,
            requested_tools: Vec::new(),
            source_material: None,
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
        self.continuation = if self.next_step_index >= self.local_plan.steps.len() {
            ContinuationState::Completed
        } else {
            ContinuationState::Ready
        };
    }
}
