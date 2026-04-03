use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::{get, post};
use axum::{Json, Router};

use crate::app::state::{AppState, AssistantDelegationError};
use crate::dto::{
    AssistantSessionResponseDto, CreateAssistantDelegationRequestDto,
    CreateAssistantSessionRequestDto,
};

pub(super) fn router() -> Router<AppState> {
    Router::new()
        .route("/api/assistant-sessions", post(create_assistant_session))
        .route(
            "/api/assistant-sessions/:assistant_session_id/delegations",
            post(create_assistant_delegation),
        )
        .route(
            "/api/assistant-sessions/:assistant_session_id",
            get(get_assistant_session),
        )
}

async fn create_assistant_session(
    State(state): State<AppState>,
    Json(request): Json<CreateAssistantSessionRequestDto>,
) -> Result<(StatusCode, Json<AssistantSessionResponseDto>), StatusCode> {
    let created = state
        .create_assistant_session(request)
        .await
        .map_err(map_assistant_error_to_status)?;
    Ok((StatusCode::CREATED, Json(created)))
}

async fn create_assistant_delegation(
    State(state): State<AppState>,
    Path(assistant_session_id): Path<String>,
    Json(request): Json<CreateAssistantDelegationRequestDto>,
) -> Result<(StatusCode, Json<AssistantSessionResponseDto>), StatusCode> {
    let created = state
        .create_assistant_delegation(&assistant_session_id, request)
        .await
        .map_err(map_assistant_error_to_status)?;
    Ok((StatusCode::CREATED, Json(created)))
}

async fn get_assistant_session(
    State(state): State<AppState>,
    Path(assistant_session_id): Path<String>,
) -> Result<Json<AssistantSessionResponseDto>, StatusCode> {
    let session = state
        .get_assistant_session(&assistant_session_id)
        .await
        .map_err(map_assistant_error_to_status)?;
    Ok(Json(session))
}

fn map_assistant_error_to_status(error: AssistantDelegationError) -> StatusCode {
    match error {
        AssistantDelegationError::WorkspaceNotFound | AssistantDelegationError::SessionNotFound => {
            StatusCode::NOT_FOUND
        }
        AssistantDelegationError::ActiveDelegationExists => StatusCode::CONFLICT,
        AssistantDelegationError::OrchestrationFailed => StatusCode::INTERNAL_SERVER_ERROR,
    }
}
