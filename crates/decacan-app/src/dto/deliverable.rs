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
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DeliverableDetailDto {
    pub deliverable: DeliverableDto,
    pub task_playbook_key: String,
    pub task_input: String,
    pub task_status_summary: String,
}
