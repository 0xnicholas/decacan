use decacan_runtime::events::{TaskEvent, TaskEventPayload};
use time::OffsetDateTime;

#[test]
fn task_event_roundtrips_through_serde_for_transport() {
    let occurred_at = OffsetDateTime::now_utc();
    let task_event = TaskEvent {
        task_id: "task-1".to_owned(),
        event_type: "artifact.ready".to_owned(),
        occurred_at,
        payload: TaskEventPayload::ArtifactReady {
            run_id: "run-1".to_owned(),
            artifact_id: "artifact-1".to_owned(),
            logical_name: "summary".to_owned(),
            canonical_path: "artifacts/summary.md".to_owned(),
            physical_path: "/tmp/workspace/artifacts/summary.md".to_owned(),
        },
    };

    let encoded = serde_json::to_string(&task_event).unwrap();
    let decoded: TaskEvent = serde_json::from_str(&encoded).unwrap();

    assert_eq!(decoded, task_event);
    assert!(encoded.contains("\"event_type\":\"artifact.ready\""));
    assert!(encoded.contains("\"task_id\":\"task-1\""));
    assert!(encoded.contains("\"kind\":\"artifact_ready\""));
    assert_eq!(
        decoded.payload,
        TaskEventPayload::ArtifactReady {
            run_id: "run-1".to_owned(),
            artifact_id: "artifact-1".to_owned(),
            logical_name: "summary".to_owned(),
            canonical_path: "artifacts/summary.md".to_owned(),
            physical_path: "/tmp/workspace/artifacts/summary.md".to_owned(),
        }
    );
}
