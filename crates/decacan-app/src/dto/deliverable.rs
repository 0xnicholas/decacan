use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DeliverableDto {
    pub id: String,
    pub workspace_id: String,
    pub task_id: String,
    pub label: String,
    pub canonical_path: String,
    pub status: String,
    pub task_status: String,
    pub owner: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DeliverableLinkedTaskDto {
    pub id: String,
    pub playbook_key: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DeliverableReviewHistoryEntryDto {
    pub id: String,
    pub action: String,
    pub note: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DeliverableReviewRequestDto {
    pub action: String,
    pub note: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DeliverableDetailDto {
    pub deliverable: DeliverableDto,
    pub linked_task: DeliverableLinkedTaskDto,
    pub review_actions: Vec<String>,
    pub review_history: Vec<DeliverableReviewHistoryEntryDto>,
    pub task_playbook_key: String,
    pub task_input: String,
    pub task_status_summary: String,
}
