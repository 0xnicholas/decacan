use decacan_runtime::gateway::{SemanticGatewayAdapter, ToolGateway};
use decacan_runtime::policy::entity::PolicyProfile;
use decacan_runtime::unstable_semantic::{
    resume_summary_invocation, start_summary_invocation, BlockedReason, ContinuationState,
    InvocationContext, InvocationOutcome, InvocationState, ModelContext, OutputCandidate,
    PendingAction, ResumeAction, SemanticModel, ToolCall, ToolCallResult, ToolProtocol,
};
use serde_json::{from_str, to_string};

#[test]
fn semantic_invocation_requests_tool_and_returns_output_candidate() {
    let gateway = ToolGateway::new(
        PolicyProfile::new_for_test("policy-1", "workspace-1", "default"),
        "/tmp/workspace/output",
    );
    let tool_protocol = SemanticGatewayAdapter::new(gateway);
    let model = SummaryModelForTest;
    let context = InvocationContext {
        source_material: "source material collected outside semantic".to_owned(),
        read_target_path: Some("/workspace/notes.md".into()),
        source_path: Some("notes.md".to_owned()),
    };
    let blocked = start_summary_invocation(&context, &tool_protocol, &model);

    assert_eq!(
        blocked.outcome,
        InvocationOutcome::Blocked(BlockedReason::AwaitingToolCompletion {
            detail: "tool 'workspace.read' allowed by policy".to_owned(),
        })
    );
    assert!(matches!(
        blocked.pending_action,
        Some(PendingAction::ToolRequest { request }) if request.name == "workspace.read"
    ));
    assert_eq!(blocked.output_candidates.len(), 0);
    assert_eq!(blocked.state.continuation, ContinuationState::AwaitingTool);

    let completed = resume_summary_invocation(
        blocked.state,
        &context,
        ResumeAction::ToolCompleted,
        &StubToolProtocol::error("resume should not re-evaluate tool"),
        &model,
    );

    assert_eq!(completed.outcome, InvocationOutcome::Completed);
    assert_eq!(completed.pending_action, None);
    assert_eq!(completed.output_candidates.len(), 1);
    assert_eq!(completed.state.continuation, ContinuationState::Completed);
}

#[test]
fn semantic_invocation_blocks_when_tool_requires_approval() {
    let tool_protocol = StubToolProtocol::approval_required("approval needed");
    let context = invocation_context();

    let result = start_summary_invocation(&context, &tool_protocol, &SummaryModelForTest);

    assert_eq!(
        result.outcome,
        InvocationOutcome::Blocked(BlockedReason::ApprovalRequired {
            detail: "approval needed".to_owned(),
        })
    );
    assert!(matches!(
        result.pending_action,
        Some(PendingAction::ToolRequest { request }) if request.name == "workspace.read"
    ));
    assert_eq!(result.output_candidates.len(), 0);
    assert_eq!(result.state.continuation, ContinuationState::AwaitingTool);
}

#[test]
fn semantic_invocation_blocks_when_tool_is_denied() {
    let tool_protocol = StubToolProtocol::denied("policy denied");
    let context = invocation_context();

    let result = start_summary_invocation(&context, &tool_protocol, &SummaryModelForTest);

    assert_eq!(
        result.outcome,
        InvocationOutcome::Blocked(BlockedReason::Denied {
            detail: "policy denied".to_owned(),
        })
    );
    assert_eq!(result.pending_action, None);
    assert_eq!(result.state.continuation, ContinuationState::Ready);
}

#[test]
fn semantic_invocation_fails_when_tool_protocol_errors() {
    let tool_protocol = StubToolProtocol::error("tool transport broke");
    let context = invocation_context();

    let result = start_summary_invocation(&context, &tool_protocol, &SummaryModelForTest);

    assert_eq!(
        result.outcome,
        InvocationOutcome::Failed {
            reason: "tool protocol failed: \"tool transport broke\"".to_owned(),
        }
    );
    assert_eq!(result.state.continuation, ContinuationState::Failed);
}

#[test]
fn semantic_invocation_fails_when_model_fails() {
    let tool_protocol = StubToolProtocol::allowed("allowed");
    let context = invocation_context();

    let blocked = start_summary_invocation(&context, &tool_protocol, &FailingModel);

    let result = resume_summary_invocation(
        blocked.state,
        &context,
        ResumeAction::ToolCompleted,
        &StubToolProtocol::error("resume should not re-evaluate tool"),
        &FailingModel,
    );

    assert_eq!(
        result.outcome,
        InvocationOutcome::Failed {
            reason: "model failed: \"model refused\"".to_owned(),
        }
    );
    assert_eq!(result.state.continuation, ContinuationState::Failed);
}

