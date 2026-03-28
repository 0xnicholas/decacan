use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use uuid::Uuid;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PolicyProfile {
    pub id: String,
    pub workspace_id: String,
    pub name: String,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
    pub version_id: Uuid,
    pub allowed_tools: Vec<String>,
    pub approval_required_tools: Vec<String>,
    pub denied_tools: Vec<String>,
}

impl PolicyProfile {
    pub fn new_default(
        id: impl Into<String>,
        workspace_id: impl Into<String>,
        name: impl Into<String>,
    ) -> Self {
        let now = OffsetDateTime::now_utc();
        Self {
            id: id.into(),
            workspace_id: workspace_id.into(),
            name: name.into(),
            created_at: now,
            updated_at: now,
            version_id: Uuid::new_v4(),
            allowed_tools: vec!["workspace.read".to_owned(), "artifact.write".to_owned()],
            approval_required_tools: vec!["shell.exec".to_owned()],
            denied_tools: vec!["network.egress".to_owned()],
        }
    }

    pub fn new_for_test(id: &str, workspace_id: &str, name: &str) -> Self {
        Self::new_default(id, workspace_id, name)
    }
}
