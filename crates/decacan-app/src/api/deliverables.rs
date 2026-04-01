use axum::extract::{Path, Query, State};
use axum::routing::get;
use axum::{Json, Router};
use http::StatusCode;
use serde::Deserialize;

use crate::app::state::AppState;
use crate::dto::{
    DeliverableDetailDto, DeliverableDto, DeliverableLinkedTaskDto,
    DeliverableReviewHistoryEntryDto, DeliverableReviewRequestDto, TaskEventEnvelopeDto,
};

const DELIVERABLE_OWNER: &str = "Ari";

pub(super) fn router() -> Router<AppState> {
    Router::new()
        .route(
            "/api/workspaces/:workspace_id/deliverables",
            get(list_workspace_deliverables),
        )
        .route(
            "/api/workspaces/:workspace_id/deliverables/:deliverable_id",
            get(get_workspace_deliverable),
        )
        .route(
            "/api/workspaces/:workspace_id/deliverables/:deliverable_id/review",
            axum::routing::post(post_deliverable_review),
        )
}

#[derive(Debug, Deserialize)]
struct ListDeliverablesQuery {
    status: Option<String>,
    task_id: Option<String>,
}

async fn list_workspace_deliverables(
    State(state): State<AppState>,
    Path(workspace_id): Path<String>,
    Query(query): Query<ListDeliverablesQuery>,
) -> Result<Json<Vec<DeliverableDto>>, StatusCode> {
    if !state.is_known_workspace(&workspace_id) {
        return Err(StatusCode::NOT_FOUND);
    }

    let mut deliverables = collect_workspace_deliverables(&state, &workspace_id);
    if let Some(status) = query.status {
        deliverables.retain(|deliverable| deliverable.status == status);
    }
    if let Some(task_id) = query.task_id {
        deliverables.retain(|deliverable| deliverable.task_id == task_id);
    }

    Ok(Json(deliverables))
}

async fn get_workspace_deliverable(
    State(state): State<AppState>,
    Path((workspace_id, deliverable_id)): Path<(String, String)>,
) -> Result<Json<DeliverableDetailDto>, StatusCode> {
    if !state.is_known_workspace(&workspace_id) {
        return Err(StatusCode::NOT_FOUND);
    }

    for task in state.list_tasks_in_workspace(&workspace_id) {
        let Some(detail) = state.get_task_detail(&task.id) else {
            continue;
        };
        if detail.task.workspace_id != workspace_id {
            continue;
        }

        for artifact in detail.artifacts {
            if artifact.id != deliverable_id {
                continue;
            }

            let review_history = review_history_for_task(&state, &task.id);
            return Ok(Json(DeliverableDetailDto {
                deliverable: DeliverableDto {
                    id: artifact.id,
                    workspace_id: workspace_id.clone(),
                    task_id: task.id.clone(),
                    label: artifact.label,
                    canonical_path: artifact.canonical_path,
                    status: deliverable_status_from_task_events(
                        artifact_status_to_deliverable_status(&artifact.status),
                        &review_history,
                    )
                    .to_owned(),
                    task_status: task.status.clone(),
                    owner: DELIVERABLE_OWNER.to_owned(),
                },
                linked_task: DeliverableLinkedTaskDto {
                    id: detail.task.id,
                    playbook_key: detail.task.playbook_key.clone(),
                },
                review_actions: review_actions(),
                review_history,
                task_playbook_key: detail.task.playbook_key,
                task_input: detail.task.input,
                task_status_summary: detail.task.status_summary,
            }));
        }
    }

    Err(StatusCode::NOT_FOUND)
}

async fn post_deliverable_review(
    State(state): State<AppState>,
    Path((workspace_id, deliverable_id)): Path<(String, String)>,
    Json(request): Json<DeliverableReviewRequestDto>,
) -> Result<StatusCode, StatusCode> {
    if !state.is_known_workspace(&workspace_id) {
        return Err(StatusCode::NOT_FOUND);
    }
    if !is_valid_review_action(&request.action) {
        return Err(StatusCode::UNPROCESSABLE_ENTITY);
    }

    for task in state.list_tasks_in_workspace(&workspace_id) {
        let Some(detail) = state.get_task_detail(&task.id) else {
            continue;
        };
        if detail.task.workspace_id != workspace_id {
            continue;
        }
        if !detail
            .artifacts
            .iter()
            .any(|artifact| artifact.id == deliverable_id)
        {
            continue;
        }

        let note = request
            .note
            .unwrap_or_else(|| "No reviewer note".to_owned());
        let sequence = state.next_task_sequence(&task.id);
        state.append_task_event(TaskEventEnvelopeDto {
            event_id: state.next_id("event"),
            task_id: task.id,
            sequence,
            event_type: format!("deliverable.review.{}", request.action),
            snapshot_version: sequence,
            message: note,
        });
        return Ok(StatusCode::ACCEPTED);
    }

    Err(StatusCode::NOT_FOUND)
}

fn collect_workspace_deliverables(state: &AppState, workspace_id: &str) -> Vec<DeliverableDto> {
    let mut deliverables = Vec::new();

    for task in state.list_tasks_in_workspace(workspace_id) {
        let Some(detail) = state.get_task_detail(&task.id) else {
            continue;
        };
        if detail.task.workspace_id != workspace_id {
            continue;
        }

        for artifact in detail.artifacts {
            let review_history = review_history_for_task(state, &task.id);
            deliverables.push(DeliverableDto {
                id: artifact.id,
                workspace_id: workspace_id.to_owned(),
                task_id: task.id.clone(),
                label: artifact.label,
                canonical_path: artifact.canonical_path,
                status: deliverable_status_from_task_events(
                    artifact_status_to_deliverable_status(&artifact.status),
                    &review_history,
                )
                .to_owned(),
                task_status: task.status.clone(),
                owner: DELIVERABLE_OWNER.to_owned(),
            });
        }
    }

    deliverables
}

fn artifact_status_to_deliverable_status(status: &str) -> &'static str {
    match status {
        "ready" => "needs_review",
        "pending" => "pending",
        _ => "updated",
    }
}

fn review_actions() -> Vec<String> {
    vec!["approve".to_owned(), "request_revision".to_owned()]
}

fn is_valid_review_action(action: &str) -> bool {
    review_actions().iter().any(|candidate| candidate == action)
}

fn review_history_for_task(
    state: &AppState,
    task_id: &str,
) -> Vec<DeliverableReviewHistoryEntryDto> {
    let mut history = state
        .list_task_events(task_id)
        .into_iter()
        .filter_map(|event| {
            let action = event.event_type.strip_prefix("deliverable.review.")?;
            Some(DeliverableReviewHistoryEntryDto {
                id: event.event_id,
                action: action.to_owned(),
                note: event.message,
            })
        })
        .collect::<Vec<_>>();
    history.sort_by(|a, b| a.id.cmp(&b.id));
    history
}

fn deliverable_status_from_task_events<'a>(
    fallback_status: &'a str,
    history: &[DeliverableReviewHistoryEntryDto],
) -> &'a str {
    match history.last().map(|entry| entry.action.as_str()) {
        Some("approve") => "approved",
        Some("request_revision") => "revision_requested",
        _ => fallback_status,
    }
}
