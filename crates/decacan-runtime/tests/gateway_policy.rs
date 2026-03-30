use decacan_runtime::gateway::descriptor::ToolDescriptor;
use decacan_runtime::gateway::request::ToolRequest;
use decacan_runtime::gateway::result::{PolicyDecision, ToolResult};
use decacan_runtime::gateway::tool_gateway::ToolGateway;
use decacan_runtime::policy::entity::PolicyProfile;
use decacan_runtime::workspace::entity::{
    PathRules, ReadBoundary, WorkspacePolicy, WorkspaceScope, WriteBoundary,
};
use std::path::PathBuf;
use time::OffsetDateTime;

fn gateway_for_test() -> ToolGateway {
    ToolGateway::new(
        PolicyProfile::new_for_test("policy-1", "workspace-1", "default"),
        "/tmp/workspace/output",
    )
}

fn workspace_policy_for_test() -> WorkspacePolicy {
    WorkspacePolicy::new(
        "wp-1",
        "workspace-1",
        WorkspaceScope::FullWorkspace,
        ReadBoundary::default(),
        WriteBoundary::output_only("/tmp/workspace/output"),
        PathRules::default(),
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
    assert!(matches!(
        record.decision,
        PolicyDecision::ApprovalRequired { .. }
    ));
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
fn overwrite_boundary_precedes_denied_tool_policy() {
    let gateway = gateway_for_test();
    let request = request_for_test("network.egress", "overwrite")
        .with_target_path("/tmp/workspace/secrets.txt")
        .with_overwrite_existing(true);

    let (decision, record) = gateway.evaluate(request, OffsetDateTime::UNIX_EPOCH);

    assert!(matches!(decision, PolicyDecision::ApprovalRequired { .. }));
    assert!(matches!(
        record.decision,
        PolicyDecision::ApprovalRequired { .. }
    ));
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
fn gateway_uses_workspace_policy_for_boundary_checks() {
    let policy = workspace_policy_for_test();
    let gateway = ToolGateway::new_with_workspace_policy(
        PolicyProfile::new_for_test("policy-1", "workspace-1", "default"),
        "/tmp/workspace/output",
        policy,
    );

    // Test write within boundary - should be allowed by tool-level policy
    let request = request_for_test("artifact.write", "write")
        .with_target_path("/tmp/workspace/output/file.txt")
        .with_overwrite_existing(true);
    let (decision, _) = gateway.evaluate(request, OffsetDateTime::UNIX_EPOCH);
    assert!(matches!(decision, PolicyDecision::Allow { .. }));

    // Test write outside write boundary but within output root
    let request = request_for_test("artifact.write", "write")
        .with_target_path("/tmp/workspace/other/file.txt")
        .with_overwrite_existing(true);
    let (decision, _) = gateway.evaluate(request, OffsetDateTime::UNIX_EPOCH);
    assert!(
        matches!(decision, PolicyDecision::ApprovalRequired { .. }),
        "Should require approval for write outside output boundary"
    );
}

#[test]
fn path_traversal_blocked_via_workspace_policy() {
    let policy = workspace_policy_for_test();
    let gateway = ToolGateway::new_with_workspace_policy(
        PolicyProfile::new_for_test("policy-1", "workspace-1", "default"),
        "/tmp/workspace/output",
        policy,
    );

    // Test path traversal attempt
    let request = request_for_test("artifact.write", "write")
        .with_target_path("/tmp/workspace/output/../secrets.txt")
        .with_overwrite_existing(true);
    let (decision, _) = gateway.evaluate(request, OffsetDateTime::UNIX_EPOCH);
    assert!(
        matches!(decision, PolicyDecision::Deny { .. }),
        "Should deny path traversal"
    );

    // Test with different traversal pattern
    let request = request_for_test("artifact.read", "read")
        .with_target_path("/tmp/workspace/output/../../etc/passwd");
    let (decision, _) = gateway.evaluate(request, OffsetDateTime::UNIX_EPOCH);
    assert!(
        matches!(decision, PolicyDecision::Deny { .. }),
        "Should deny path traversal with double dots"
    );
}

#[test]
fn read_boundary_checked_for_read_operations() {
    let mut read_boundary = ReadBoundary::default();
    read_boundary
        .allowed_paths
        .push(PathBuf::from("/tmp/workspace"));

    let policy = WorkspacePolicy::new(
        "wp-2",
        "workspace-1",
        WorkspaceScope::FullWorkspace,
        read_boundary,
        WriteBoundary::output_only("/tmp/workspace/output"),
        PathRules::default(),
    );

    let gateway = ToolGateway::new_with_workspace_policy(
        PolicyProfile::new_for_test("policy-1", "workspace-1", "default"),
        "/tmp/workspace/output",
        policy,
    );

    // Test read within allowed boundary - use workspace.read which is in allowed_tools
    let request =
        request_for_test("workspace.read", "read").with_target_path("/tmp/workspace/file.txt");
    let (decision, _) = gateway.evaluate(request, OffsetDateTime::UNIX_EPOCH);
    assert!(matches!(decision, PolicyDecision::Allow { .. }));

    // Test read outside allowed boundary - use workspace.read which is in allowed_tools
    let request = request_for_test("workspace.read", "read").with_target_path("/etc/passwd");
    let (decision, _) = gateway.evaluate(request, OffsetDateTime::UNIX_EPOCH);
    assert!(
        matches!(decision, PolicyDecision::ApprovalRequired { .. }),
        "Should require approval for read outside workspace"
    );
}

#[test]
fn workspace_policy_precedes_tool_level_policy() {
    // Create a policy that denies path traversal even for allowed tools
    let policy = workspace_policy_for_test();
    let gateway = ToolGateway::new_with_workspace_policy(
        PolicyProfile::new_for_test("policy-1", "workspace-1", "default"),
        "/tmp/workspace/output",
        policy,
    );

    // artifact.write is in the allowed tools list in new_for_test
    // but path traversal should still be blocked by workspace policy
    let request = request_for_test("artifact.write", "write")
        .with_target_path("/tmp/workspace/output/../../../etc/passwd")
        .with_overwrite_existing(true);
    let (decision, _) = gateway.evaluate(request, OffsetDateTime::UNIX_EPOCH);
    assert!(
        matches!(decision, PolicyDecision::Deny { .. }),
        "Workspace policy should block path traversal before tool-level policy allows it"
    );
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
