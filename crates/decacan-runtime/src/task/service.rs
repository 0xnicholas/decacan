use crate::run::entity::Run;
use crate::run::entity::RunStatus;
use crate::run::service::{RunService, RunTransitionError};

use super::entity::{Task, TaskStatus};
use super::state_machine::{TaskStateMachine, TaskTransitionError};

#[derive(Debug, PartialEq, Eq)]
pub enum TaskServiceError {
    TaskTransition(TaskTransitionError),
    RunTransition(RunTransitionError),
}

impl From<TaskTransitionError> for TaskServiceError {
    fn from(value: TaskTransitionError) -> Self {
        Self::TaskTransition(value)
    }
}

impl From<RunTransitionError> for TaskServiceError {
    fn from(value: RunTransitionError) -> Self {
        Self::RunTransition(value)
    }
}

pub fn begin_planning(task: &mut Task) -> Result<(), TaskServiceError> {
    TaskStateMachine::ensure_transition(task, TaskStatus::Planning)?;
    TaskStateMachine::transition(task, TaskStatus::Planning)?;
    Ok(())
}

pub fn mark_running(task: &mut Task, run: &mut Run) -> Result<(), TaskServiceError> {
    TaskStateMachine::ensure_transition(task, TaskStatus::Running)?;
    RunService::ensure_transition(run, RunStatus::Running)?;
    TaskStateMachine::transition(task, TaskStatus::Running)?;
    RunService::start(run)?;
    Ok(())
}

pub fn mark_succeeded(task: &mut Task, run: &mut Run) -> Result<(), TaskServiceError> {
    TaskStateMachine::ensure_transition(task, TaskStatus::Succeeded)?;
    RunService::ensure_transition(run, RunStatus::Completed)?;
    RunService::complete(run)?;
    TaskStateMachine::transition(task, TaskStatus::Succeeded)?;
    Ok(())
}

pub fn mark_failed(
    task: &mut Task,
    run: &mut Run,
    details: impl Into<String>,
) -> Result<(), TaskServiceError> {
    let details = details.into();
    TaskStateMachine::ensure_transition(task, TaskStatus::Failed)?;
    RunService::ensure_transition(run, RunStatus::Failed)?;
    RunService::fail(run, details)?;
    TaskStateMachine::transition(task, TaskStatus::Failed)?;
    Ok(())
}

pub fn pause(
    task: &mut Task,
    run: &mut Run,
    reason: impl Into<String>,
) -> Result<(), TaskServiceError> {
    let reason = reason.into();
    TaskStateMachine::ensure_transition(task, TaskStatus::Paused)?;
    RunService::ensure_transition(run, RunStatus::Paused)?;
    RunService::pause(run, reason)?;
    TaskStateMachine::transition(task, TaskStatus::Paused)?;
    Ok(())
}

pub fn resume(task: &mut Task, run: &mut Run) -> Result<(), TaskServiceError> {
    TaskStateMachine::ensure_transition(task, TaskStatus::Running)?;
    RunService::ensure_transition(run, RunStatus::Running)?;
    RunService::resume(run)?;
    TaskStateMachine::transition(task, TaskStatus::Running)?;
    Ok(())
}

pub fn cancel(task: &mut Task, run: &mut Run) -> Result<(), TaskServiceError> {
    TaskStateMachine::ensure_transition(task, TaskStatus::Cancelled)?;
    RunService::ensure_transition(run, RunStatus::Cancelled)?;
    RunService::cancel(run)?;
    TaskStateMachine::transition(task, TaskStatus::Cancelled)?;
    Ok(())
}

pub fn cancel_before_run(task: &mut Task) -> Result<(), TaskServiceError> {
    TaskStateMachine::ensure_transition(task, TaskStatus::Cancelled)?;
    TaskStateMachine::transition(task, TaskStatus::Cancelled)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use crate::playbook::entity::Playbook;
    use crate::playbook::modes::PlaybookMode;
    use crate::policy::entity::PolicyProfile;
    use crate::run::entity::RunStatus;
    use crate::workflow::entity::Workflow;
    use crate::workflow::step::{WorkflowStep, WorkflowStepType};
    use crate::workspace::entity::Workspace;

    use super::*;

    fn planning_task_and_initialized_run() -> (Task, Run) {
        let workspace = Workspace::new_for_test("workspace-1", "workspace", "/tmp/workspace");
        let playbook = Playbook::new_for_test(
            "playbook-1",
            "workspace-1",
            "playbook.summary",
            PlaybookMode::Discovery,
        );
        let workflow = Workflow::new_for_test(
            "workflow-1",
            &playbook.id,
            vec![
                WorkflowStep::new_for_test(
                    "step-1",
                    "load_context",
                    WorkflowStepType::Deterministic,
                    "Load task context for summary generation",
                    Some("step-2"),
                ),
                WorkflowStep::new_for_test(
                    "step-2",
                    "draft_summary",
                    WorkflowStepType::Psi,
                    "Draft the summary body",
                    None,
                ),
            ],
        );
        let policy = PolicyProfile::new_for_test("policy-1", "workspace-1", "default");
        let mut task =
            Task::new_for_test("task-1", &workspace.id, &playbook.id, workflow.version_id);
        TaskStateMachine::transition(&mut task, TaskStatus::Planning).unwrap();

        let run = Run::new_for_test("run-1", &task.id, workflow, policy, workspace, playbook);

        (task, run)
    }

    #[test]
    fn starting_summary_task_enters_planning_with_initialized_run() {
        let (task, run) = planning_task_and_initialized_run();

        assert_eq!(task.status, TaskStatus::Planning);
        assert_eq!(run.status, RunStatus::Initialized);
    }

    #[test]
    fn task_service_advances_task_and_run_together() {
        let (mut task, mut run) = planning_task_and_initialized_run();

        mark_running(&mut task, &mut run).unwrap();
        assert_eq!(task.status, TaskStatus::Running);
        assert_eq!(run.status, RunStatus::Running);

        pause(&mut task, &mut run, "approval pending").unwrap();
        assert_eq!(task.status, TaskStatus::Paused);
        assert_eq!(run.status, RunStatus::Paused);

        resume(&mut task, &mut run).unwrap();
        assert_eq!(task.status, TaskStatus::Running);
        assert_eq!(run.status, RunStatus::Running);

        mark_succeeded(&mut task, &mut run).unwrap();
        assert_eq!(task.status, TaskStatus::Succeeded);
        assert_eq!(run.status, RunStatus::Completed);
    }

    #[test]
    fn task_service_supports_cancellation_before_run_creation() {
        let mut task = Task::new_for_test(
            "task-1",
            "workspace-1",
            "playbook-1",
            Workflow::new_for_test("workflow-1", "playbook-1", Vec::new()).version_id,
        );

        cancel_before_run(&mut task).unwrap();

        assert_eq!(task.status, TaskStatus::Cancelled);
    }
}
