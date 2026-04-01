use decacan_runtime::trace::entities::{StepStatus, StepTrace, TaskExecutionTrace, TaskStatus};
use decacan_runtime::trace::recorder::TraceRecorder;
use serde_json::json;
use time::OffsetDateTime;
use uuid::Uuid;

#[test]
fn test_step_trace_creation() {
    let trace = StepTrace {
        step_id: "scan".to_string(),
        step_name: "扫描文件".to_string(),
        sequence: 1,
        input_snapshot: json!({"directory": "/docs"}),
        output_snapshot: json!({"files": ["a.md", "b.md"]}),
        started_at: OffsetDateTime::now_utc(),
        completed_at: None,
        duration_ms: None,
        retry_count: 0,
        resources_used: Default::default(),
        status: StepStatus::Running,
        error: None,
        invoked_cards: vec![],
    };

    assert_eq!(trace.step_id, "scan");
    assert_eq!(trace.sequence, 1);
}

#[tokio::test]
async fn test_trace_persistence() {
    use decacan_runtime::storage::trace_store::TraceStore;

    let store = TraceStore::new_in_memory().await.unwrap();

    let trace = TaskExecutionTrace {
        task_id: "task-test-001".to_string(),
        playbook_version_id: Uuid::new_v4(),
        workspace_id: "ws-1".to_string(),
        steps: vec![],
        overall_status: TaskStatus::Succeeded,
        total_duration_ms: 1000,
        step_count: 0,
        failed_step_index: None,
        created_at: OffsetDateTime::now_utc(),
        completed_at: Some(OffsetDateTime::now_utc()),
    };

    store.save_trace(&trace).await.unwrap();

    let retrieved = store
        .get_trace(&trace.task_id)
        .await
        .unwrap()
        .expect("trace not found");
    assert_eq!(retrieved.task_id, trace.task_id);
}

#[tokio::test]
async fn test_trace_integration_with_execution() {
    use decacan_runtime::storage::trace_store::TraceStore;

    // Setup
    let store = TraceStore::new_in_memory().await.unwrap();
    let recorder = TraceRecorder::new(store);

    // Simulate task start
    let task_id = recorder
        .start_task("task-001", Uuid::new_v4(), "ws-1")
        .await;

    // Simulate step execution
    recorder.start_step(&task_id, "scan", "扫描文件", 1).await;
    recorder
        .complete_step(&task_id, "scan", json!({"files": ["a.md"]}))
        .await;

    // Complete task
    let trace = recorder
        .complete_task(&task_id, TaskStatus::Succeeded)
        .await;

    assert_eq!(trace.step_count, 1);
    assert!(matches!(trace.overall_status, TaskStatus::Succeeded));
}
