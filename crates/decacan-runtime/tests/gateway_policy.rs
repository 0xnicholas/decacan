#[test]
fn overwrite_outside_output_requires_approval() {
    let result = decacan_runtime::gateway::tool_gateway::evaluate_overwrite_for_test();
    assert!(matches!(
        result,
        decacan_runtime::gateway::result::ToolResult::ApprovalRequired { .. }
    ));
}

#[test]
fn overwrite_using_output_traversal_requires_approval() {
    let result = decacan_runtime::gateway::tool_gateway::evaluate_output_traversal_for_test();
    assert!(matches!(
        result,
        decacan_runtime::gateway::result::ToolResult::ApprovalRequired { .. }
    ));
}

#[test]
fn tool_result_uses_documented_status_contract() {
    let ok = serde_json::to_value(decacan_runtime::gateway::result::ToolResult::Ok {
        reason: "allowed".to_owned(),
    })
    .unwrap();
    assert_eq!(ok["status"], "ok");

    let error = serde_json::to_value(decacan_runtime::gateway::result::ToolResult::Error {
        reason: "failed".to_owned(),
    })
    .unwrap();
    assert_eq!(error["status"], "error");
}
