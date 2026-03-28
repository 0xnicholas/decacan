use crate::policy::entity::PolicyProfile;
use crate::ports::clock::ClockPort;
use crate::ports::filesystem::FilesystemPort;
use crate::ports::storage::StoragePort;
use crate::run::entity::Run;
use crate::run::service::{
    execute_discovery_playbook, execute_standard_summary_playbook, SummaryPlaybookE2eResult,
    SummaryPlaybookExecutionError,
};
use crate::task::entity::Task;
use crate::workflow::compiler::compile_playbook;
use crate::workspace::entity::Workspace;

use super::registry::{
    get_registered_playbook, DISCOVER_TOPICS_PLAYBOOK_KEY, SUMMARY_PLAYBOOK_KEY,
};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RegisteredPlaybookExecutionRequest {
    pub task_id: String,
    pub run_id: String,
    pub policy_id: String,
    pub workspace_id: String,
    pub workspace_name: String,
    pub workspace_root: String,
    pub playbook_key: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct RegisteredPlaybookPreview {
    pub plan_steps: Vec<String>,
    pub expected_artifact_label: String,
    pub expected_artifact_path: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PendingArtifactExpectation {
    pub id: String,
    pub label: String,
    pub canonical_path: String,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PreparedRegisteredPlaybookRun {
    pub task: Task,
    pub run: Run,
    pub pending_artifact: PendingArtifactExpectation,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RegisteredPlaybookError {
    UnknownPlaybook,
    UnsupportedPlaybook,
}

pub fn preview_registered_playbook(
    playbook_key: &str,
) -> Result<RegisteredPlaybookPreview, RegisteredPlaybookError> {
    let playbook = get_registered_playbook(playbook_key).ok_or(RegisteredPlaybookError::UnknownPlaybook)?;
    let workflow = compile_playbook(&playbook).ok_or(RegisteredPlaybookError::UnsupportedPlaybook)?;
    let contract =
        artifact_contract(playbook_key).ok_or(RegisteredPlaybookError::UnsupportedPlaybook)?;

    Ok(RegisteredPlaybookPreview {
        plan_steps: workflow.steps.into_iter().map(|step| step.purpose).collect(),
        expected_artifact_label: contract.label.to_owned(),
        expected_artifact_path: contract.canonical_path.to_owned(),
    })
}

pub fn prepare_registered_playbook_run(
    request: RegisteredPlaybookExecutionRequest,
) -> Result<PreparedRegisteredPlaybookRun, RegisteredPlaybookError> {
    let playbook =
        get_registered_playbook(&request.playbook_key).ok_or(RegisteredPlaybookError::UnknownPlaybook)?;
    let workflow = compile_playbook(&playbook).ok_or(RegisteredPlaybookError::UnsupportedPlaybook)?;
    let workspace = Workspace::new(
        request.workspace_id,
        request.workspace_name,
        request.workspace_root,
    );
    let policy = PolicyProfile::new_default(request.policy_id, &workspace.id, "default");
    let task = Task::new(
        request.task_id.clone(),
        workspace.id.clone(),
        playbook.id.clone(),
        workflow.version_id,
    );
    let run = Run::new(request.run_id, &task.id, workflow, policy, workspace, playbook);
    let contract =
        artifact_contract(&request.playbook_key).ok_or(RegisteredPlaybookError::UnsupportedPlaybook)?;

    Ok(PreparedRegisteredPlaybookRun {
        pending_artifact: PendingArtifactExpectation {
            id: format!("artifact-{}-{}", task.id, contract.primary_id_suffix),
            label: contract.label.to_owned(),
            canonical_path: contract.canonical_path.to_owned(),
        },
        task,
        run,
    })
}

pub fn execute_registered_playbook_run<F, S, C>(
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
    match run.playbook_snapshot.key.as_str() {
        SUMMARY_PLAYBOOK_KEY => execute_standard_summary_playbook(task, run, filesystem, storage, clock),
        DISCOVER_TOPICS_PLAYBOOK_KEY => execute_discovery_playbook(task, run, filesystem, storage, clock),
        other => Err(SummaryPlaybookExecutionError::Routine(format!(
            "unsupported playbook {other}"
        ))),
    }
}

struct ArtifactContract {
    label: &'static str,
    canonical_path: &'static str,
    primary_id_suffix: &'static str,
}

fn artifact_contract(playbook_key: &str) -> Option<ArtifactContract> {
    match playbook_key {
        SUMMARY_PLAYBOOK_KEY => Some(ArtifactContract {
            label: "Summary document",
            canonical_path: "output/summary.md",
            primary_id_suffix: "summary-primary",
        }),
        DISCOVER_TOPICS_PLAYBOOK_KEY => Some(ArtifactContract {
            label: "Discovery report",
            canonical_path: "output/discovery.md",
            primary_id_suffix: "discovery-primary",
        }),
        _ => None,
    }
}
