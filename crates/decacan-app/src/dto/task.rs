use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TaskDto {
    pub id: String,
    pub workspace_id: String,
    pub playbook_key: String,
    pub input: String,
    pub status: String,
    pub status_summary: String,
    pub artifact_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TaskSummaryDto {
    pub id: String,
    pub workspace_id: String,
    pub playbook_key: String,
    pub input: String,
    pub status: String,
    pub status_summary: String,
    pub artifact_id: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TaskPlanDto {
    pub steps: Vec<String>,
    pub current_step_index: usize,
    pub status: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TaskDetailDto {
    pub task: TaskSummaryDto,
    pub plan: TaskPlanDto,
    pub approvals: Vec<crate::dto::ApprovalDto>,
    pub artifacts: Vec<crate::dto::ArtifactDto>,
    pub timeline: Vec<TaskEventEnvelopeDto>,
    pub collaboration: TaskCollaborationDto,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CreateTaskRequest {
    pub workspace_id: String,
    pub playbook_handle_id: String,
    pub playbook_version_id: String,
    pub input_payload: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RetryTaskRequest {
    pub note: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TaskInstructionRequest {
    pub instruction_key: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TaskAgentMessageDto {
    pub id: String,
    pub task_id: String,
    pub role: String,
    pub summary: String,
    pub detail: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TaskInstructionActionDto {
    pub key: String,
    pub label: String,
    pub instruction: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TaskCollaborationDto {
    pub agent_messages: Vec<TaskAgentMessageDto>,
    pub instruction_actions: Vec<TaskInstructionActionDto>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TaskInstructionResponse {
    pub message: TaskAgentMessageDto,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TaskPreviewRequest {
    pub workspace_id: String,
    pub playbook_handle_id: String,
    pub playbook_version_id: String,
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
pub struct TaskEventEnvelopeDto {
    pub event_id: String,
    pub task_id: String,
    pub sequence: u64,
    pub event_type: String,
    pub snapshot_version: u64,
    pub message: String,
}
