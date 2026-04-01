use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::{get, post};
use axum::{Json, Router};

use crate::app::state::AppState;
use crate::dto::{ApprovalDto, ApprovalRequestDto, TaskEventEnvelopeDto};

pub(super) fn router() -> Router<AppState> {
    Router::new()
        .route("/api/tasks/:task_id/approvals", post(create_approval))
        .route(
            "/api/workspaces/:workspace_id/approvals",
            get(list_workspace_approvals),
        )
        .route(
            "/api/workspaces/:workspace_id/approvals/:approval_id/decision",
            post(decide_workspace_approval),
        )
        .route(
            "/api/approvals/:approval_id/decision",
            post(decide_approval),
        )
        .route("/api/approvals/:approval_id", get(get_approval))
}

async fn create_approval(
    State(state): State<AppState>,
    Path(task_id): Path<String>,
    Json(request): Json<ApprovalRequestDto>,
) -> Result<(StatusCode, Json<ApprovalDto>), StatusCode> {
    let task = state.get_task(&task_id).ok_or(StatusCode::NOT_FOUND)?;

    let approval = ApprovalDto {
        id: state.next_id("approval"),
        workspace_id: task.workspace_id,
        task_id: task_id.clone(),
        task_playbook_key: task.playbook_key,
        decision: request.decision,
        comment: request.comment,
        status: "pending".to_owned(),
    };
    let sequence = state.list_task_events(&task_id).len() as u64 + 1;
    let event = TaskEventEnvelopeDto {
        event_id: state.next_id("event"),
        task_id: task_id.clone(),
        sequence,
        event_type: "approval.recorded".to_owned(),
        snapshot_version: sequence,
        message: "Approval decision recorded".to_owned(),
    };

    state.put_approval(approval.clone());
    state.append_task_event(event);

    Ok((StatusCode::ACCEPTED, Json(approval)))
}

async fn list_workspace_approvals(
    State(state): State<AppState>,
    Path(workspace_id): Path<String>,
) -> Result<Json<Vec<ApprovalDto>>, StatusCode> {
    if !state.is_known_workspace(&workspace_id) {
        return Err(StatusCode::NOT_FOUND);
    }

    let mut approvals = collect_workspace_approvals(&state, &workspace_id);
    approvals.sort_by(|a, b| a.id.cmp(&b.id));
    Ok(Json(approvals))
}

async fn decide_approval(
    State(state): State<AppState>,
    Path(approval_id): Path<String>,
    Json(request): Json<ApprovalRequestDto>,
) -> Result<(StatusCode, Json<ApprovalDto>), StatusCode> {
    resolve_approval_decision(&state, &approval_id, request, None)
}

async fn decide_workspace_approval(
    State(state): State<AppState>,
    Path((workspace_id, approval_id)): Path<(String, String)>,
    Json(request): Json<ApprovalRequestDto>,
) -> Result<(StatusCode, Json<ApprovalDto>), StatusCode> {
    if !state.is_known_workspace(&workspace_id) {
        return Err(StatusCode::NOT_FOUND);
    }

    resolve_approval_decision(&state, &approval_id, request, Some(&workspace_id))
}

async fn get_approval(
    State(state): State<AppState>,
    Path(approval_id): Path<String>,
) -> Result<Json<ApprovalDto>, StatusCode> {
    state
        .get_approval(&approval_id)
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}

fn resolve_approval_decision(
    state: &AppState,
    approval_id: &str,
    request: ApprovalRequestDto,
    workspace_id: Option<&str>,
) -> Result<(StatusCode, Json<ApprovalDto>), StatusCode> {
    let existing = state
        .get_approval(approval_id)
        .ok_or(StatusCode::NOT_FOUND)?;
    if let Some(workspace_id) = workspace_id {
        if existing.workspace_id != workspace_id {
            return Err(StatusCode::NOT_FOUND);
        }
    }
    let task_id = existing.task_id.clone();

    let status = match request.decision.as_str() {
        "approved" => "approved",
        "rejected" => "rejected",
        _ => "pending",
    };
    let updated = state
        .update_approval(approval_id, |approval| {
            approval.decision = request.decision.clone();
            approval.comment = request.comment.clone();
            approval.status = status.to_owned();
        })
        .ok_or(StatusCode::NOT_FOUND)?;

    let sequence = state.next_task_sequence(&task_id);
    state.append_task_event(TaskEventEnvelopeDto {
        event_id: state.next_id("event"),
        task_id,
        sequence,
        event_type: "approval.resolved".to_owned(),
        snapshot_version: sequence,
        message: format!("Approval {}", status),
    });

    Ok((StatusCode::ACCEPTED, Json(updated)))
}

fn collect_workspace_approvals(state: &AppState, workspace_id: &str) -> Vec<ApprovalDto> {
    state
        .list_tasks_in_workspace(workspace_id)
        .into_iter()
        .flat_map(|task| state.list_approvals_for_task(&task.id).into_iter())
        .collect::<Vec<_>>()
}
