#[test]
fn overwrite_outside_output_requires_approval() {
    let result = decacan_runtime::gateway::tool_gateway::evaluate_overwrite_for_test();
    assert!(matches!(
        result,
        decacan_runtime::gateway::result::ToolResult::ApprovalRequired { .. }
    ));
}
