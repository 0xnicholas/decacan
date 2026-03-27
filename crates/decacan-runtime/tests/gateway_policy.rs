use decacan_runtime::gateway::descriptor::ToolDescriptor;
use decacan_runtime::gateway::request::ToolRequest;
use decacan_runtime::gateway::result::{PolicyDecision, ToolResult};
use decacan_runtime::gateway::tool_gateway::ToolGateway;
use decacan_runtime::policy::entity::PolicyProfile;
use time::OffsetDateTime;

fn gateway_for_test() -> ToolGateway {
    ToolGateway::new(
        PolicyProfile::new_for_test("policy-1", "workspace-1", "default"),
        "/tmp/workspace/output",
    )
}

fn request_for_test(tool_name: &str, action: &str) -> ToolRequest {
    ToolRequest::new(ToolDescriptor::new(tool_name, "tool fixture"), action)
}

#[test]
fn overwrite_outside_output_requires_approval() {
    let gateway = gateway_for_test();
    let request = request_for_test("artifact.write", "overwrite")
        .with_target_path("/tmp/workspace/notes.md")
        .with_overwrite_existing(true);

    let (decision, record) = gateway.evaluate(request, OffsetDateTime::UNIX_EPOCH);

    assert!(matches!(decision, PolicyDecision::ApprovalRequired { .. }));
    assert!(matches!(record.decision, PolicyDecision::ApprovalRequired { .. }));
}

#[test]
fn overwrite_using_output_traversal_requires_approval() {
    let gateway = gateway_for_test();
    let request = request_for_test("artifact.write", "overwrite")
        .with_target_path("/tmp/workspace/output/../notes.md")
        .with_overwrite_existing(true);

    let (decision, _) = gateway.evaluate(request, OffsetDateTime::UNIX_EPOCH);

    assert!(matches!(decision, PolicyDecision::ApprovalRequired { .. }));
}

#[test]
fn allowed_tool_returns_allow_policy_decision() {
    let gateway = gateway_for_test();
    let request = request_for_test("artifact.write", "write");

    let (decision, _) = gateway.evaluate(request, OffsetDateTime::UNIX_EPOCH);

    assert!(matches!(decision, PolicyDecision::Allow { .. }));
}

#[test]
fn approval_required_tool_returns_approval_policy_decision() {
    let gateway = gateway_for_test();
    let request = request_for_test("shell.exec", "run");

    let (decision, _) = gateway.evaluate(request, OffsetDateTime::UNIX_EPOCH);

    assert!(matches!(decision, PolicyDecision::ApprovalRequired { .. }));
}

#[test]
fn denied_tool_returns_deny_policy_decision() {
    let gateway = gateway_for_test();
    let request = request_for_test("network.egress", "send");

    let (decision, _) = gateway.evaluate(request, OffsetDateTime::UNIX_EPOCH);

    assert!(matches!(decision, PolicyDecision::Deny { .. }));
}

#[test]
fn evaluation_uses_request_descriptor_identity_as_single_source_of_truth() {
    let gateway = gateway_for_test();
    let request = request_for_test("shell.exec", "run");

    let (decision, record) = gateway.evaluate(request, OffsetDateTime::UNIX_EPOCH);

    assert!(matches!(decision, PolicyDecision::ApprovalRequired { .. }));
    assert_eq!(record.request.descriptor.name, "shell.exec");
}

#[test]
fn tool_result_uses_documented_status_contract() {
    let ok = serde_json::to_value(ToolResult::Ok {
        reason: "allowed".to_owned(),
    })
    .unwrap();
    assert_eq!(ok["status"], "ok");

    let approval_required = serde_json::to_value(ToolResult::ApprovalRequired {
        reason: "review".to_owned(),
    })
    .unwrap();
    assert_eq!(approval_required["status"], "approval_required");

    let denied = serde_json::to_value(ToolResult::Denied {
        reason: "blocked".to_owned(),
    })
    .unwrap();
    assert_eq!(denied["status"], "denied");

    let error = serde_json::to_value(ToolResult::Error {
        reason: "failed".to_owned(),
    })
    .unwrap();
    assert_eq!(error["status"], "error");
}
