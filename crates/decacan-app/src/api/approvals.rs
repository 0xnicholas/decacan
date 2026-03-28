use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::{get, post};
use axum::{Json, Router};

use crate::app::state::AppState;
use crate::dto::{ApprovalDto, ApprovalRequestDto, TaskEventEnvelopeDto};

pub(super) fn router() -> Router<AppState> {
    Router::new()
        .route("/api/tasks/:task_id/approvals", post(create_approval))
        .route("/api/approvals/:approval_id/decision", post(decide_approval))
        .route("/api/approvals/:approval_id", get(get_approval))
}

async fn create_approval(
    State(state): State<AppState>,
    Path(task_id): Path<String>,
    Json(request): Json<ApprovalRequestDto>,
) -> Result<(StatusCode, Json<ApprovalDto>), StatusCode> {
    if state.get_task(&task_id).is_none() {
        return Err(StatusCode::NOT_FOUND);
    }

    let approval = ApprovalDto {
        id: state.next_id("approval"),
        task_id: task_id.clone(),
        decision: request.decision,
        comment: request.comment,
        status: "recorded".to_owned(),
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
    let _ = state.update_task(&task_id, |task| {
        task.status = "waiting_approval".to_owned();
    });
    state.append_task_event(event);

    Ok((StatusCode::ACCEPTED, Json(approval)))
}

async fn decide_approval(
    State(state): State<AppState>,
    Path(approval_id): Path<String>,
    Json(request): Json<ApprovalRequestDto>,
) -> Result<(StatusCode, Json<ApprovalDto>), StatusCode> {
    let existing = state.get_approval(&approval_id).ok_or(StatusCode::NOT_FOUND)?;
    let task_id = existing.task_id.clone();

    let status = match request.decision.as_str() {
        "approved" => "approved",
        "rejected" => "rejected",
        _ => "recorded",
    };
    let updated = state
        .update_approval(&approval_id, |approval| {
            approval.decision = request.decision.clone();
            approval.comment = request.comment.clone();
            approval.status = status.to_owned();
        })
        .ok_or(StatusCode::NOT_FOUND)?;

    let _ = state.update_task(&task_id, |task| {
        task.status = if status == "approved" {
            "running".to_owned()
        } else {
            "failed".to_owned()
        };
    });

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

async fn get_approval(
    State(state): State<AppState>,
    Path(approval_id): Path<String>,
) -> Result<Json<ApprovalDto>, StatusCode> {
    state
        .get_approval(&approval_id)
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}
