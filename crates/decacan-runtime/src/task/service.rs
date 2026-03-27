use crate::playbook::entity::Playbook;
use crate::playbook::modes::PlaybookMode;
use crate::policy::entity::PolicyProfile;
use crate::run::entity::Run;
use crate::run::service::{RunService, RunTransitionError};
use crate::workflow::entity::Workflow;
use crate::workflow::step::{WorkflowStep, WorkflowStepType};
use crate::workspace::entity::Workspace;

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

pub fn start_summary_task_for_test() -> (Task, Run) {
    let workspace = Workspace::new_for_test("workspace-1", "workspace", "/tmp/workspace");
    let playbook = Playbook::new_for_test(
        "playbook-1",
        "workspace-1",
        "playbook.summary",
        PlaybookMode::Discovery,
    );
    let workflow = summary_workflow_for_test(&playbook.id);
    let policy = PolicyProfile::new_for_test("policy-1", "workspace-1", "default");
    let mut task = Task::new_for_test(
        "task-1",
        &workspace.id,
        &playbook.id,
        workflow.version_id,
    );

    TaskStateMachine::transition(&mut task, TaskStatus::Planning).unwrap();

    let run = Run::new_for_test(
        "run-1",
        &task.id,
        workflow,
        policy,
        workspace,
        playbook,
    );

    (task, run)
}

pub fn mark_running(task: &mut Task, run: &mut Run) -> Result<(), TaskServiceError> {
    TaskStateMachine::transition(task, TaskStatus::Running)?;
    RunService::start(run)?;
    Ok(())
}

pub fn mark_succeeded(task: &mut Task, run: &mut Run) -> Result<(), TaskServiceError> {
    RunService::complete(run)?;
    TaskStateMachine::transition(task, TaskStatus::Succeeded)?;
    Ok(())
}

pub fn mark_failed(
    task: &mut Task,
    run: &mut Run,
    details: impl Into<String>,
) -> Result<(), TaskServiceError> {
    RunService::fail(run, details)?;
    TaskStateMachine::transition(task, TaskStatus::Failed)?;
    Ok(())
}

pub fn cancel(task: &mut Task, run: &mut Run) -> Result<(), TaskServiceError> {
    RunService::cancel(run)?;
    TaskStateMachine::transition(task, TaskStatus::Cancelled)?;
    Ok(())
}

fn summary_workflow_for_test(playbook_id: &str) -> Workflow {
    Workflow::new_for_test(
        "workflow-1",
        playbook_id,
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
    )
}

#[cfg(test)]
mod tests {
    use crate::run::entity::RunStatus;

    use super::*;

    #[test]
    fn starting_summary_task_enters_planning_with_initialized_run() {
        let (task, run) = start_summary_task_for_test();

        assert_eq!(task.status, TaskStatus::Planning);
        assert_eq!(run.status, RunStatus::Initialized);
    }

    #[test]
    fn task_service_advances_task_and_run_together() {
        let (mut task, mut run) = start_summary_task_for_test();

        mark_running(&mut task, &mut run).unwrap();
        assert_eq!(task.status, TaskStatus::Running);
        assert_eq!(run.status, RunStatus::Running);

        mark_succeeded(&mut task, &mut run).unwrap();
        assert_eq!(task.status, TaskStatus::Succeeded);
        assert_eq!(run.status, RunStatus::Completed);
    }
}
