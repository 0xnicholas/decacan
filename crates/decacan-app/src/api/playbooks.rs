use axum::extract::State;
use axum::routing::get;
use axum::{Json, Router};

use crate::app::state::AppState;
use crate::dto::PlaybookDto;

pub(super) fn router() -> Router<AppState> {
    Router::new().route("/api/playbooks", get(list_playbooks))
}

async fn list_playbooks(State(state): State<AppState>) -> Json<Vec<PlaybookDto>> {
    Json(state.playbooks())
}
