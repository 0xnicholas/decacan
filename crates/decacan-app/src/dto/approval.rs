use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ApprovalRequestDto {
    pub decision: String,
    pub comment: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ApprovalDto {
    pub id: String,
    pub workspace_id: String,
    pub task_id: String,
    pub task_playbook_key: String,
    pub decision: String,
    pub comment: Option<String>,
    pub status: String,
}
