use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::{get, post};
use axum::{Json, Router};

use crate::app::state::AppState;
use crate::dto::{ApprovalDto, ApprovalRequestDto, TaskEventEnvelopeDto};

pub(super) fn router() -> Router<AppState> {
    Router::new()
        .route("/api/tasks/:task_id/approvals", post(create_approval))
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
        task_id,
        sequence,
        event_type: "approval.recorded".to_owned(),
        snapshot_version: sequence,
        message: "Approval decision recorded".to_owned(),
    };

    state.put_approval(approval.clone());
    state.append_task_event(event);

    Ok((StatusCode::ACCEPTED, Json(approval)))
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
