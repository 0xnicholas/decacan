use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::get;
use axum::{Json, Router};

use crate::app::state::AppState;
use crate::dto::TeamSessionSnapshotDto;

pub(super) fn router() -> Router<AppState> {
    Router::new().route("/api/team-sessions/:team_session_id", get(get_team_session))
}

async fn get_team_session(
    State(state): State<AppState>,
    Path(team_session_id): Path<String>,
) -> Result<Json<TeamSessionSnapshotDto>, StatusCode> {
    state
        .get_team_session_snapshot(&team_session_id)
        .await
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}
