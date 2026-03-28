use axum::extract::{Path, State};
use axum::routing::get;
use axum::{Json, Router};
use http::StatusCode;

use crate::app::state::AppState;
use crate::dto::{DeliverableDetailDto, DeliverableDto};

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
}

async fn list_workspace_deliverables(
    State(state): State<AppState>,
    Path(workspace_id): Path<String>,
) -> Result<Json<Vec<DeliverableDto>>, StatusCode> {
    if !state.is_known_workspace(&workspace_id) {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(Json(collect_workspace_deliverables(&state, &workspace_id)))
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

            return Ok(Json(DeliverableDetailDto {
                deliverable: DeliverableDto {
                    id: artifact.id,
                    workspace_id: workspace_id.clone(),
                    task_id: task.id.clone(),
                    label: artifact.label,
                    canonical_path: artifact.canonical_path,
                    status: artifact_status_to_deliverable_status(&artifact.status).to_owned(),
                    task_status: task.status.clone(),
                },
                task_playbook_key: detail.task.playbook_key,
                task_input: detail.task.input,
                task_status_summary: detail.task.status_summary,
            }));
        }
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
            deliverables.push(DeliverableDto {
                id: artifact.id,
                workspace_id: workspace_id.to_owned(),
                task_id: task.id.clone(),
                label: artifact.label,
                canonical_path: artifact.canonical_path,
                status: artifact_status_to_deliverable_status(&artifact.status).to_owned(),
                task_status: task.status.clone(),
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
