use axum::extract::State;
use axum::routing::get;
use axum::{Json, Router};
use serde::Serialize;

use crate::app::state::AppState;

pub(super) fn router() -> Router<AppState> {
    Router::new().route("/api/inbox", get(get_inbox))
}

#[derive(Debug, Serialize)]
struct InboxItemDto {
    id: String,
    workspace_id: String,
    task_id: String,
    title: String,
    kind: String,
}

#[derive(Debug, Serialize)]
struct InboxDto {
    waiting_on_me: Vec<InboxItemDto>,
    recently_resolved: Vec<InboxItemDto>,
}

async fn get_inbox(State(state): State<AppState>) -> Json<InboxDto> {
    let mut waiting_on_me = Vec::new();
    let mut recently_resolved = Vec::new();

    for workspace in state.workspaces() {
        for task in state.list_tasks_in_workspace(&workspace.id) {
            for approval in state.list_approvals_for_task(&task.id) {
                let item = InboxItemDto {
                    id: approval.id,
                    workspace_id: workspace.id.clone(),
                    task_id: task.id.clone(),
                    title: format!("Approval needed for {}", task.playbook_key),
                    kind: "approval".to_owned(),
                };

                match approval.status.as_str() {
                    "approved" | "rejected" => recently_resolved.push(item),
                    _ => waiting_on_me.push(item),
                }
            }
        }
    }

    waiting_on_me.sort_by(|a, b| a.id.cmp(&b.id));
    recently_resolved.sort_by(|a, b| a.id.cmp(&b.id));

    Json(InboxDto {
        waiting_on_me,
        recently_resolved,
    })
}
