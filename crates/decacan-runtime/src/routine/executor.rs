use std::fmt::Debug;
use tokio::runtime::Handle;use std::path::{Path, PathBuf};

use crate::artifact::entity::Artifact;
use crate::artifact::service::{ArtifactService, SummaryArtifactWriteResult};
use crate::events::execution::{ArtifactExecutionEvent, ExecutionEvent};
use crate::events::projector::project_execution;
use crate::events::TaskEvent;
use crate::gateway::SynthesisGatewayAdapter;
use crate::outputs::backup::{backup_from_existing_summary, BackupResult};
use crate::outputs::writer::{write_discovery_output, write_summary_output};
use crate::playbook::registry::{DISCOVER_TOPICS_PLAYBOOK_KEY, SUMMARY_PLAYBOOK_KEY};
use crate::ports::clock::ClockPort;
use crate::ports::filesystem::FilesystemPort;
use crate::ports::storage::StoragePort;
use crate::routine::entity::RoutineKind;
use crate::routine::registry::get_routine;
use crate::run::entity::Run;
use crate::synthesis::executor::{
    InvocationContext, InvocationOutcome, InvocationState, ResumeAction,
};
use crate::synthesis::local_models::{DiscoverySynthesisModel, SummarySynthesisModel};
use crate::workflow::entity::Workflow;

#[derive(Debug, Clone)]
pub(crate) struct RoutineExecutionContext {
    pub workspace_root: PathBuf,
    pub selected_markdown_path: Option<PathBuf>,
    pub source_material: Option<String>,
    pub synthesis_state: Option<InvocationState>,
    pub generated_content: Option<String>,
    pub backup_result: Option<BackupResult>,
    pub written_output_path: Option<PathBuf>,
    pub artifact_result: Option<SummaryArtifactWriteResult>,
    pub projected_task_event: Option<TaskEvent>,
}

impl RoutineExecutionContext {
    pub(crate) fn new(workspace_root: impl Into<PathBuf>) -> Self {
        Self {
            workspace_root: workspace_root.into(),
            selected_markdown_path: None,
            source_material: None,
            synthesis_state: None,
            generated_content: None,
            backup_result: None,
            written_output_path: None,
            artifact_result: None,
            projected_task_event: None,
        }
    }
}

