use time::OffsetDateTime;

use crate::events::execution::{ArtifactExecutionEvent, ExecutionEvent, SemanticExecutionEvent};

#[allow(dead_code)]
#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) enum RuntimeEvent {
    OutputCandidateReady {
        task_id: String,
        run_id: String,
        artifact_id: String,
        logical_name: String,
        canonical_path: String,
        physical_path: String,
        occurred_at: OffsetDateTime,
    },
    ArtifactReady {
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
            ExecutionEvent::Artifact(artifact_event) => match artifact_event {
                ArtifactExecutionEvent::ArtifactRegistered {
                    task_id,
                    run_id,
                    artifact_id,
                    logical_name,
                    canonical_path,
                    physical_path,
                    occurred_at,
                } => Self::ArtifactReady {
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
