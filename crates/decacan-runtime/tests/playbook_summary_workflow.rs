#[test]
fn summary_playbook_compiles_to_expected_workflow() {
    let workflow = decacan_runtime::workflow::compiler::compile_summary_playbook_for_test();
    let step_ids: Vec<_> = workflow.steps.iter().map(|s| s.id.as_str()).collect();

    assert_eq!(
        step_ids,
        vec![
            "scan_markdown_files",
            "read_markdown_contents",
            "discover_topics",
            "draft_summary",
            "backup_existing_summary",
            "write_summary",
            "register_artifact"
        ]
    );
}
