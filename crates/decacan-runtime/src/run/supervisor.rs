use crate::task::entity::{Task, TaskStatus};
use crate::task::service::{self, TaskServiceError};
use crate::task::state_machine::{TaskStateMachine, TaskTransitionError};

use super::entity::Run;
use super::service::{RunService, RunTransitionError};

#[derive(Debug, PartialEq, Eq)]
pub enum SupervisorError {
    Task(TaskTransitionError),
    Service(TaskServiceError),
    Run(RunTransitionError),
}

impl From<TaskTransitionError> for SupervisorError {
    fn from(value: TaskTransitionError) -> Self {
        Self::Task(value)
    }
}

impl From<TaskServiceError> for SupervisorError {
    fn from(value: TaskServiceError) -> Self {
        Self::Service(value)
    }
}

impl From<RunTransitionError> for SupervisorError {
    fn from(value: RunTransitionError) -> Self {
        Self::Run(value)
    }
}

pub fn pause(task: &mut Task, run: &mut Run, reason: impl Into<String>) -> Result<(), SupervisorError> {
    RunService::pause(run, reason)?;
    TaskStateMachine::transition(task, TaskStatus::Paused)?;
    Ok(())
}

pub fn resume(task: &mut Task, run: &mut Run) -> Result<(), SupervisorError> {
    RunService::resume(run)?;
    TaskStateMachine::transition(task, TaskStatus::Running)?;
    Ok(())
}

pub fn fail(task: &mut Task, run: &mut Run, details: impl Into<String>) -> Result<(), SupervisorError> {
    service::mark_failed(task, run, details).map_err(Into::into)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::run::entity::RunStatus;

    #[test]
    fn supervisor_handles_pause_resume_and_fail() {
        let (mut task, mut run) = crate::task::service::start_summary_task_for_test();

        service::mark_running(&mut task, &mut run).unwrap();
        pause(&mut task, &mut run, "approval pending").unwrap();
        assert_eq!(task.status, TaskStatus::Paused);
        assert_eq!(run.status, RunStatus::Paused);

        resume(&mut task, &mut run).unwrap();
        assert_eq!(task.status, TaskStatus::Running);
        assert_eq!(run.status, RunStatus::Running);

        fail(&mut task, &mut run, "approval denied").unwrap();
        assert_eq!(task.status, TaskStatus::Failed);
        assert_eq!(run.status, RunStatus::Failed);
        assert_eq!(run.error_details.as_deref(), Some("approval denied"));
    }
}
