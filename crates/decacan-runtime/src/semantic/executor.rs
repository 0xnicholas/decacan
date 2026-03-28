use serde::{Deserialize, Serialize};

use crate::semantic::events::SemanticInvocationEvent;
use crate::semantic::model::{ModelContext, OutputCandidate, SemanticModel};
use crate::semantic::planner::SemanticPlanStep;
use crate::semantic::tool_protocol::{ToolCallResult, ToolProtocol};

pub use crate::semantic::events::ContinuationState;
pub use crate::semantic::invocation::{InvocationContext, InvocationState, ResumeAction};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct InvocationResult {
    pub state: InvocationState,
    pub outcome: InvocationOutcome,
    pub pending_action: Option<PendingAction>,
    pub output_candidates: Vec<OutputCandidate>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum InvocationOutcome {
    Completed,
    Blocked(BlockedReason),
    Failed { reason: String },
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum PendingAction {
    ToolRequest {
        request: crate::semantic::tool_protocol::ToolCall,
    },
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "reason", rename_all = "snake_case")]
pub enum BlockedReason {
    AwaitingToolCompletion { detail: String },
    ApprovalRequired { detail: String },
    Denied { detail: String },
}

pub fn start_summary_invocation<T, M>(
    context: &InvocationContext,
    tool_protocol: &T,
    model: &M,
) -> InvocationResult
where
    T: ToolProtocol,
    M: SemanticModel,
{
    execute_summary_invocation(
        InvocationState::new(context),
        context,
        None,
        tool_protocol,
        model,
    )
}

pub fn resume_summary_invocation<T, M>(
    state: InvocationState,
    context: &InvocationContext,
    continuation: ResumeAction,
    tool_protocol: &T,
    model: &M,
) -> InvocationResult
where
    T: ToolProtocol,
    M: SemanticModel,
{
    execute_summary_invocation(state, context, Some(continuation), tool_protocol, model)
}

fn execute_summary_invocation<T, M>(
    mut state: InvocationState,
    context: &InvocationContext,
    mut resume_action: Option<ResumeAction>,
    tool_protocol: &T,
    model: &M,
) -> InvocationResult
where
    T: ToolProtocol,
    M: SemanticModel,
{
    loop {
        let Some(step) = state.current_step().cloned() else {
            state.continuation = ContinuationState::Completed;
            return InvocationResult {
                output_candidates: state.output_candidates.clone(),
                pending_action: None,
                outcome: InvocationOutcome::Completed,
                state,
            };
        };

        match step {
            SemanticPlanStep::RequestTool(tool_call) => {
                if state.continuation == ContinuationState::AwaitingTool {
                    match resume_action.take() {
                        Some(ResumeAction::ToolCompleted) => {
                            state
                                .events
                                .push(SemanticInvocationEvent::ContinuationAdvanced {
                                    state: ContinuationState::Ready,
                                });
                            state.advance();
                            continue;
                        }
                        None => {
                            return InvocationResult {
                                output_candidates: state.output_candidates.clone(),
                                pending_action: state
                                    .pending_tool_call
                                    .clone()
                                    .map(|request| PendingAction::ToolRequest { request }),
                                outcome: blocked_outcome_for_pending(&state),
                                state,
                            };
                        }
                    }
                }

                state.events.push(SemanticInvocationEvent::ToolRequested {
                    tool_name: tool_call.name.clone(),
                });
                state.requested_tools.push(tool_call.clone());

                match tool_protocol.invoke(tool_call.clone()) {
                    Ok(ToolCallResult::Allowed { reason }) => {
                        state.pending_tool_call = Some(tool_call.clone());
                        state.continuation = ContinuationState::AwaitingTool;
                        return InvocationResult {
                            output_candidates: state.output_candidates.clone(),
                            pending_action: Some(PendingAction::ToolRequest { request: tool_call }),
                            outcome: InvocationOutcome::Blocked(
                                BlockedReason::AwaitingToolCompletion { detail: reason },
                            ),
                            state,
                        };
                    }
                    Ok(ToolCallResult::ApprovalRequired { reason }) => {
                        state.pending_tool_call = Some(tool_call.clone());
                        state.continuation = ContinuationState::AwaitingTool;
                        return InvocationResult {
                            output_candidates: state.output_candidates.clone(),
                            pending_action: Some(PendingAction::ToolRequest { request: tool_call }),
                            outcome: InvocationOutcome::Blocked(BlockedReason::ApprovalRequired {
                                detail: reason,
                            }),
                            state,
                        };
                    }
                    Ok(ToolCallResult::Denied { reason }) => {
                        state.pending_tool_call = None;
                        state.continuation = ContinuationState::Ready;
                        return InvocationResult {
                            output_candidates: state.output_candidates.clone(),
                            pending_action: None,
                            outcome: InvocationOutcome::Blocked(BlockedReason::Denied {
                                detail: reason,
                            }),
                            state,
                        };
                    }
                    Err(error) => {
                        state.fail();
                        return InvocationResult {
                            output_candidates: state.output_candidates.clone(),
                            pending_action: None,
                            outcome: InvocationOutcome::Failed {
                                reason: format!("tool protocol failed: {error:?}"),
                            },
                            state,
                        };
                    }
                }
            }
            SemanticPlanStep::ProduceOutputCandidate => {
                let context = ModelContext {
                    source_material: context.source_material.clone(),
                    source_path: context.source_path.clone(),
                };

                match model.produce_output_candidate(&context) {
                    Ok(output_candidate) => {
                        state
                            .events
                            .push(SemanticInvocationEvent::OutputCandidateReturned {
                                logical_name: output_candidate.logical_name.clone(),
                            });
                        state.output_candidates.push(output_candidate);
                        state.advance();
                    }
                    Err(error) => {
                        state.fail();
                        return InvocationResult {
                            output_candidates: state.output_candidates.clone(),
                            pending_action: None,
                            outcome: InvocationOutcome::Failed {
                                reason: format!("model failed: {error:?}"),
                            },
                            state,
                        };
                    }
                }
            }
        }
    }
}

fn blocked_outcome_for_pending(state: &InvocationState) -> InvocationOutcome {
    if state.pending_tool_call.is_some() {
        InvocationOutcome::Blocked(BlockedReason::AwaitingToolCompletion {
            detail: "tool request is awaiting external continuation".to_owned(),
        })
    } else {
        InvocationOutcome::Failed {
            reason: "invocation resumed without a pending action".to_owned(),
        }
    }
}
