use decacan_runtime::trace::entities::{StepStatus, StepTrace};
use serde_json::json;
use time::OffsetDateTime;

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
