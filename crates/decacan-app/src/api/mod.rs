mod approvals;
mod artifacts;
mod auth;
mod deliverables;
mod inbox;
mod members;
mod playbooks;
mod policy;
mod tasks;
mod teams;
mod traces;
mod workspace_home_builder;
mod workspaces;

use axum::Router;

use crate::app::state::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .merge(auth::router())
        .merge(workspaces::router())
        .merge(playbooks::router())
        .merge(teams::router())
        .merge(policy::router())
        .merge(tasks::router())
        .merge(deliverables::router())
        .merge(approvals::router())
        .merge(inbox::router())
        .merge(artifacts::router())
        .merge(traces::router())
        .merge(members::router())
}
