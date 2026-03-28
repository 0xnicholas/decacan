use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::sse::Sse;
use axum::response::IntoResponse;
use axum::routing::get;
use axum::{Json, Router};

use crate::app::state::{AppState, CreateTaskError};
use crate::dto::{
    CreateTaskRequest, RetryTaskRequest, TaskDetailDto, TaskDto, TaskEventEnvelopeDto,
    TaskInstructionRequest, TaskInstructionResponse, TaskPreviewDto, TaskPreviewRequest,
    TaskSummaryDto,
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
        .route(
            "/api/tasks/:task_id/instructions",
            axum::routing::post(post_task_instruction),
        )
        .route(
            "/api/workspaces/:workspace_id/tasks/:task_id",
            get(get_workspace_task),
        )
        .route(
            "/api/workspaces/:workspace_id/tasks",
            get(list_workspace_tasks),
        )
        .route(
            "/api/workspaces/:workspace_id/tasks/:task_id/events/stream",
            get(stream_workspace_task_events),
        )
        .route(
            "/api/workspaces/:workspace_id/tasks/:task_id/instructions",
            axum::routing::post(post_workspace_task_instruction),
        )
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

async fn get_workspace_task(
    State(state): State<AppState>,
    Path((workspace_id, task_id)): Path<(String, String)>,
) -> Result<Json<TaskDetailDto>, StatusCode> {
    state
        .get_task_detail_in_workspace(&workspace_id, &task_id)
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}

async fn list_workspace_tasks(
    State(state): State<AppState>,
    Path(workspace_id): Path<String>,
) -> Result<Json<Vec<TaskDto>>, StatusCode> {
    if !state.is_known_workspace(&workspace_id) {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(Json(state.list_tasks_in_workspace(&workspace_id)))
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

async fn stream_workspace_task_events(
    State(state): State<AppState>,
    Path((workspace_id, task_id)): Path<(String, String)>,
) -> Result<
    Sse<
        impl tokio_stream::Stream<Item = Result<axum::response::sse::Event, std::convert::Infallible>>,
    >,
    StatusCode,
> {
    if !state.has_task_in_workspace(&workspace_id, &task_id) {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(task_event_sse(task_id, state.subscribe_task_events()))
}

async fn retry_task(
    State(state): State<AppState>,
    Path(task_id): Path<String>,
    Json(request): Json<RetryTaskRequest>,
) -> Result<(StatusCode, Json<TaskSummaryDto>), StatusCode> {
    let task = state
        .retry_task(&task_id, request)
        .await
        .ok_or(StatusCode::NOT_FOUND)?;

    Ok((StatusCode::ACCEPTED, Json(task)))
}

async fn post_task_instruction(
    State(state): State<AppState>,
    Path(task_id): Path<String>,
    Json(request): Json<TaskInstructionRequest>,
) -> Result<(StatusCode, Json<TaskInstructionResponse>), StatusCode> {
    if !state.has_task(&task_id) {
        return Err(StatusCode::NOT_FOUND);
    }

    let message = state
        .append_instruction_message(&task_id, &request.instruction_key)
        .ok_or(StatusCode::UNPROCESSABLE_ENTITY)?;
    let sequence = state.list_task_events(&task_id).len() as u64 + 1;
    state.append_task_event(TaskEventEnvelopeDto {
        event_id: state.next_id("event"),
        task_id: task_id.clone(),
        sequence,
        event_type: "task.collaboration.instruction".to_owned(),
        snapshot_version: sequence,
        message: format!("Instruction executed: {}", message.summary),
    });

    Ok((
        StatusCode::ACCEPTED,
        Json(TaskInstructionResponse { message }),
    ))
}

async fn post_workspace_task_instruction(
    State(state): State<AppState>,
    Path((workspace_id, task_id)): Path<(String, String)>,
    Json(request): Json<TaskInstructionRequest>,
) -> Result<(StatusCode, Json<TaskInstructionResponse>), StatusCode> {
    if !state.has_task_in_workspace(&workspace_id, &task_id) {
        return Err(StatusCode::NOT_FOUND);
    }

    let message = state
        .append_instruction_message(&task_id, &request.instruction_key)
        .ok_or(StatusCode::UNPROCESSABLE_ENTITY)?;
    let sequence = state.list_task_events(&task_id).len() as u64 + 1;
    state.append_task_event(TaskEventEnvelopeDto {
        event_id: state.next_id("event"),
        task_id: task_id.clone(),
        sequence,
        event_type: "task.collaboration.instruction".to_owned(),
        snapshot_version: sequence,
        message: format!("Instruction executed: {}", message.summary),
    });

    Ok((
        StatusCode::ACCEPTED,
        Json(TaskInstructionResponse { message }),
    ))
}
