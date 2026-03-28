use axum::extract::State;
use axum::routing::get;
use axum::{Json, Router};

use crate::app::state::AppState;
use crate::dto::WorkspaceDto;

pub(super) fn router() -> Router<AppState> {
    Router::new().route("/api/workspaces", get(list_workspaces))
}

async fn list_workspaces(State(state): State<AppState>) -> Json<Vec<WorkspaceDto>> {
    Json(state.workspaces())
}
