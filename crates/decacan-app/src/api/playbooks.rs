use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::{get, put};
use axum::{Json, Router};

use crate::app::state::{AppState, PlaybookLifecycleError};
use crate::dto::{
    ForkPlaybookRequestDto, ForkPlaybookResponseDto, PlaybookDetailDto, PlaybookDto,
    PublishPlaybookResponseDto, SavePlaybookDraftRequestDto, SavePlaybookDraftResponseDto,
    StoreEntryDto,
};

pub(super) fn router() -> Router<AppState> {
    Router::new()
        .route("/api/playbooks", get(list_playbooks))
        .route("/api/playbook-store", get(list_playbook_store))
        .route("/api/playbooks/fork", axum::routing::post(fork_playbook))
        .route("/api/playbooks/:handle_id", get(get_playbook))
        .route("/api/playbooks/:handle_id/draft", put(save_playbook_draft))
        .route("/api/playbooks/:handle_id/publish", axum::routing::post(publish_playbook))
}

async fn list_playbooks(State(state): State<AppState>) -> Json<Vec<PlaybookDto>> {
    Json(state.playbooks())
}

async fn list_playbook_store(State(state): State<AppState>) -> Json<Vec<StoreEntryDto>> {
    Json(state.list_playbook_store())
}

async fn fork_playbook(
    State(state): State<AppState>,
    Json(request): Json<ForkPlaybookRequestDto>,
) -> Result<(StatusCode, Json<ForkPlaybookResponseDto>), StatusCode> {
    let response = state
        .fork_playbook_from_store(&request.store_entry_id)
        .map_err(map_playbook_lifecycle_error)?;

    Ok((StatusCode::CREATED, Json(response)))
}

async fn get_playbook(
    State(state): State<AppState>,
    Path(handle_id): Path<String>,
) -> Result<Json<PlaybookDetailDto>, StatusCode> {
    let detail = state
        .get_playbook_detail(&handle_id)
        .map_err(map_playbook_lifecycle_error)?;

    Ok(Json(detail))
}

async fn save_playbook_draft(
    State(state): State<AppState>,
    Path(handle_id): Path<String>,
    Json(request): Json<SavePlaybookDraftRequestDto>,
) -> Result<Json<SavePlaybookDraftResponseDto>, StatusCode> {
    let response = state
        .save_playbook_draft(&handle_id, request.spec_document)
        .map_err(map_playbook_lifecycle_error)?;

    Ok(Json(response))
}

async fn publish_playbook(
    State(state): State<AppState>,
    Path(handle_id): Path<String>,
) -> Result<(StatusCode, Json<PublishPlaybookResponseDto>), StatusCode> {
    let outcome = state
        .publish_playbook_draft(&handle_id)
        .map_err(map_playbook_lifecycle_error)?;
    let status = if outcome.publishable {
        StatusCode::OK
    } else {
        StatusCode::UNPROCESSABLE_ENTITY
    };

    Ok((status, Json(outcome.response)))
}

fn map_playbook_lifecycle_error(error: PlaybookLifecycleError) -> StatusCode {
    match error {
        PlaybookLifecycleError::StoreEntryNotFound | PlaybookLifecycleError::HandleNotFound => {
            StatusCode::NOT_FOUND
        }
    }
}
