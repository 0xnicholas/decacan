use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkspaceRole {
    Owner,
    Admin,
    Editor,
    Viewer,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkspaceMembership {
    pub id: String,
    pub workspace_id: String,
    pub user_id: String,
    pub role: WorkspaceRole,
    pub invited_by: Option<String>,
    pub invited_at: Option<OffsetDateTime>,
    pub joined_at: OffsetDateTime,
    pub expires_at: Option<OffsetDateTime>,
}

impl WorkspaceMembership {
    pub fn new(
        id: impl Into<String>,
        workspace_id: impl Into<String>,
        user_id: impl Into<String>,
        role: WorkspaceRole,
        invited_by: Option<String>,
    ) -> Self {
        let now = OffsetDateTime::now_utc();
        Self {
            id: id.into(),
            workspace_id: workspace_id.into(),
            user_id: user_id.into(),
            role,
            invited_by,
            invited_at: None,
            joined_at: now,
            expires_at: None,
        }
    }
}
