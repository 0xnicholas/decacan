use decacan_runtime::playbook::entity::Playbook;
use decacan_runtime::playbook::modes::PlaybookMode;
use decacan_runtime::policy::entity::PolicyProfile;
use decacan_runtime::run::entity::{Run, RunStatus};
use decacan_runtime::run::service::RunService;
use decacan_runtime::task::entity::{Task, TaskStatus};
use decacan_runtime::task::service;
use decacan_runtime::task::state_machine::TaskStateMachine;
use decacan_runtime::workflow::entity::Workflow;
use decacan_runtime::workflow::step::{WorkflowStep, WorkflowStepType};
use decacan_runtime::workspace::entity::Workspace;
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
    let mut task = Task::new_for_test("task-1", &workspace.id, &playbook.id, workflow.version_id);
    TaskStateMachine::transition(&mut task, TaskStatus::Planning).unwrap();

    let run = Run::new_for_test("run-1", &task.id, workflow, policy, workspace, playbook);

    (task, run)
}

#[test]
fn task_and_run_follow_expected_lifecycle() {
    let (mut task, mut run) = planning_task_and_initialized_run();

    assert_eq!(task.status, TaskStatus::Planning);
    assert_eq!(run.status, RunStatus::Initialized);

    service::mark_running(&mut task, &mut run).unwrap();
    assert_eq!(task.status, TaskStatus::Running);
    assert_eq!(run.status, RunStatus::Running);

    service::pause(&mut task, &mut run, "approval pending").unwrap();
    assert_eq!(task.status, TaskStatus::Paused);
    assert_eq!(run.status, RunStatus::Paused);
    assert_eq!(run.pause_reason.as_deref(), Some("approval pending"));

    service::resume(&mut task, &mut run).unwrap();
    assert_eq!(task.status, TaskStatus::Running);
    assert_eq!(run.status, RunStatus::Running);
    assert_eq!(run.pause_reason, None);

    service::mark_succeeded(&mut task, &mut run).unwrap();
    assert_eq!(task.status, TaskStatus::Succeeded);
    assert_eq!(run.status, RunStatus::Completed);
    assert!(run.started_at.is_some());
    assert!(run.finished_at.is_some());
}

#[test]
fn failure_transitions_update_task_and_run_together() {
    let (mut task, mut run) = planning_task_and_initialized_run();

    service::mark_running(&mut task, &mut run).unwrap();
    service::pause(&mut task, &mut run, "tool approval required").unwrap();
    service::mark_failed(&mut task, &mut run, "approval denied").unwrap();

    assert_eq!(task.status, TaskStatus::Failed);
    assert_eq!(run.status, RunStatus::Failed);
    assert_eq!(run.error_details.as_deref(), Some("approval denied"));
    assert!(run.finished_at.is_some());
}

#[test]
fn invalid_run_transition_does_not_mutate_task_first() {
    let (mut task, mut run) = planning_task_and_initialized_run();

    RunService::start(&mut run).unwrap();
    RunService::complete(&mut run).unwrap();

    let before_task = task.clone();
    let before_run = run.clone();
    let error = service::mark_running(&mut task, &mut run).unwrap_err();

    assert_eq!(
        error,
        service::TaskServiceError::RunTransition(
            decacan_runtime::run::service::RunTransitionError::InvalidTransition {
                from: RunStatus::Completed,
                to: RunStatus::Running,
            },
        )
    );
    assert_eq!(task, before_task);
    assert_eq!(run, before_run);
}

#[test]
fn task_can_be_cancelled_before_run_creation() {
    let mut task = Task::new_for_test(
        "task-1",
        "workspace-1",
        "playbook-1",
        Workflow::new_for_test("workflow-1", Vec::new()).version_id,
    );

    service::cancel_before_run(&mut task).unwrap();

    assert_eq!(task.status, TaskStatus::Cancelled);
}

#[test]
fn invalid_pause_and_resume_paths_are_rejected() {
    let (mut task, mut run) = planning_task_and_initialized_run();

    let pause_error = service::pause(&mut task, &mut run, "approval pending").unwrap_err();
    assert_eq!(
        pause_error,
        service::TaskServiceError::TaskTransition(
            decacan_runtime::task::state_machine::TaskTransitionError::InvalidTransition {
                from: TaskStatus::Planning,
                to: TaskStatus::Paused,
            },
        )
    );
    assert_eq!(task.status, TaskStatus::Planning);
    assert_eq!(run.status, RunStatus::Initialized);

    service::mark_running(&mut task, &mut run).unwrap();
    let resume_error = service::resume(&mut task, &mut run).unwrap_err();
    assert_eq!(
        resume_error,
        service::TaskServiceError::TaskTransition(
            decacan_runtime::task::state_machine::TaskTransitionError::InvalidTransition {
                from: TaskStatus::Running,
                to: TaskStatus::Running,
            },
        )
    );
    assert_eq!(task.status, TaskStatus::Running);
    assert_eq!(run.status, RunStatus::Running);
}
