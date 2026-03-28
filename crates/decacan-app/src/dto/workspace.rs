use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkspaceDto {
    pub id: String,
    pub title: String,
    pub root_path: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkspaceHomeAttentionItemDto {
    pub id: String,
    pub title: String,
    pub reason: String,
    pub severity: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkspaceTaskHealthDto {
    pub running: u32,
    pub waiting_approval: u32,
    pub blocked: u32,
    pub completed_today: u32,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkspaceDeliverableDto {
    pub id: String,
    pub label: String,
    pub canonical_path: String,
    pub status: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkspaceHomeDto {
    pub attention: Vec<WorkspaceHomeAttentionItemDto>,
    pub task_health: WorkspaceTaskHealthDto,
    pub activity: Vec<crate::dto::ActivityDto>,
    pub deliverables: Vec<WorkspaceDeliverableDto>,
    pub team_snapshot: Vec<crate::dto::MemberDto>,
}
