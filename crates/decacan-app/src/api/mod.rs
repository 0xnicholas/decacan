use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::sse::Sse;
use axum::response::IntoResponse;
use axum::routing::{get, post};
use axum::{Json, Router};

use crate::app::{pending_artifact_for_task, AppState};
use crate::dto::{
    ApprovalDto, ApprovalRequestDto, ArtifactDto, CreateTaskAcceptedResponse, CreateTaskRequest,
    TaskDto, TaskEventDto,
};
use crate::streams::task_event_sse;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/api/workspaces", get(list_workspaces))
        .route("/api/playbooks", get(list_playbooks))
        .route("/api/tasks", get(list_tasks).post(create_task))
        .route("/api/tasks/:task_id", get(get_task))
        .route("/api/tasks/:task_id/approvals", post(create_approval))
        .route("/api/tasks/:task_id/events", get(list_task_events))
        .route("/api/tasks/:task_id/events/stream", get(stream_task_events))
        .route("/api/approvals/:approval_id", get(get_approval))
        .route("/api/artifacts/:artifact_id", get(get_artifact))
}

async fn list_workspaces(State(state): State<AppState>) -> Json<Vec<crate::dto::WorkspaceDto>> {
    Json(state.workspaces())
}

async fn list_playbooks(State(state): State<AppState>) -> Json<Vec<crate::dto::PlaybookDto>> {
    Json(state.playbooks())
}

async fn list_tasks(State(state): State<AppState>) -> Json<Vec<TaskDto>> {
    Json(state.list_tasks())
}

async fn get_task(
    State(state): State<AppState>,
    Path(task_id): Path<String>,
) -> Result<Json<TaskDto>, StatusCode> {
    state
        .get_task(&task_id)
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
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
    let event = TaskEventDto {
        id: state.next_id("event"),
        task_id,
        event_type: "approval.recorded".to_owned(),
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

async fn get_artifact(
    State(state): State<AppState>,
    Path(artifact_id): Path<String>,
) -> Result<Json<ArtifactDto>, StatusCode> {
    state
        .get_artifact(&artifact_id)
        .map(Json)
        .ok_or(StatusCode::NOT_FOUND)
}

async fn list_task_events(
    State(state): State<AppState>,
    Path(task_id): Path<String>,
) -> Json<Vec<TaskEventDto>> {
    Json(state.list_task_events(&task_id))
}

async fn stream_task_events(
    State(state): State<AppState>,
    Path(task_id): Path<String>,
) -> Sse<impl tokio_stream::Stream<Item = Result<axum::response::sse::Event, std::convert::Infallible>>>
{
    task_event_sse(task_id, state.subscribe_task_events())
}
