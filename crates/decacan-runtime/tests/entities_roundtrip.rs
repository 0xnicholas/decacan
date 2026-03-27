#[test]
fn core_product_entities_roundtrip_through_serde() {
    use decacan_runtime::approval::entity::{Approval, ApprovalStatus};
    use decacan_runtime::artifact::entity::{Artifact, ArtifactKind, ArtifactStatus, ArtifactType};
    use decacan_runtime::playbook::entity::{Playbook, PlaybookStatus};
    use decacan_runtime::playbook::modes::PlaybookMode;
    use decacan_runtime::task::entity::{Task, TaskStatus};
    use decacan_runtime::workspace::entity::{Workspace, WorkspaceStatus};

    let workspace = Workspace::new_for_test("workspace-1", "workspace", "/tmp/workspace");
    let encoded = serde_json::to_string(&workspace).unwrap();
    let decoded: Workspace = serde_json::from_str(&encoded).unwrap();
    assert_eq!(decoded.status, WorkspaceStatus::Active);

    let playbook = Playbook::new_for_test(
        "playbook-1",
        "workspace-1",
        "playbook.summary",
        PlaybookMode::Discovery,
    );
    let encoded = serde_json::to_string(&playbook).unwrap();
    let decoded: Playbook = serde_json::from_str(&encoded).unwrap();
    assert_eq!(decoded.mode, PlaybookMode::Discovery);
    assert_eq!(decoded.status, PlaybookStatus::Draft);

    let encoded = serde_json::to_string(&PlaybookMode::Standard).unwrap();
    let decoded: PlaybookMode = serde_json::from_str(&encoded).unwrap();
    assert_eq!(decoded, PlaybookMode::Standard);

    let task = Task::new_for_test("task-1", "workspace-1", "playbook.summary");
    let encoded = serde_json::to_string(&task).unwrap();
    let decoded: Task = serde_json::from_str(&encoded).unwrap();
    assert_eq!(decoded.status, TaskStatus::Created);

    let approval = Approval::new_for_test("approval-1", "task-1");
    let encoded = serde_json::to_string(&approval).unwrap();
    let decoded: Approval = serde_json::from_str(&encoded).unwrap();
    assert_eq!(decoded.status, ApprovalStatus::Pending);

    let artifact = Artifact::new_primary_for_test(
        "artifact-1",
        "task-1",
        "output/summary.md",
        ArtifactType::Summary,
    );
    let encoded = serde_json::to_string(&artifact).unwrap();
    let decoded: Artifact = serde_json::from_str(&encoded).unwrap();
    assert_eq!(decoded.kind, ArtifactKind::Primary);
    assert_eq!(decoded.status, ArtifactStatus::Ready);
    assert_eq!(decoded.r#type, ArtifactType::Summary);
}