#[test]
fn semantic_invocation_state_roundtrips_and_resumes_after_tool_completion() {
    let tool_protocol = StubToolProtocol::allowed("allowed");
    let context = invocation_context();
    let blocked = start_summary_invocation(&context, &tool_protocol, &SummaryModelForTest);
    let serialized = to_string(&blocked.state).expect("state serializes");
    let restored: InvocationState = from_str(&serialized).expect("state deserializes");

    let resumed = resume_summary_invocation(
        restored,
        &context,
        ResumeAction::ToolCompleted,
        &StubToolProtocol::error("resume should not re-evaluate tool"),
        &SummaryModelForTest,
    );

    assert_eq!(resumed.outcome, InvocationOutcome::Completed);
    assert_eq!(resumed.output_candidates.len(), 1);
    assert_eq!(resumed.state.continuation, ContinuationState::Completed);
}

#[test]
fn semantic_adapter_returns_policy_allow_without_fake_payload() {
    let gateway = ToolGateway::new(
        PolicyProfile::new_for_test("policy-1", "workspace-1", "default"),
        "/tmp/workspace/output",
    );
    let adapter = SemanticGatewayAdapter::new(gateway);

    let result = adapter
        .invoke(ToolCall::new("workspace.read", "Read markdown materials"))
        .expect("adapter evaluates policy");

    assert_eq!(
        result,
        ToolCallResult::Allowed {
            reason: "tool 'workspace.read' allowed by policy".to_owned(),
        }
    );
}

#[test]
fn semantic_adapter_preserves_blocking_policy_decisions() {
    let gateway = ToolGateway::new(
        PolicyProfile::new_for_test("policy-1", "workspace-1", "default"),
        "/tmp/workspace/output",
    );
    let adapter = SemanticGatewayAdapter::new(gateway);

    let approval_required = adapter
        .invoke(ToolCall::new("shell.exec", "Execute shell command"))
        .expect("adapter evaluates approval-required policy");
    let denied = adapter
        .invoke(ToolCall::new("network.egress", "Use network"))
        .expect("adapter evaluates denied policy");

    assert_eq!(
        approval_required,
        ToolCallResult::ApprovalRequired {
            reason: "tool 'shell.exec' requires approval by policy".to_owned(),
        }
    );
    assert_eq!(
        denied,
        ToolCallResult::Denied {
            reason: "tool 'network.egress' is denied by policy".to_owned(),
        }
    );
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
            canonical_path: "/artifacts/summary.md".to_owned(),
            physical_path: "/workspace/output/summary.md".to_owned(),
            content: format!("Summary generated from {}", context.source_material),
        })
    }
}

#[derive(Debug, Clone, Copy)]
struct FailingModel;

impl SemanticModel for FailingModel {
    type Error = &'static str;

    fn produce_output_candidate(
        &self,
        _context: &ModelContext,
    ) -> Result<OutputCandidate, Self::Error> {
        Err("model refused")
    }
}

#[derive(Debug, Clone)]
struct StubToolProtocol {
    outcome: Result<ToolCallResult, &'static str>,
}

impl StubToolProtocol {
    fn allowed(reason: &'static str) -> Self {
        Self {
            outcome: Ok(ToolCallResult::Allowed {
                reason: reason.to_owned(),
            }),
        }
    }

    fn approval_required(reason: &'static str) -> Self {
        Self {
            outcome: Ok(ToolCallResult::ApprovalRequired {
                reason: reason.to_owned(),
            }),
        }
    }

    fn denied(reason: &'static str) -> Self {
        Self {
            outcome: Ok(ToolCallResult::Denied {
                reason: reason.to_owned(),
            }),
        }
    }

    fn error(reason: &'static str) -> Self {
        Self {
            outcome: Err(reason),
        }
    }
}

impl ToolProtocol for StubToolProtocol {
    type Error = &'static str;

    fn invoke(&self, _request: ToolCall) -> Result<ToolCallResult, Self::Error> {
        self.outcome.clone()
    }
}

fn invocation_context() -> InvocationContext {
    InvocationContext {
        source_material: "source material collected outside semantic".to_owned(),
        read_target_path: Some("/workspace/notes.md".into()),
        source_path: Some("notes.md".to_owned()),
    }
}
