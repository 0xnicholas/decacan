use std::collections::HashMap;
use std::convert::Infallible;
use std::path::Path;
use std::sync::{Arc, RwLock};
use std::time::{SystemTime, UNIX_EPOCH};

use time::OffsetDateTime;

use crate::artifact::entity::Artifact;
use crate::events::TaskEvent;
use crate::gateway::{SemanticGatewayAdapter, ToolGateway};
use crate::playbook::registry::get_registered_summary_playbook_for_test;
use crate::policy::entity::PolicyProfile;
use crate::ports::clock::ClockPort;
use crate::ports::filesystem::FilesystemPort;
use crate::ports::storage::StoragePort;
use crate::routine::executor::execute_summary_workflow;
use crate::workflow::compiler::compile_summary_playbook_for_test;
use crate::workspace::entity::Workspace;

use super::entity::{Run, RunStatus};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RunTransitionError {
    InvalidTransition { from: RunStatus, to: RunStatus },
}

pub struct RunService;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SummaryPlaybookE2eResult {
    pub run: Run,
    pub primary_artifact: Artifact,
    pub backup_artifact: Option<Artifact>,
    pub projected_task_event: TaskEvent,
}

pub fn execute_summary_playbook_e2e_for_test() -> SummaryPlaybookE2eResult {
    RunService::execute_summary_playbook_e2e_for_test()
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

    pub fn execute_summary_playbook_e2e_for_test() -> SummaryPlaybookE2eResult {
        let workspace_root = unique_test_workspace_root();
        let filesystem = LocalFilesystemForTest;
        let storage = MemoryStorageForTest::new();
        let clock = FixedClockForTest::new(OffsetDateTime::now_utc());

        let notes_path = workspace_root.join("notes.md");
        filesystem
            .write_string(&notes_path, "project notes for summary")
            .expect("notes fixture should be written");
        filesystem
            .write_string(&workspace_root.join("output/summary.md"), "old summary")
            .expect("existing summary fixture should be written");

        let playbook = get_registered_summary_playbook_for_test();
        let workflow = compile_summary_playbook_for_test();
        let workspace = Workspace::new_for_test(
            "workspace-1",
            "workspace",
            workspace_root
                .to_str()
                .expect("workspace root should be valid utf-8"),
        );
        let policy = PolicyProfile::new_for_test("policy-1", &workspace.id, "default");
        let mut run = Run::new_for_test("run-1", "task-1", workflow.clone(), policy.clone(), workspace, playbook);

        RunService::start(&mut run).expect("run should start");
        let routine_result = execute_summary_workflow(
            &mut run,
            &workflow,
            &filesystem,
            &storage,
            &clock,
            SemanticGatewayAdapter::new(ToolGateway::new(
                policy,
                workspace_root.join("output"),
            )),
        )
        .expect("summary workflow should execute");
        RunService::complete(&mut run).expect("run should complete");

        SummaryPlaybookE2eResult {
            run,
            primary_artifact: routine_result.primary_artifact,
            backup_artifact: routine_result.backup_artifact,
            projected_task_event: routine_result.projected_task_event,
        }
    }
}

fn transition(run: &mut Run, next: RunStatus) -> Result<(), RunTransitionError> {
    RunService::ensure_transition(run, next)?;

    run.status = next;
    Ok(())
}

#[derive(Debug, Clone, Default)]
struct MemoryStorageForTest {
    values: Arc<RwLock<HashMap<String, String>>>,
}

impl MemoryStorageForTest {
    fn new() -> Self {
        Self::default()
    }
}

impl StoragePort for MemoryStorageForTest {
    type Error = Infallible;

    fn put(&self, key: &str, value: &str) -> Result<(), Self::Error> {
        let mut values = self
            .values
            .write()
            .expect("memory storage lock should not be poisoned");
        values.insert(key.to_owned(), value.to_owned());
        Ok(())
    }

    fn get(&self, key: &str) -> Result<Option<String>, Self::Error> {
        let values = self
            .values
            .read()
            .expect("memory storage lock should not be poisoned");
        Ok(values.get(key).cloned())
    }
}

#[derive(Debug, Clone, Copy, Default)]
struct LocalFilesystemForTest;

impl FilesystemPort for LocalFilesystemForTest {
    type Error = std::io::Error;

    fn read_to_string(&self, path: &Path) -> Result<String, Self::Error> {
        std::fs::read_to_string(path)
    }

    fn write_string(&self, path: &Path, contents: &str) -> Result<(), Self::Error> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(path, contents)
    }

    fn exists(&self, path: &Path) -> Result<bool, Self::Error> {
        match std::fs::metadata(path) {
            Ok(_) => Ok(true),
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => Ok(false),
            Err(error) => Err(error),
        }
    }
}

#[derive(Debug, Clone, Copy)]
struct FixedClockForTest {
    now: OffsetDateTime,
}

impl FixedClockForTest {
    fn new(now: OffsetDateTime) -> Self {
        Self { now }
    }
}

impl ClockPort for FixedClockForTest {
    fn now_utc(&self) -> OffsetDateTime {
        self.now
    }
}

fn unique_test_workspace_root() -> std::path::PathBuf {
    let unique_suffix = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .expect("system time should be after unix epoch")
        .as_nanos();

    std::env::temp_dir().join(format!("summary-playbook-e2e-{unique_suffix}"))
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
