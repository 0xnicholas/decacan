use axum::extract::{Path, State};
use axum::routing::get;
use axum::{Json, Router};
use http::StatusCode;

use crate::app::state::AppState;
use crate::dto::{WorkspaceDto, WorkspaceHomeDto};

use super::workspace_home_builder::build_workspace_home_stub;

pub(super) fn router() -> Router<AppState> {
    Router::new()
        .route("/api/workspaces", get(list_workspaces))
        .route(
            "/api/workspaces/:workspace_id/home",
            get(get_workspace_home),
        )
}

async fn list_workspaces(State(state): State<AppState>) -> Json<Vec<WorkspaceDto>> {
    Json(state.workspaces())
}

async fn get_workspace_home(
    State(state): State<AppState>,
    Path(workspace_id): Path<String>,
) -> Result<Json<WorkspaceHomeDto>, StatusCode> {
    if !state
        .workspaces()
        .iter()
        .any(|workspace| workspace.id == workspace_id)
    {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(Json(build_workspace_home_stub(&workspace_id)))
}
