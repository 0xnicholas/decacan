use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TaskDto {
    pub id: String,
    pub workspace_id: String,
    pub playbook_key: String,
    pub input: String,
    pub status: String,
    pub artifact_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CreateTaskRequest {
    pub workspace_id: String,
    pub playbook_key: String,
    pub input: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TaskPreviewRequest {
    pub workspace_id: String,
    pub playbook_key: String,
    pub input: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TaskPreviewDto {
    pub preview_id: String,
    pub plan_steps: Vec<String>,
    pub expected_artifact_label: String,
    pub expected_artifact_path: String,
    pub will_auto_start: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CreateTaskAcceptedResponse {
    pub task: TaskDto,
    pub events_url: String,
    pub stream_url: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TaskEventDto {
    pub id: String,
    pub task_id: String,
    pub event_type: String,
    pub message: String,
}
