use crate::events::execution::ExecutionEvent;
use crate::events::runtime::RuntimeEvent;
use crate::events::task::{TaskEvent, TaskEventPayload};

#[allow(dead_code)]
fn project(runtime_event: RuntimeEvent) -> TaskEvent {
    match runtime_event {
        RuntimeEvent::OutputCandidateReady {
            task_id,
            run_id,
            artifact_id,
            logical_name,
            canonical_path,
            physical_path,
            occurred_at,
        } => TaskEvent {
            task_id,
            event_type: "artifact.ready".to_owned(),
            occurred_at,
            payload: TaskEventPayload::ArtifactReady {
                run_id,
                artifact_id,
                logical_name,
                canonical_path,
                physical_path,
            },
        },
    }
}

#[allow(dead_code)]
pub(crate) fn project_execution(event: ExecutionEvent) -> TaskEvent {
    project(RuntimeEvent::from_execution(event))
}

#[cfg(test)]
mod tests {
    use time::OffsetDateTime;

    use super::project_execution;
    use crate::events::execution::{ExecutionEvent, SemanticExecutionEvent};
    use crate::events::task::TaskEventPayload;

    #[test]
    fn output_candidate_execution_event_projects_to_artifact_ready_task_event() {
        let occurred_at = OffsetDateTime::now_utc();
        let task_event = project_execution(ExecutionEvent::Semantic(
            SemanticExecutionEvent::OutputCandidateDiscovered {
                task_id: "task-1".to_owned(),
                run_id: "run-1".to_owned(),
                artifact_id: "artifact-1".to_owned(),
                logical_name: "summary".to_owned(),
                canonical_path: "artifacts/summary.md".to_owned(),
                physical_path: "/tmp/workspace/artifacts/summary.md".to_owned(),
                occurred_at,
            },
        ));

        assert_eq!(task_event.task_id, "task-1");
        assert_eq!(task_event.event_type, "artifact.ready");
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
}
