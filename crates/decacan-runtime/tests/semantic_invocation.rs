#[test]
fn semantic_invocation_requests_tool_and_returns_output_candidate() {
    let result = decacan_runtime::semantic::executor::run_summary_invocation_for_test();
    assert_eq!(result.output_candidates.len(), 1);
}
