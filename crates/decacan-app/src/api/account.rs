use axum::extract::State;
use axum::routing::get;
use axum::{Json, Router};

use crate::app::state::AppState;
use crate::dto::AccountHomeDto;

pub(super) fn router() -> Router<AppState> {
    Router::new().route("/api/account/home", get(get_account_home))
}

async fn get_account_home(State(state): State<AppState>) -> Json<AccountHomeDto> {
    Json(state.build_account_home())
}
