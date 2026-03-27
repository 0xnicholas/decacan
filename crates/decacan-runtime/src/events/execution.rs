use time::OffsetDateTime;

#[allow(dead_code)]
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ExecutionEvent {
    StepStarted {
        task_id: String,
        run_id: String,
        step_id: String,
        occurred_at: OffsetDateTime,
    },
    Semantic(SemanticExecutionEvent),
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) enum SemanticExecutionEvent {
    OutputCandidateDiscovered {
        task_id: String,
        run_id: String,
        artifact_id: String,
        logical_name: String,
        canonical_path: String,
        physical_path: String,
        occurred_at: OffsetDateTime,
    },
}

pub(crate) fn output_candidate_for_test() -> ExecutionEvent {
    ExecutionEvent::Semantic(SemanticExecutionEvent::OutputCandidateDiscovered {
        task_id: "task-1".to_owned(),
        run_id: "run-1".to_owned(),
        artifact_id: "artifact-1".to_owned(),
        logical_name: "summary".to_owned(),
        canonical_path: "artifacts/summary.md".to_owned(),
        physical_path: "/tmp/workspace/artifacts/summary.md".to_owned(),
        occurred_at: OffsetDateTime::now_utc(),
    })
}
