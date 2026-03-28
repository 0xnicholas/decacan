use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::sse::Sse;
use axum::response::IntoResponse;
use axum::routing::get;
use axum::{Json, Router};

use crate::app::state::{AppState, CreateTaskError};
use crate::dto::{
    CreateTaskRequest, RetryTaskRequest, TaskDetailDto, TaskDto, TaskEventEnvelopeDto,
    TaskPreviewDto, TaskPreviewRequest, TaskSummaryDto,
};
use crate::streams::task_events::task_event_sse;

pub(super) fn router() -> Router<AppState> {
    Router::new()
        .route(
            "/api/task-previews",
            axum::routing::post(create_task_preview),
        )
        .route("/api/tasks", get(list_tasks).post(create_task))
        .route("/api/tasks/:task_id/retry", axum::routing::post(retry_task))
        .route("/api/tasks/:task_id", get(get_task))
        .route("/api/tasks/:task_id/events", get(list_task_events))
        .route("/api/tasks/:task_id/events/stream", get(stream_task_events))
}

async fn list_tasks(State(state): State<AppState>) -> Json<Vec<TaskDto>> {
    Json(state.list_tasks())
}

async fn get_task(
    State(state): State<AppState>,
    Path(task_id): Path<String>,
) -> Result<Json<TaskDetailDto>, StatusCode> {
    state
        .get_task_detail(&task_id)
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}

async fn create_task(
    State(state): State<AppState>,
    Json(request): Json<CreateTaskRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    let response = state
        .create_task_execution(request)
        .await
        .map_err(|error| match error {
            CreateTaskError::WorkspaceNotFound => StatusCode::NOT_FOUND,
            CreateTaskError::UnknownPlaybook => StatusCode::UNPROCESSABLE_ENTITY,
        })?;

    Ok((StatusCode::ACCEPTED, Json(response)))
}

async fn create_task_preview(
    State(state): State<AppState>,
    Json(request): Json<TaskPreviewRequest>,
) -> Result<Json<TaskPreviewDto>, StatusCode> {
    let preview = state
        .create_task_preview(request)
        .map_err(|error| match error {
            CreateTaskError::WorkspaceNotFound => StatusCode::NOT_FOUND,
            CreateTaskError::UnknownPlaybook => StatusCode::UNPROCESSABLE_ENTITY,
        })?;

    Ok(Json(preview))
}

async fn list_task_events(
    State(state): State<AppState>,
    Path(task_id): Path<String>,
) -> Result<Json<Vec<TaskEventEnvelopeDto>>, StatusCode> {
    if !state.has_task(&task_id) {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(Json(state.list_task_events(&task_id)))
}

async fn stream_task_events(
    State(state): State<AppState>,
    Path(task_id): Path<String>,
) -> Result<
    Sse<
        impl tokio_stream::Stream<Item = Result<axum::response::sse::Event, std::convert::Infallible>>,
    >,
    StatusCode,
> {
    if !state.has_task(&task_id) {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(task_event_sse(task_id, state.subscribe_task_events()))
}

async fn retry_task(
    State(state): State<AppState>,
    Path(task_id): Path<String>,
    Json(request): Json<RetryTaskRequest>,
) -> Result<(StatusCode, Json<TaskSummaryDto>), StatusCode> {
    let task = state.retry_task(&task_id, request).await.ok_or(StatusCode::NOT_FOUND)?;

    Ok((StatusCode::ACCEPTED, Json(task)))
}
