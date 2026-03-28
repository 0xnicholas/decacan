mod approvals;
mod artifacts;
mod deliverables;
mod playbooks;
mod tasks;
mod workspace_home_builder;
mod workspaces;

use axum::Router;

use crate::app::state::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .merge(workspaces::router())
        .merge(playbooks::router())
        .merge(tasks::router())
        .merge(deliverables::router())
        .merge(approvals::router())
        .merge(artifacts::router())
}
