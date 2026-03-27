#[test]
fn core_product_entities_roundtrip_through_serde() {
    use decacan_runtime::approval::entity::Approval;
    use decacan_runtime::artifact::entity::{Artifact, ArtifactType};
    use decacan_runtime::playbook::entity::Playbook;
    use decacan_runtime::playbook::modes::PlaybookMode;
    use decacan_runtime::task::entity::Task;
    use decacan_runtime::workspace::entity::Workspace;
    use uuid::Uuid;

    let workspace = Workspace::new_for_test("workspace-1", "workspace", "/tmp/workspace");
    let encoded = serde_json::to_string(&workspace).unwrap();
    let decoded: Workspace = serde_json::from_str(&encoded).unwrap();
    assert_eq!(decoded, workspace);

    let playbook = Playbook::new_for_test(
        "playbook-1",
        "workspace-1",
        "playbook.summary",
        PlaybookMode::Discovery,
    );
    let encoded = serde_json::to_string(&playbook).unwrap();
    let decoded: Playbook = serde_json::from_str(&encoded).unwrap();
    assert_eq!(decoded, playbook);

    let mode = PlaybookMode::Standard;
    let encoded = serde_json::to_string(&mode).unwrap();
    let decoded: PlaybookMode = serde_json::from_str(&encoded).unwrap();
    assert_eq!(decoded, mode);

    let task = Task::new_for_test(
        "task-1",
        "workspace-1",
        "playbook-1",
        Uuid::parse_str("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa").unwrap(),
    );
    let encoded = serde_json::to_string(&task).unwrap();
    let decoded: Task = serde_json::from_str(&encoded).unwrap();
    assert_eq!(decoded, task);

    let approval = Approval::new_for_test("approval-1", "task-1");
    let encoded = serde_json::to_string(&approval).unwrap();
    let decoded: Approval = serde_json::from_str(&encoded).unwrap();
    assert_eq!(decoded, approval);

    let artifact = Artifact::new_primary_for_test(
        "artifact-1",
        "task-1",
        "summary",
        "workspace.summary.primary",
        "artifacts/summary.md",
        "output/summary.md",
        ArtifactType::Summary,
    );
    let encoded = serde_json::to_string(&artifact).unwrap();
    let decoded: Artifact = serde_json::from_str(&encoded).unwrap();
    assert_eq!(decoded, artifact);
}
