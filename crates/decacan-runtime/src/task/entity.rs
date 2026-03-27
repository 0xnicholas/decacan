use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use uuid::Uuid;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TaskStatus {
    Created,
    Running,
    Succeeded,
    Failed,
    Cancelled,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub workspace_id: String,
    pub playbook_key: String,
    pub status: TaskStatus,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
    pub trace_id: Uuid,
}

impl Task {
    pub fn new_for_test(id: &str, workspace_id: &str, playbook_key: &str) -> Self {
        let now = OffsetDateTime::now_utc();
        Self {
            id: id.to_owned(),
            workspace_id: workspace_id.to_owned(),
            playbook_key: playbook_key.to_owned(),
            status: TaskStatus::Created,
            created_at: now,
            updated_at: now,
            trace_id: Uuid::new_v4(),
        }
    }
}
