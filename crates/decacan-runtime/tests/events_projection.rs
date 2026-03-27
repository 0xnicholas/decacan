#[test]
fn output_candidate_becomes_artifact_ready_task_event() {
    let task_event = decacan_runtime::events::projector::project_output_candidate_for_test();
    assert_eq!(task_event.event_type.as_str(), "artifact.ready");
}
