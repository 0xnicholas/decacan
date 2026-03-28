use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use uuid::Uuid;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum TaskStatus {
    Created,
    Planning,
    Running,
    Paused,
    Succeeded,
    Failed,
    Cancelled,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Task {
    pub id: String,
    pub workspace_id: String,
    pub playbook_id: String,
    pub playbook_version_id: Uuid,
    pub status: TaskStatus,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
    pub trace_id: Uuid,
}

impl Task {
    pub fn new(
        id: impl Into<String>,
        workspace_id: impl Into<String>,
        playbook_id: impl Into<String>,
        playbook_version_id: Uuid,
    ) -> Self {
        let now = OffsetDateTime::now_utc();
        Self {
            id: id.into(),
            workspace_id: workspace_id.into(),
            playbook_id: playbook_id.into(),
            playbook_version_id,
            status: TaskStatus::Created,
            created_at: now,
            updated_at: now,
            trace_id: Uuid::new_v4(),
        }
    }

    pub fn new_for_test(
        id: &str,
        workspace_id: &str,
        playbook_id: &str,
        playbook_version_id: Uuid,
    ) -> Self {
        Self::new(id, workspace_id, playbook_id, playbook_version_id)
    }
}
