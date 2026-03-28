use axum::Router;

use crate::api;

use super::state::AppState;

pub fn router_for_test() -> Router {
    router_with_state(AppState::new_for_test())
}

pub fn router_with_state(state: AppState) -> Router {
    Router::new().merge(api::router()).with_state(state)
}
