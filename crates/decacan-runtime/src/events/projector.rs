use crate::events::execution::ExecutionEvent;
use crate::events::RuntimeEvent;
use crate::events::task::{TaskEvent, TaskEventPayload};

pub fn project(runtime_event: RuntimeEvent) -> TaskEvent {
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
        RuntimeEvent::RunStepStarted {
            task_id,
            run_id,
            step_id,
            occurred_at,
        } => TaskEvent {
            task_id,
            event_type: "run.step_started".to_owned(),
            occurred_at,
            payload: TaskEventPayload::StepStarted { run_id, step_id },
        },
    }
}

#[allow(dead_code)]
pub(crate) fn project_execution(event: ExecutionEvent) -> TaskEvent {
    project(RuntimeEvent::from_execution(event))
}
