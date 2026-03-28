use std::fmt::Debug;
use std::path::PathBuf;

use crate::artifact::entity::Artifact;
use crate::artifact::service::{ArtifactService, SummaryArtifactWriteResult};
use crate::events::execution::{ArtifactExecutionEvent, ExecutionEvent};
use crate::events::projector::project_execution;
use crate::events::TaskEvent;
use crate::gateway::SemanticGatewayAdapter;
use crate::outputs::backup::{backup_from_existing_summary, BackupResult};
use crate::outputs::writer::{write_discovery_output, write_summary_output};
use crate::playbook::registry::{DISCOVER_TOPICS_PLAYBOOK_KEY, SUMMARY_PLAYBOOK_KEY};
use crate::ports::clock::ClockPort;
use crate::ports::filesystem::FilesystemPort;
use crate::ports::storage::StoragePort;
use crate::routine::entity::RoutineKind;
use crate::routine::registry::get_routine;
use crate::run::entity::Run;
use crate::semantic::executor::{
    InvocationContext, InvocationOutcome, InvocationState, ResumeAction,
};
use crate::semantic::model::{ModelContext, OutputCandidate, SemanticModel};
use crate::workflow::entity::Workflow;

#[derive(Debug, Clone)]
pub(crate) struct RoutineExecutionContext {
    pub workspace_root: PathBuf,
    pub selected_markdown_path: Option<PathBuf>,
    pub source_material: Option<String>,
    pub semantic_state: Option<InvocationState>,
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
            semantic_state: None,
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
    SemanticBlocked(String),
    SemanticFailed(String),
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
            Self::SemanticBlocked(message) => message.clone(),
            Self::SemanticFailed(message) => message.clone(),
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
    tool_gateway: SemanticGatewayAdapter,
) -> Result<RoutineExecutionResult, RoutineExecutionError>
where
    F: FilesystemPort,
    F::Error: Debug,
    S: StoragePort,
    S::Error: Debug,
    C: ClockPort,
{
    let mut context = RoutineExecutionContext::new(run.workspace_snapshot.root_path.clone());
    let artifact_service = ArtifactService::new(filesystem, storage, clock);
    let execution_profile = ExecutionProfile::for_run(run)?;

    for (step_index, step) in workflow.steps.iter().enumerate() {
        run.current_step_id = Some(step.id.clone());
        run.step_cursor = step_index;

        let routine = get_routine(&step.name).ok_or_else(|| RoutineExecutionError::MissingRoutine {
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
                let path = context
                    .selected_markdown_path
                    .clone()
                    .ok_or(RoutineExecutionError::MissingState("selected markdown path"))?;
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
                };
                let invocation = match execution_profile {
                    ExecutionProfile::Summary => crate::semantic::executor::start_summary_invocation(
                        &invocation_context,
                        &tool_gateway,
                        &SummarySemanticModel,
                    ),
                    ExecutionProfile::Discovery => {
                        crate::semantic::executor::start_summary_invocation(
                            &invocation_context,
                            &tool_gateway,
                            &DiscoverySemanticModel,
                        )
                    }
                };
                match invocation.outcome {
                    InvocationOutcome::Blocked(_) => {
                        context.semantic_state = Some(invocation.state);
                    }
                    InvocationOutcome::Completed => {
                        context.semantic_state = Some(invocation.state);
                        if let Some(candidate) = invocation.output_candidates.last() {
                            context.generated_content = Some(candidate.content.clone());
                        }
                    }
                    InvocationOutcome::Failed { reason } => {
                        return Err(RoutineExecutionError::SemanticFailed(reason));
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
                };
                let invocation_state = context
                    .semantic_state
                    .clone()
                    .ok_or(RoutineExecutionError::MissingState("semantic invocation state"))?;
                let invocation = match execution_profile {
                    ExecutionProfile::Summary => crate::semantic::executor::resume_summary_invocation(
                        invocation_state,
                        &invocation_context,
                        ResumeAction::ToolCompleted,
                        &tool_gateway,
                        &SummarySemanticModel,
                    ),
                    ExecutionProfile::Discovery => {
                        crate::semantic::executor::resume_summary_invocation(
                            invocation_state,
                            &invocation_context,
                            ResumeAction::ToolCompleted,
                            &tool_gateway,
                            &DiscoverySemanticModel,
                        )
                    }
                };
                match invocation.outcome {
                    InvocationOutcome::Completed => {
                        let candidate = invocation
                            .output_candidates
                            .last()
                            .cloned()
                            .ok_or(RoutineExecutionError::MissingState(
                                "semantic output candidate",
                            ))?;
                        run.output_candidates.push(candidate.canonical_path.clone());
                        context.generated_content = Some(candidate.content);
                        context.semantic_state = Some(invocation.state);
                    }
                    InvocationOutcome::Blocked(reason) => {
                        return Err(RoutineExecutionError::SemanticBlocked(format!("{reason:?}")));
                    }
                    InvocationOutcome::Failed { reason } => {
                        return Err(RoutineExecutionError::SemanticFailed(reason));
                    }
                }
            }
            RoutineKind::BackupExistingSummary => {
                context.backup_result =
                    backup_from_existing_summary(filesystem, clock, &context.workspace_root)
                        .map_err(|error| {
                            RoutineExecutionError::Filesystem(format!("{error:?}"))
                        })?;
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
                    ExecutionProfile::Summary => artifact_service
                        .register_written_summary_artifacts(
                            &run.task_id,
                            &written_output_path,
                            context.backup_result.clone(),
                        )
                        .map_err(|error| RoutineExecutionError::Artifact(format!("{error:?}")))?,
                    ExecutionProfile::Discovery => artifact_service
                        .register_written_discovery_artifact(&run.task_id, &written_output_path)
                        .map_err(|error| RoutineExecutionError::Artifact(format!("{error:?}")))?,
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
                run.event_ids.push(format!("task-event-artifact-ready-{occurred_at}"));
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

#[derive(Debug, Clone, Copy)]
struct SummarySemanticModel;

impl SemanticModel for SummarySemanticModel {
    type Error = core::convert::Infallible;

    fn produce_output_candidate(
        &self,
        context: &ModelContext,
    ) -> Result<OutputCandidate, Self::Error> {
        Ok(OutputCandidate {
            artifact_id: "semantic-output-summary".to_owned(),
            logical_name: "workspace.summary.primary".to_owned(),
            canonical_path: "output/summary.md".to_owned(),
            physical_path: "/tmp/runtime-summary.md".to_owned(),
            content: summarize_source_material(&context.source_material),
        })
    }
}

#[derive(Debug, Clone, Copy)]
struct DiscoverySemanticModel;

impl SemanticModel for DiscoverySemanticModel {
    type Error = core::convert::Infallible;

    fn produce_output_candidate(
        &self,
        context: &ModelContext,
    ) -> Result<OutputCandidate, Self::Error> {
        Ok(OutputCandidate {
            artifact_id: "semantic-output-discovery".to_owned(),
            logical_name: "workspace.discovery.primary".to_owned(),
            canonical_path: "output/discovery.md".to_owned(),
            physical_path: "/tmp/runtime-discovery.md".to_owned(),
            content: discover_source_themes(&context.source_material),
        })
    }
}

fn summarize_source_material(source_material: &str) -> String {
    let trimmed = source_material.trim();
    if trimmed.is_empty() {
        "Summary: no source material".to_owned()
    } else {
        format!("Summary: {trimmed}")
    }
}

fn discover_source_themes(source_material: &str) -> String {
    let themes = source_material
        .lines()
        .map(str::trim)
        .filter(|line| !line.is_empty())
        .take(3)
        .map(|line| format!("- {line}"))
        .collect::<Vec<_>>();

    if themes.is_empty() {
        "Discovered themes:\n- no source material".to_owned()
    } else {
        format!("Discovered themes:\n{}", themes.join("\n"))
    }
}
