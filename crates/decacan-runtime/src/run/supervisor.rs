use crate::task::entity::{Task, TaskStatus};
use crate::task::service::{self, TaskServiceError};
use crate::task::state_machine::{TaskStateMachine, TaskTransitionError};

use super::entity::{Run, RunStatus};
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

pub fn pause(
    task: &mut Task,
    run: &mut Run,
    reason: impl Into<String>,
) -> Result<(), SupervisorError> {
    let reason = reason.into();
    TaskStateMachine::ensure_transition(task, TaskStatus::Paused)?;
    RunService::ensure_transition(run, RunStatus::Paused)?;
    RunService::pause(run, reason)?;
    TaskStateMachine::transition(task, TaskStatus::Paused)?;
    Ok(())
}

pub fn resume(task: &mut Task, run: &mut Run) -> Result<(), SupervisorError> {
    TaskStateMachine::ensure_transition(task, TaskStatus::Running)?;
    RunService::ensure_transition(run, RunStatus::Running)?;
    RunService::resume(run)?;
    TaskStateMachine::transition(task, TaskStatus::Running)?;
    Ok(())
}

pub fn fail(
    task: &mut Task,
    run: &mut Run,
    details: impl Into<String>,
) -> Result<(), SupervisorError> {
    service::mark_failed(task, run, details).map_err(Into::into)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::run::entity::RunStatus;

    #[test]
    fn supervisor_handles_pause_resume_and_fail() {
        let workspace = crate::workspace::entity::Workspace::new_for_test(
            "workspace-1",
            "workspace",
            "/tmp/workspace",
        );
        let playbook = crate::playbook::entity::Playbook::new_for_test(
            "playbook-1",
            "workspace-1",
            "playbook.summary",
            crate::playbook::modes::PlaybookMode::Discovery,
        );
        let workflow = crate::workflow::entity::Workflow::new_for_test(
            "workflow-1",
            &playbook.id,
            vec![crate::workflow::step::WorkflowStep::new_for_test(
                "step-1",
                "draft_summary",
                crate::workflow::step::WorkflowStepType::Psi,
                "Draft the summary body",
                None,
            )],
        );
        let policy = crate::policy::entity::PolicyProfile::new_for_test(
            "policy-1",
            "workspace-1",
            "default",
        );
        let mut task = crate::task::entity::Task::new_for_test(
            "task-1",
            &workspace.id,
            &playbook.id,
            workflow.version_id,
        );
        crate::task::state_machine::TaskStateMachine::transition(&mut task, TaskStatus::Planning)
            .unwrap();
        let mut run = crate::run::entity::Run::new_for_test(
            "run-1", &task.id, workflow, policy, workspace, playbook,
        );

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
