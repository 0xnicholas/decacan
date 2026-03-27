use crate::gateway::semantic_adapter::SemanticGatewayAdapter;
use crate::gateway::tool_gateway::ToolGateway;
use crate::policy::entity::PolicyProfile;
use crate::semantic::events::SemanticInvocationEvent;
use crate::semantic::invocation::{ContinuationState, InvocationState};
use crate::semantic::model::{ModelContext, OutputCandidate, SemanticModel};
use crate::semantic::planner::{LocalPlan, SemanticPlanStep};
use crate::semantic::tool_protocol::{ToolCallResult, ToolProtocol};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct InvocationResult {
    pub output_candidates: Vec<OutputCandidate>,
}

pub fn run_summary_invocation_for_test() -> InvocationResult {
    let gateway = ToolGateway::new(
        PolicyProfile::new_for_test("policy-1", "workspace-1", "default"),
        "/tmp/workspace/output",
    );
    let tool_protocol = SemanticGatewayAdapter::new(gateway);
    let model = SummaryModelForTest;

    execute_summary_invocation(&tool_protocol, &model)
}

fn execute_summary_invocation<T, M>(tool_protocol: &T, model: &M) -> InvocationResult
where
    T: ToolProtocol,
    M: SemanticModel,
{
    let mut state = InvocationState::new("task-1", "run-1", LocalPlan::summary());

    while let Some(step) = state.current_step().cloned() {
        match step {
            SemanticPlanStep::RequestTool(tool_call) => {
                state.continuation = ContinuationState::AwaitingTool;
                state.events.push(SemanticInvocationEvent::ToolRequested {
                    tool_name: tool_call.name.clone(),
                });
                state.requested_tools.push(tool_call.clone());

                match tool_protocol.invoke(tool_call) {
                    Ok(ToolCallResult::Allowed { payload, .. }) => {
                        state.source_material = Some(payload);
                        state.events.push(SemanticInvocationEvent::ContinuationAdvanced {
                            state: "ready".to_owned(),
                        });
                        state.advance();
                    }
                    Ok(ToolCallResult::ApprovalRequired { .. })
                    | Ok(ToolCallResult::Denied { .. })
                    | Ok(ToolCallResult::Error { .. })
                    | Err(_) => break,
                }
            }
            SemanticPlanStep::ProduceOutputCandidate => {
                let context = ModelContext {
                    task_id: state.task_id.clone(),
                    run_id: state.run_id.clone(),
                    source_material: state.source_material.clone().unwrap_or_default(),
                };

                if let Ok(output_candidate) = model.produce_output_candidate(&context) {
                    state.events.push(SemanticInvocationEvent::OutputCandidateReturned {
                        logical_name: output_candidate.logical_name.clone(),
                    });
                    state.output_candidates.push(output_candidate);
                    state.advance();
                } else {
                    break;
                }
            }
        }
    }

    InvocationResult {
        output_candidates: state.output_candidates,
    }
}

#[derive(Debug, Clone, Copy)]
struct SummaryModelForTest;

impl SemanticModel for SummaryModelForTest {
    type Error = ();

    fn produce_output_candidate(
        &self,
        context: &ModelContext,
    ) -> Result<OutputCandidate, Self::Error> {
        Ok(OutputCandidate {
            artifact_id: "artifact-summary-1".to_owned(),
            logical_name: "summary.md".to_owned(),
            canonical_path: format!("/{}/summary.md", context.task_id),
            physical_path: format!("/tmp/{}/summary.md", context.run_id),
            content: format!("Summary generated from {}", context.source_material),
        })
    }
}
