use axum::extract::State;
use axum::routing::get;
use axum::{Json, Router};

use crate::app::state::AppState;
use crate::dto::AccountHomeDto;
use crate::CurrentUser;

pub(super) fn router() -> Router<AppState> {
    Router::new().route("/api/account/home", get(get_account_home))
}

async fn get_account_home(
    State(state): State<AppState>,
    current_user: CurrentUser,
) -> Json<AccountHomeDto> {
    Json(state.build_account_home_for_user(&current_user))
}
