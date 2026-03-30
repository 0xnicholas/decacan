use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::get,
    Json, Router,
};

use crate::app::state::AppState;
use crate::dto::trace::*;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/tasks/:task_id/trace", get(get_task_trace))
        .route("/api/tasks/:task_id/attribution", get(get_task_attribution))
        .route("/api/playbooks/:handle_id/versions/:version_id/stats", get(get_version_stats))
}

async fn get_task_trace(
    State(_state): State<AppState>,
    Path(_task_id): Path<String>,
) -> Result<Json<TaskTraceResponse>, StatusCode> {
    // TODO: Implement actual trace retrieval
    Err(StatusCode::NOT_IMPLEMENTED)
}

async fn get_task_attribution(
    State(_state): State<AppState>,
    Path(_task_id): Path<String>,
) -> Result<Json<AttributionResponse>, StatusCode> {
    // TODO: Implement actual attribution retrieval
    Err(StatusCode::NOT_IMPLEMENTED)
}

async fn get_version_stats(
    State(_state): State<AppState>,
    Path((_handle_id, _version_id)): Path<(String, String)>,
) -> Result<Json<VersionStatsResponse>, StatusCode> {
    // TODO: Implement actual stats calculation
    Err(StatusCode::NOT_IMPLEMENTED)
}
