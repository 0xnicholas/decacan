mod account;
mod approvals;
mod artifacts;
mod assistant;
mod auth;
mod deliverables;
mod evolution_proposals;
mod inbox;
mod members;
mod playbooks;
mod policy;
mod tasks;
mod team_sessions;
mod teams;
mod traces;
mod workspace_home_builder;
mod workspaces;

use axum::Router;

use crate::app::state::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .merge(account::router())
        .merge(assistant::router())
        .merge(auth::router())
        .merge(workspaces::router())
        .merge(playbooks::router())
        .merge(teams::router())
        .merge(team_sessions::router())
        .merge(evolution_proposals::router())
        .merge(policy::router())
        .merge(tasks::router())
        .merge(deliverables::router())
        .merge(approvals::router())
        .merge(inbox::router())
        .merge(artifacts::router())
        .merge(traces::router())
        .merge(members::router())
}