#[derive(Debug)]
pub(crate) enum RoutineExecutionError {
    MissingRoutine { step_name: String },
    UnsupportedPlaybook { playbook_key: String },
    Filesystem(String),
    SynthesisBlocked(String),
    SynthesisFailed(String),
    MissingState(&'static str),
    Artifact(String),
}

#[allow(dead_code)]
impl RoutineExecutionError {
    pub(crate) fn message(&self) -> String {
        match self {
            Self::MissingRoutine { step_name } => format!("missing routine for step '{step_name}'"),
            Self::UnsupportedPlaybook { playbook_key } => {
                format!("unsupported playbook '{playbook_key}'")
            }
            Self::Filesystem(message) => message.clone(),
            Self::SynthesisBlocked(message) => message.clone(),
            Self::SynthesisFailed(message) => message.clone(),
            Self::MissingState(message) => message.to_string(),
            Self::Artifact(message) => message.clone(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct RoutineExecutionResult {
    pub primary_artifact: Artifact,
    pub backup_artifact: Option<Artifact>,
    pub projected_task_event: TaskEvent,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
enum ExecutionProfile {
    Summary,
    Discovery,
}

impl ExecutionProfile {
    fn for_run(run: &Run) -> Result<Self, RoutineExecutionError> {
        match run.playbook_snapshot.key.as_str() {
            SUMMARY_PLAYBOOK_KEY => Ok(Self::Summary),
            DISCOVER_TOPICS_PLAYBOOK_KEY => Ok(Self::Discovery),
            playbook_key => Err(RoutineExecutionError::UnsupportedPlaybook {
                playbook_key: playbook_key.to_owned(),
            }),
        }
    }

    fn output_canonical_path(self) -> &'static str {
        match self {
            Self::Summary => "output/summary.md",
            Self::Discovery => "output/discovery.md",
        }
    }
}

pub(crate) fn execute_workflow<F, S, C>(
    run: &mut Run,
    workflow: &Workflow,
    filesystem: &F,
    storage: &S,
    clock: &C,
    tool_gateway: SynthesisGatewayAdapter,
) -> Result<RoutineExecutionResult, RoutineExecutionError>
where
    F: FilesystemPort + Sync,
    F::Error: Debug,
    S: StoragePort + Sync,
    S::Error: Debug,
    C: ClockPort + Sync,
{
    let mut context = RoutineExecutionContext::new(run.workspace_snapshot.root_path().to_string());
    let artifact_service = ArtifactService::new(filesystem, storage, clock);
    let execution_profile = ExecutionProfile::for_run(run)?;

    for (step_index, step) in workflow.steps.iter().enumerate() {
        run.current_step_id = Some(step.id.clone());
        run.step_cursor = step_index;

        let routine =
            get_routine(&step.name).ok_or_else(|| RoutineExecutionError::MissingRoutine {
                step_name: step.name.clone(),
            })?;

        match routine.kind {
            RoutineKind::ScanMarkdownFiles => {
                let markdown_files = filesystem
                    .list_markdown_files(&context.workspace_root)
                    .map_err(|error| RoutineExecutionError::Filesystem(format!("{error:?}")))?;
                let selected = markdown_files
                    .into_iter()
                    .find(|path| {
                        path.file_name().is_some()
                            && !path
                                .components()
                                .any(|component| component.as_os_str() == "output")
                    })
                    .ok_or(RoutineExecutionError::MissingState("markdown scan result"))?;
                context.selected_markdown_path = Some(selected);
            }
            RoutineKind::ReadMarkdownContents => {
                let path = context.selected_markdown_path.clone().ok_or(
                    RoutineExecutionError::MissingState("selected markdown path"),
                )?;
                let contents = filesystem
                    .read_to_string(&path)
                    .map_err(|error| RoutineExecutionError::Filesystem(format!("{error:?}")))?;
                context.source_material = Some(contents.clone());
                run.intermediate_outputs.push(contents);
            }
            RoutineKind::DiscoverTopics | RoutineKind::DiscoverThemes => {
                let invocation_context = InvocationContext {
                    source_material: context
                        .source_material
                        .clone()
                        .ok_or(RoutineExecutionError::MissingState("source material"))?,
                    read_target_path: context.selected_markdown_path.clone(),
                    source_path: context.selected_markdown_path.as_ref().map(|path| {
                        workspace_relative_markdown_path(&context.workspace_root, path)
                    }),
                };
                let invocation = match execution_profile {
                    ExecutionProfile::Summary => {
                        crate::synthesis::executor::start_summary_invocation(
                            &invocation_context,
                            &tool_gateway,
                            &SummarySynthesisModel,
                        )
                    }
                    ExecutionProfile::Discovery => {
                        crate::synthesis::executor::start_summary_invocation(
                            &invocation_context,
                            &tool_gateway,
                            &DiscoverySynthesisModel,
                        )
                    }
                };
                match invocation.outcome {
                    InvocationOutcome::Blocked(_) => {
                        context.synthesis_state = Some(invocation.state);
                    }
                    InvocationOutcome::Completed => {
                        context.synthesis_state = Some(invocation.state);
                        if let Some(candidate) = invocation.output_candidates.last() {
                            context.generated_content = Some(candidate.content.clone());
                        }
                    }
                    InvocationOutcome::Failed { reason } => {
                        return Err(RoutineExecutionError::SynthesisFailed(reason));
                    }
                }
            }
            RoutineKind::DraftSummary | RoutineKind::DraftDiscovery => {
                let invocation_context = InvocationContext {
                    source_material: context
                        .source_material
                        .clone()
                        .ok_or(RoutineExecutionError::MissingState("source material"))?,
                    read_target_path: context.selected_markdown_path.clone(),
                    source_path: context.selected_markdown_path.as_ref().map(|path| {
                        workspace_relative_markdown_path(&context.workspace_root, path)
                    }),
                };
                let invocation_state =
                    context
                        .synthesis_state
                        .clone()
                        .ok_or(RoutineExecutionError::MissingState(
                            "synthesis invocation state",
                        ))?;
                let invocation = match execution_profile {
                    ExecutionProfile::Summary => {
                        crate::synthesis::executor::resume_summary_invocation(
                            invocation_state,
                            &invocation_context,
                            ResumeAction::ToolCompleted,
                            &tool_gateway,
                            &SummarySynthesisModel,
                        )
                    }
                    ExecutionProfile::Discovery => {
                        crate::synthesis::executor::resume_summary_invocation(
                            invocation_state,
                            &invocation_context,
                            ResumeAction::ToolCompleted,
                            &tool_gateway,
                            &DiscoverySynthesisModel,
                        )
                    }
                };
                match invocation.outcome {
                    InvocationOutcome::Completed => {
                        let candidate = invocation.output_candidates.last().cloned().ok_or(
                            RoutineExecutionError::MissingState("synthesis output candidate"),
                        )?;
                        run.output_candidates.push(candidate.canonical_path.clone());
                        context.generated_content = Some(candidate.content);
                        context.synthesis_state = Some(invocation.state);
                    }
                    InvocationOutcome::Blocked(reason) => {
                        return Err(RoutineExecutionError::SynthesisBlocked(format!(
                            "{reason:?}"
                        )));
                    }
                    InvocationOutcome::Failed { reason } => {
                        return Err(RoutineExecutionError::SynthesisFailed(reason));
                    }
                }
            }
            RoutineKind::BackupExistingSummary => {
                context.backup_result =
                    backup_from_existing_summary(filesystem, clock, &context.workspace_root)
                        .map_err(|error| RoutineExecutionError::Filesystem(format!("{error:?}")))?;
            }
            RoutineKind::WriteSummary => {
                let written_path = write_summary_output(
                    filesystem,
                    &context.workspace_root,
                    &context
                        .generated_content
                        .clone()
                        .ok_or(RoutineExecutionError::MissingState("generated content"))?,
                )
                .map_err(|error| RoutineExecutionError::Filesystem(format!("{error:?}")))?;
                run.write_operations
                    .push(execution_profile.output_canonical_path().to_owned());
                context.written_output_path = Some(written_path);
            }
            RoutineKind::WriteDiscovery => {
                let written_path = write_discovery_output(
                    filesystem,
                    &context.workspace_root,
                    &context
                        .generated_content
                        .clone()
                        .ok_or(RoutineExecutionError::MissingState("generated content"))?,
                )
                .map_err(|error| RoutineExecutionError::Filesystem(format!("{error:?}")))?;
                run.write_operations
                    .push(execution_profile.output_canonical_path().to_owned());
                context.written_output_path = Some(written_path);
            }
            RoutineKind::RegisterArtifact => {
                let written_output_path = context
                    .written_output_path
                    .clone()
                    .ok_or(RoutineExecutionError::MissingState("written output path"))?;
                let artifact_result = match execution_profile {
                    ExecutionProfile::Summary => Handle::current().block_on(async {
                            artifact_service
                                .register_written_summary_artifacts(
                                    &run.task_id,
                                    &written_output_path,
                                    context.backup_result.clone(),
                                )
                                .await
                        }).map_err(|error| RoutineExecutionError::Artifact(format!("{error:?}")))?,
                    ExecutionProfile::Discovery => Handle::current().block_on(async {
                            artifact_service
                                .register_written_discovery_artifact(&run.task_id, &written_output_path)
                                .await
                        }).map_err(|error| RoutineExecutionError::Artifact(format!("{error:?}")))?,
                };
                let primary_artifact = artifact_result.primary_artifact.clone();
                let occurred_at = clock.now_utc();
                let task_event = project_execution(ExecutionEvent::Artifact(
                    ArtifactExecutionEvent::ArtifactRegistered {
                        task_id: run.task_id.clone(),
                        run_id: run.id.clone(),
                        artifact_id: primary_artifact.id.clone(),
                        logical_name: primary_artifact.logical_name.clone(),
                        canonical_path: primary_artifact.canonical_path.clone(),
                        physical_path: primary_artifact.physical_path.clone(),
                        occurred_at,
                    },
                ));
                run.event_ids
                    .push(format!("task-event-artifact-ready-{occurred_at}"));
                context.artifact_result = Some(artifact_result);
                context.projected_task_event = Some(task_event);
            }
        }
    }

    let artifact_result = context
        .artifact_result
        .ok_or(RoutineExecutionError::MissingState("artifact result"))?;
    let projected_task_event = context
        .projected_task_event
        .ok_or(RoutineExecutionError::MissingState("projected task event"))?;

    Ok(RoutineExecutionResult {
        primary_artifact: artifact_result.primary_artifact,
        backup_artifact: artifact_result.backup_artifact,
        projected_task_event,
    })
}

fn workspace_relative_markdown_path(workspace_root: &Path, path: &Path) -> String {
    path.strip_prefix(workspace_root)
        .unwrap_or(path)
        .to_string_lossy()
        .replace('\\', "/")
}
