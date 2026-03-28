use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::sse::Sse;
use axum::response::IntoResponse;
use axum::routing::get;
use axum::{Json, Router};

use crate::app::state::{pending_artifact_for_task, AppState};
use crate::dto::{CreateTaskAcceptedResponse, CreateTaskRequest, TaskDto, TaskEventDto};
use crate::streams::task_events::task_event_sse;

pub(super) fn router() -> Router<AppState> {
    Router::new()
        .route("/api/tasks", get(list_tasks).post(create_task))
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
) -> Result<Json<TaskDto>, StatusCode> {
    state.get_task(&task_id).map(Json).ok_or(StatusCode::NOT_FOUND)
}

async fn create_task(
    State(state): State<AppState>,
    Json(request): Json<CreateTaskRequest>,
) -> Result<impl IntoResponse, StatusCode> {
    if !state.is_known_workspace(&request.workspace_id) {
        return Err(StatusCode::NOT_FOUND);
    }
    if !state.is_known_playbook(&request.playbook_key) {
        return Err(StatusCode::UNPROCESSABLE_ENTITY);
    }

    let task_id = state.next_id("task");
    let artifact = pending_artifact_for_task(&task_id, &request.playbook_key);
    let task = TaskDto {
        id: task_id.clone(),
        workspace_id: request.workspace_id,
        playbook_key: request.playbook_key,
        input: request.input,
        status: "accepted".to_owned(),
        artifact_id: Some(artifact.id.clone()),
    };
    let event = TaskEventDto {
        id: state.next_id("event"),
        task_id: task_id.clone(),
        event_type: "task.accepted".to_owned(),
        message: "Task accepted by API".to_owned(),
    };

    state.put_artifact(artifact);
    state.put_task(task.clone());
    state.append_task_event(event);

    Ok((
        StatusCode::ACCEPTED,
        Json(CreateTaskAcceptedResponse {
            task,
            events_url: format!("/api/tasks/{task_id}/events"),
            stream_url: format!("/api/tasks/{task_id}/events/stream"),
        }),
    ))
}

async fn list_task_events(
    State(state): State<AppState>,
    Path(task_id): Path<String>,
) -> Result<Json<Vec<TaskEventDto>>, StatusCode> {
    if !state.has_task(&task_id) {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(Json(state.list_task_events(&task_id)))
}

async fn stream_task_events(
    State(state): State<AppState>,
    Path(task_id): Path<String>,
) -> Result<
    Sse<impl tokio_stream::Stream<Item = Result<axum::response::sse::Event, std::convert::Infallible>>>,
    StatusCode,
> {
    if !state.has_task(&task_id) {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(task_event_sse(task_id, state.subscribe_task_events()))
}
