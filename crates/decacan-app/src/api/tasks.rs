use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::response::sse::Sse;
use axum::response::IntoResponse;
use axum::routing::get;
use axum::{Json, Router};

use crate::app::state::{pending_artifact_for_task, plan_for_task, AppState};
use crate::dto::{
    CreateTaskAcceptedResponse, CreateTaskRequest, TaskDetailDto, TaskDto, TaskEventEnvelopeDto,
    TaskPreviewDto, TaskPreviewRequest, TaskSummaryDto,
};
use crate::streams::task_events::task_event_sse;

pub(super) fn router() -> Router<AppState> {
    Router::new()
        .route("/api/task-previews", axum::routing::post(create_task_preview))
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
) -> Result<Json<TaskDetailDto>, StatusCode> {
    let task = state.get_task(&task_id).ok_or(StatusCode::NOT_FOUND)?;
    let plan = plan_for_task(&task);
    let approvals = state.list_approvals_for_task(&task_id);
    let artifacts = state.list_artifacts_for_task(&task_id);
    let timeline = state.list_task_events(&task_id);

    Ok(Json(TaskDetailDto {
        task: TaskSummaryDto {
            id: task.id,
            workspace_id: task.workspace_id,
            playbook_key: task.playbook_key,
            input: task.input,
            status: task.status,
            status_summary: "Task accepted and ready to run".to_owned(),
            artifact_id: task.artifact_id,
        },
        plan,
        approvals,
        artifacts,
        timeline,
    }))
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
    let event = TaskEventEnvelopeDto {
        event_id: state.next_id("event"),
        task_id: task_id.clone(),
        sequence: 1,
        event_type: "task.accepted".to_owned(),
        snapshot_version: 1,
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

async fn create_task_preview(
    State(state): State<AppState>,
    Json(request): Json<TaskPreviewRequest>,
) -> Result<Json<TaskPreviewDto>, StatusCode> {
    if !state.is_known_workspace(&request.workspace_id) {
        return Err(StatusCode::NOT_FOUND);
    }
    if !state.is_known_playbook(&request.playbook_key) {
        return Err(StatusCode::UNPROCESSABLE_ENTITY);
    }

    let (plan_steps, expected_artifact_label, expected_artifact_path) =
        match request.playbook_key.as_str() {
            "总结资料" => (
                vec![
                    "Scan markdown files in the selected workspace".to_owned(),
                    "Draft a concise summary with key takeaways".to_owned(),
                    "Write the final summary artifact to output/summary.md".to_owned(),
                ],
                "Summary document".to_owned(),
                "output/summary.md".to_owned(),
            ),
            "发现资料主题" => (
                vec![
                    "Scan markdown files in the selected workspace".to_owned(),
                    "Cluster notes into themes and unanswered questions".to_owned(),
                    "Write the discovery artifact to output/discovery.md".to_owned(),
                ],
                "Discovery report".to_owned(),
                "output/discovery.md".to_owned(),
            ),
            _ => (
                vec![
                    "Inspect the selected workspace".to_owned(),
                    "Produce a result artifact".to_owned(),
                ],
                "Result document".to_owned(),
                "output/result.md".to_owned(),
            ),
        };

    Ok(Json(TaskPreviewDto {
        preview_id: state.next_id("preview"),
        plan_steps,
        expected_artifact_label,
        expected_artifact_path,
        will_auto_start: true,
    }))
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
    Sse<impl tokio_stream::Stream<Item = Result<axum::response::sse::Event, std::convert::Infallible>>>,
    StatusCode,
> {
    if !state.has_task(&task_id) {
        return Err(StatusCode::NOT_FOUND);
    }

    Ok(task_event_sse(task_id, state.subscribe_task_events()))
}
