use time::OffsetDateTime;

use crate::events::execution::{ExecutionEvent, SemanticExecutionEvent};

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum RuntimeEvent {
    RunStepStarted {
        task_id: String,
        run_id: String,
        step_id: String,
        occurred_at: OffsetDateTime,
    },
    OutputCandidateReady {
        task_id: String,
        run_id: String,
        artifact_id: String,
        logical_name: String,
        canonical_path: String,
        physical_path: String,
        occurred_at: OffsetDateTime,
    },
}

impl RuntimeEvent {
    #[allow(dead_code)]
    pub(crate) fn from_execution(event: ExecutionEvent) -> Self {
        match event {
            ExecutionEvent::StepStarted {
                task_id,
                run_id,
                step_id,
                occurred_at,
            } => Self::RunStepStarted {
                task_id,
                run_id,
                step_id,
                occurred_at,
            },
            ExecutionEvent::Semantic(semantic_event) => match semantic_event {
                SemanticExecutionEvent::OutputCandidateDiscovered {
                    task_id,
                    run_id,
                    artifact_id,
                    logical_name,
                    canonical_path,
                    physical_path,
                    occurred_at,
                } => Self::OutputCandidateReady {
                    task_id,
                    run_id,
                    artifact_id,
                    logical_name,
                    canonical_path,
                    physical_path,
                    occurred_at,
                },
            },
        }
    }
}
