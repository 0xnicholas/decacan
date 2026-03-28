use decacan_runtime::playbook::modes::PlaybookMode;
use decacan_runtime::playbook::registry::{
    get_registered_playbook, list_registered_playbooks, DISCOVER_TOPICS_PLAYBOOK_KEY,
    SUMMARY_PLAYBOOK_KEY,
};
use decacan_runtime::workflow::compiler::{
    compile_discovery_playbook_for_test, compile_summary_playbook_for_test,
};

#[test]
fn registry_exposes_expected_playbooks_with_stable_metadata() {
    let playbooks = list_registered_playbooks();
    let playbook_keys: Vec<_> = playbooks
        .iter()
        .map(|playbook| playbook.key.as_str())
        .collect();

    assert_eq!(
        playbook_keys,
        vec![SUMMARY_PLAYBOOK_KEY, DISCOVER_TOPICS_PLAYBOOK_KEY]
    );

    let summary = get_registered_playbook(SUMMARY_PLAYBOOK_KEY).expect("summary playbook");
    let discovery =
        get_registered_playbook(DISCOVER_TOPICS_PLAYBOOK_KEY).expect("discovery playbook");
    let summary_again =
        get_registered_playbook(SUMMARY_PLAYBOOK_KEY).expect("summary playbook should be stable");

    assert_eq!(summary.mode, PlaybookMode::Standard);
    assert_eq!(discovery.mode, PlaybookMode::Discovery);
    assert_eq!(summary, summary_again);
}

#[test]
fn discovery_playbook_compiles_to_expected_workflow() {
    let workflow = compile_discovery_playbook_for_test();
    let step_ids: Vec<_> = workflow.steps.iter().map(|s| s.id.as_str()).collect();

    assert_eq!(
        step_ids,
        vec![
            "scan_markdown_files",
            "read_markdown_contents",
            "discover_themes",
            "draft_discovery",
            "write_discovery",
            "register_artifact"
        ]
    );
}

#[test]
fn summary_playbook_compiles_to_expected_workflow() {
    let workflow = compile_summary_playbook_for_test();
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
