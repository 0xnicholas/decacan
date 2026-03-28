use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::get;
use axum::{Json, Router};

use crate::app::state::AppState;
use crate::dto::{ArtifactContentDto, ArtifactDto};

pub(super) fn router() -> Router<AppState> {
    Router::new()
        .route("/api/artifacts/:artifact_id", get(get_artifact))
        .route(
            "/api/artifacts/:artifact_id/content",
            get(get_artifact_content),
        )
}

async fn get_artifact(
    State(state): State<AppState>,
    Path(artifact_id): Path<String>,
) -> Result<Json<ArtifactDto>, StatusCode> {
    state
        .get_artifact(&artifact_id)
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}

async fn get_artifact_content(
    State(state): State<AppState>,
    Path(artifact_id): Path<String>,
) -> Result<Json<ArtifactContentDto>, StatusCode> {
    state
        .get_artifact_content(&artifact_id)
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}
