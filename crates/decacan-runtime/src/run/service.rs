use std::path::PathBuf;

use time::OffsetDateTime;

use crate::artifact::entity::Artifact;
use crate::events::TaskEvent;
use crate::gateway::{SemanticGatewayAdapter, ToolGateway};
use crate::ports::clock::ClockPort;
use crate::ports::filesystem::FilesystemPort;
use crate::ports::storage::StoragePort;
use crate::routine::executor::execute_summary_workflow;
use crate::task::entity::Task;
use crate::task::service::{begin_planning, mark_failed, mark_running, mark_succeeded, TaskServiceError};

use super::entity::{Run, RunStatus};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RunTransitionError {
    InvalidTransition { from: RunStatus, to: RunStatus },
}

pub struct RunService;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SummaryPlaybookE2eResult {
    pub workspace_root: PathBuf,
    pub task: Task,
    pub run: Run,
    pub primary_artifact: Artifact,
    pub backup_artifact: Option<Artifact>,
    pub projected_task_event: TaskEvent,
}

pub fn execute_standard_summary_playbook<F, S, C>(
    task: &mut Task,
    run: &mut Run,
    filesystem: &F,
    storage: &S,
    clock: &C,
) -> Result<SummaryPlaybookE2eResult, SummaryPlaybookExecutionError>
where
    F: FilesystemPort,
    F::Error: std::fmt::Debug,
    S: StoragePort,
    S::Error: std::fmt::Debug,
    C: ClockPort,
{
    RunService::execute_standard_summary_playbook(task, run, filesystem, storage, clock)
}

#[doc(hidden)]
pub fn execute_summary_playbook_e2e_for_test() -> SummaryPlaybookE2eResult {
    super::test_support::execute_summary_playbook_e2e_for_test()
}

#[derive(Debug)]
pub enum SummaryPlaybookExecutionError {
    Task(TaskServiceError),
    Routine(String),
}

impl From<TaskServiceError> for SummaryPlaybookExecutionError {
    fn from(value: TaskServiceError) -> Self {
        Self::Task(value)
    }
}

impl RunService {
    pub fn ensure_transition(run: &Run, next: RunStatus) -> Result<(), RunTransitionError> {
        Self::ensure_status_transition(run.status, next)
    }

    pub fn ensure_status_transition(
        current: RunStatus,
        next: RunStatus,
    ) -> Result<(), RunTransitionError> {
        if can_transition(current, next) {
            Ok(())
        } else {
            Err(RunTransitionError::InvalidTransition {
                from: current,
                to: next,
            })
        }
    }

    pub fn start(run: &mut Run) -> Result<(), RunTransitionError> {
        transition(run, RunStatus::Running)?;
        if run.started_at.is_none() {
            run.started_at = Some(OffsetDateTime::now_utc());
        }
        Ok(())
    }

    pub fn pause(run: &mut Run, reason: impl Into<String>) -> Result<(), RunTransitionError> {
        transition(run, RunStatus::Paused)?;
        run.pause_reason = Some(reason.into());
        Ok(())
    }

    pub fn resume(run: &mut Run) -> Result<(), RunTransitionError> {
        transition(run, RunStatus::Running)?;
        run.pause_reason = None;
        Ok(())
    }

    pub fn complete(run: &mut Run) -> Result<(), RunTransitionError> {
        transition(run, RunStatus::Completed)?;
        run.pause_reason = None;
        run.finished_at = Some(OffsetDateTime::now_utc());
        Ok(())
    }

    pub fn fail(run: &mut Run, details: impl Into<String>) -> Result<(), RunTransitionError> {
        transition(run, RunStatus::Failed)?;
        run.error_details = Some(details.into());
        run.pause_reason = None;
        run.finished_at = Some(OffsetDateTime::now_utc());
        Ok(())
    }

    pub fn cancel(run: &mut Run) -> Result<(), RunTransitionError> {
        transition(run, RunStatus::Cancelled)?;
        run.pause_reason = None;
        run.finished_at = Some(OffsetDateTime::now_utc());
        Ok(())
    }

