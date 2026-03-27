use std::fmt::Debug;
use std::path::PathBuf;

use crate::artifact::entity::Artifact;
use crate::artifact::service::{ArtifactService, SummaryArtifactCommand, SummaryArtifactWriteResult};
use crate::events::execution::{ExecutionEvent, SemanticExecutionEvent};
use crate::events::projector::project_execution;
use crate::events::TaskEvent;
use crate::gateway::SemanticGatewayAdapter;
use crate::ports::clock::ClockPort;
use crate::ports::filesystem::FilesystemPort;
use crate::ports::storage::StoragePort;
use crate::routine::entity::RoutineKind;
use crate::routine::registry::get_summary_routine;
use crate::run::entity::Run;
use crate::semantic::executor::{
    InvocationContext, InvocationOutcome, InvocationState, ResumeAction,
    resume_summary_invocation_for_test, start_summary_invocation_for_test,
};
use crate::semantic::model::{ModelContext, OutputCandidate, SemanticModel};
use crate::workflow::entity::Workflow;

#[derive(Debug, Clone)]
pub(crate) struct SummaryRoutineContext {
    pub workspace_root: PathBuf,
    pub selected_markdown_path: Option<PathBuf>,
    pub source_material: Option<String>,
    pub semantic_state: Option<InvocationState>,
    pub summary_content: Option<String>,
    pub artifact_result: Option<SummaryArtifactWriteResult>,
    pub projected_task_event: Option<TaskEvent>,
}

impl SummaryRoutineContext {
    pub(crate) fn new(workspace_root: impl Into<PathBuf>) -> Self {
        Self {
            workspace_root: workspace_root.into(),
            selected_markdown_path: None,
            source_material: None,
            semantic_state: None,
            summary_content: None,
            artifact_result: None,
            projected_task_event: None,
        }
    }
}

#[derive(Debug)]
pub(crate) enum RoutineExecutionError {
    MissingRoutine { step_name: String },
    Filesystem(String),
    SemanticBlocked(String),
    SemanticFailed(String),
    MissingState(&'static str),
    Artifact(String),
}

#[allow(dead_code)]
impl RoutineExecutionError {
    fn message(&self) -> String {
        match self {
            Self::MissingRoutine { step_name } => format!("missing routine for step '{step_name}'"),
            Self::Filesystem(message) => message.clone(),
            Self::SemanticBlocked(message) => message.clone(),
            Self::SemanticFailed(message) => message.clone(),
            Self::MissingState(message) => message.to_string(),
            Self::Artifact(message) => message.clone(),
        }
    }
}

pub(crate) fn execute_summary_workflow<F, S, C>(
    run: &mut Run,
    workflow: &Workflow,
    filesystem: &F,
    storage: &S,
    clock: &C,
    tool_gateway: SemanticGatewayAdapter,
) -> Result<SummaryRoutineExecutionResult, RoutineExecutionError>
where
    F: FilesystemPort,
    F::Error: Debug,
    S: StoragePort,
    S::Error: Debug,
    C: ClockPort,
{
    let mut context = SummaryRoutineContext::new(run.workspace_snapshot.root_path.clone());
    let artifact_service = ArtifactService::new(filesystem, storage, clock);
    let model = SummarySemanticModel;

    for (step_index, step) in workflow.steps.iter().enumerate() {
        run.current_step_id = Some(step.id.clone());
        run.step_cursor = step_index;

        let routine = get_summary_routine(&step.name).ok_or_else(|| {
            RoutineExecutionError::MissingRoutine {
                step_name: step.name.clone(),
            }
        })?;

        match routine.kind {
            RoutineKind::ScanMarkdownFiles => {
                context.selected_markdown_path = Some(context.workspace_root.join("notes.md"));
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
            RoutineKind::DiscoverTopics => {
                let invocation_context = InvocationContext {
                    source_material: context
                        .source_material
                        .clone()
                        .ok_or(RoutineExecutionError::MissingState("source material"))?,
                    read_target_path: context.selected_markdown_path.clone(),
                };
                let invocation =
                    start_summary_invocation_for_test(&invocation_context, &tool_gateway, &model);
                match invocation.outcome {
                    InvocationOutcome::Blocked(_) => {
                        context.semantic_state = Some(invocation.state);
                    }
                    InvocationOutcome::Completed => {
                        context.semantic_state = Some(invocation.state);
                        if let Some(candidate) = invocation.output_candidates.last() {
                            context.summary_content = Some(candidate.content.clone());
                        }
                    }
                    InvocationOutcome::Failed { reason } => {
                        return Err(RoutineExecutionError::SemanticFailed(reason));
                    }
                }
            }
            RoutineKind::DraftSummary => {
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
                let invocation = resume_summary_invocation_for_test(
                    invocation_state,
                    &invocation_context,
                    ResumeAction::ToolCompleted,
                    &tool_gateway,
                    &model,
                );
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
                        context.summary_content = Some(candidate.content);
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
            RoutineKind::BackupExistingSummary => {}
            RoutineKind::WriteSummary => {
                let artifact_result = artifact_service
                    .write_summary_artifact(SummaryArtifactCommand::new(
                        &run.task_id,
                        &context.workspace_root,
                        context
                            .summary_content
                            .clone()
                            .ok_or(RoutineExecutionError::MissingState("summary content"))?,
                    ))
                    .map_err(|error| RoutineExecutionError::Artifact(format!("{error:?}")))?;
                run.write_operations
                    .push(artifact_result.primary_artifact.canonical_path.clone());
                context.artifact_result = Some(artifact_result);
            }
            RoutineKind::RegisterArtifact => {
                let artifact_result = context
                    .artifact_result
                    .clone()
                    .ok_or(RoutineExecutionError::MissingState("artifact write result"))?;
                let primary_artifact = artifact_result.primary_artifact.clone();
                let occurred_at = clock.now_utc();
                let task_event = project_execution(ExecutionEvent::Semantic(
                    SemanticExecutionEvent::OutputCandidateDiscovered {
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

    Ok(SummaryRoutineExecutionResult {
        primary_artifact: artifact_result.primary_artifact,
        backup_artifact: artifact_result.backup_artifact,
        projected_task_event,
    })
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub(crate) struct SummaryRoutineExecutionResult {
    pub primary_artifact: Artifact,
    pub backup_artifact: Option<Artifact>,
    pub projected_task_event: TaskEvent,
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

fn summarize_source_material(source_material: &str) -> String {
    let trimmed = source_material.trim();
    if trimmed.is_empty() {
        "Summary: no source material".to_owned()
    } else {
        format!("Summary: {trimmed}")
    }
}
