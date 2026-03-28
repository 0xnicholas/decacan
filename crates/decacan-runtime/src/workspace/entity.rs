use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use uuid::Uuid;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkspaceStatus {
    Draft,
    Active,
    Archived,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Workspace {
    pub id: String,
    pub name: String,
    pub root_path: String,
    pub status: WorkspaceStatus,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
    pub version_id: Uuid,
}

impl Workspace {
    pub fn new(id: impl Into<String>, name: impl Into<String>, root_path: impl Into<String>) -> Self {
        let now = OffsetDateTime::now_utc();
        Self {
            id: id.into(),
            name: name.into(),
            root_path: root_path.into(),
            status: WorkspaceStatus::Active,
            created_at: now,
            updated_at: now,
            version_id: Uuid::new_v4(),
        }
    }

    pub fn new_for_test(id: &str, name: &str, root_path: &str) -> Self {
        Self::new(id, name, root_path)
    }
}