    pub fn execute_standard_summary_playbook<F, S, C>(
        task: &mut Task,
        run: &mut Run,
        filesystem: &F,
        storage: &S,
        clock: &C,
    ) -> Result<SummaryPlaybookE2eResult, SummaryPlaybookExecutionError>
    where
        F: FilesystemPort,
        F::Error: std::fmt::Debug,
        S: StoragePort,
        S::Error: std::fmt::Debug,
        C: ClockPort,
    {
        if task.status == crate::task::entity::TaskStatus::Created {
            begin_planning(task)?;
        }
        mark_running(task, run)?;
        let routine_result = execute_summary_workflow(
            run,
            &run.workflow_snapshot.clone(),
            filesystem,
            storage,
            clock,
            SemanticGatewayAdapter::new(ToolGateway::new(
                run.policy_snapshot.clone(),
                std::path::Path::new(&run.workspace_snapshot.root_path).join("output"),
            )),
        );
        let routine_result = match routine_result {
            Ok(result) => result,
            Err(error) => {
                mark_failed(task, run, error.message())?;
                return Err(SummaryPlaybookExecutionError::Routine(error.message()));
            }
        };
        mark_succeeded(task, run)?;

        Ok(SummaryPlaybookE2eResult {
            workspace_root: PathBuf::from(&run.workspace_snapshot.root_path),
            task: task.clone(),
            run: run.clone(),
            primary_artifact: routine_result.primary_artifact,
            backup_artifact: routine_result.backup_artifact,
            projected_task_event: routine_result.projected_task_event,
        })
    }
}

fn transition(run: &mut Run, next: RunStatus) -> Result<(), RunTransitionError> {
    RunService::ensure_transition(run, next)?;

    run.status = next;
    Ok(())
}

fn can_transition(current: RunStatus, next: RunStatus) -> bool {
    use RunStatus::{Cancelled, Completed, Failed, Initialized, Paused, Running};

    matches!(
        (current, next),
        (Initialized, Running)
            | (Initialized, Cancelled)
            | (Running, Paused)
            | (Running, Completed)
            | (Running, Failed)
            | (Running, Cancelled)
            | (Paused, Running)
            | (Paused, Failed)
            | (Paused, Cancelled)
    )
}

#[cfg(test)]
mod tests {
    use crate::playbook::entity::Playbook;
    use crate::playbook::modes::PlaybookMode;
    use crate::policy::entity::PolicyProfile;
    use crate::workflow::entity::Workflow;
    use crate::workflow::step::{WorkflowStep, WorkflowStepType};
    use crate::workspace::entity::Workspace;

    use super::*;

    fn run_for_test() -> Run {
        let workspace = Workspace::new_for_test("workspace-1", "workspace", "/tmp/workspace");
        let playbook = Playbook::new_for_test(
            "playbook-1",
            "workspace-1",
            "playbook.summary",
            PlaybookMode::Discovery,
        );
        let workflow = Workflow::new_for_test(
            "workflow-1",
            "playbook-1",
            vec![WorkflowStep::new_for_test(
                "step-1",
                "draft_summary",
                WorkflowStepType::Psi,
                "Draft the summary body",
                None,
            )],
        );
        let policy = PolicyProfile::new_for_test("policy-1", "workspace-1", "default");

        Run::new_for_test("run-1", "task-1", workflow, policy, workspace, playbook)
    }

    #[test]
    fn run_supports_pause_resume_and_failure_transitions() {
        let mut run = run_for_test();

        RunService::start(&mut run).unwrap();
        RunService::pause(&mut run, "awaiting approval").unwrap();
        assert_eq!(run.status, RunStatus::Paused);
        assert_eq!(run.pause_reason.as_deref(), Some("awaiting approval"));

        RunService::resume(&mut run).unwrap();
        RunService::fail(&mut run, "tool invocation failed").unwrap();

        assert_eq!(run.status, RunStatus::Failed);
        assert_eq!(run.error_details.as_deref(), Some("tool invocation failed"));
        assert!(run.finished_at.is_some());
    }
}
