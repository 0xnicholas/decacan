#[test]
fn task_and_artifact_entities_roundtrip_through_serde() {
    use decacan_runtime::artifact::entity::{Artifact, ArtifactKind, ArtifactStatus, ArtifactType};
    use decacan_runtime::task::entity::{Task, TaskStatus};

    let task = Task::new_for_test("task-1", "workspace-1", "playbook.summary");
    let encoded = serde_json::to_string(&task).unwrap();
    let decoded: Task = serde_json::from_str(&encoded).unwrap();
    assert_eq!(decoded.status, TaskStatus::Created);

    let artifact = Artifact::new_primary_for_test("artifact-1", "task-1", "output/summary.md");
    let encoded = serde_json::to_string(&artifact).unwrap();
    let decoded: Artifact = serde_json::from_str(&encoded).unwrap();
    assert_eq!(decoded.kind, ArtifactKind::Primary);
    assert_eq!(decoded.status, ArtifactStatus::Ready);
    assert_eq!(decoded.r#type, ArtifactType::Summary);
}
