use time::OffsetDateTime;

use super::entity::{Run, RunStatus};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RunTransitionError {
    InvalidTransition { from: RunStatus, to: RunStatus },
}

pub struct RunService;

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
