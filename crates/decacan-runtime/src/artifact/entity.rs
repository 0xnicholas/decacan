use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use uuid::Uuid;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ArtifactKind {
    Primary,
    Derived,
    Attachment,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ArtifactStatus {
    Pending,
    Ready,
    Archived,
    Failed,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ArtifactType {
    Summary,
    Report,
    Log,
    Dataset,
    Binary,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Artifact {
    pub id: String,
    pub task_id: String,
    pub path: String,
    pub kind: ArtifactKind,
    pub status: ArtifactStatus,
    pub r#type: ArtifactType,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
    pub content_id: Uuid,
}

impl Artifact {
    pub fn new_primary_for_test(
        id: &str,
        task_id: &str,
        path: &str,
        artifact_type: ArtifactType,
    ) -> Self {
        let now = OffsetDateTime::now_utc();
        Self {
            id: id.to_owned(),
            task_id: task_id.to_owned(),
            path: path.to_owned(),
            kind: ArtifactKind::Primary,
            status: ArtifactStatus::Ready,
            r#type: artifact_type,
            created_at: now,
            updated_at: now,
            content_id: Uuid::new_v4(),
        }
    }
}
