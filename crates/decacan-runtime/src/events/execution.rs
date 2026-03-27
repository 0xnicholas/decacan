use time::OffsetDateTime;

#[allow(dead_code)]
#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) enum ExecutionEvent {
    StepStarted {
        task_id: String,
        run_id: String,
        step_id: String,
        occurred_at: OffsetDateTime,
    },
    Semantic(SemanticExecutionEvent),
}

#[allow(dead_code)]
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
