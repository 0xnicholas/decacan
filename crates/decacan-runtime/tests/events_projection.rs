use decacan_runtime::events::projector;
use decacan_runtime::events::{RuntimeEvent, TaskEventPayload};
use time::OffsetDateTime;

#[test]
fn output_candidate_becomes_artifact_ready_task_event() {
    let occurred_at = OffsetDateTime::now_utc();
    let task_event = projector::project(RuntimeEvent::OutputCandidateReady {
        task_id: "task-1".to_owned(),
        run_id: "run-1".to_owned(),
        artifact_id: "artifact-1".to_owned(),
        logical_name: "summary".to_owned(),
        canonical_path: "artifacts/summary.md".to_owned(),
        physical_path: "/tmp/workspace/artifacts/summary.md".to_owned(),
        occurred_at,
    });

    assert_eq!(task_event.event_type.as_str(), "artifact.ready");
    assert_eq!(task_event.task_id, "task-1");
    assert_eq!(task_event.occurred_at, occurred_at);
    assert_eq!(
        task_event.payload,
        TaskEventPayload::ArtifactReady {
            run_id: "run-1".to_owned(),
            artifact_id: "artifact-1".to_owned(),
            logical_name: "summary".to_owned(),
            canonical_path: "artifacts/summary.md".to_owned(),
            physical_path: "/tmp/workspace/artifacts/summary.md".to_owned(),
        }
    );
}
