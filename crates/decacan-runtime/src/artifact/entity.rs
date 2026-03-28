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
    Discovery,
    Report,
    Log,
    Dataset,
    Binary,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Artifact {
    pub id: String,
    pub task_id: String,
    pub label: String,
    pub logical_name: String,
    pub canonical_path: String,
    pub physical_path: String,
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
        label: &str,
        logical_name: &str,
        canonical_path: &str,
        physical_path: &str,
        artifact_type: ArtifactType,
    ) -> Self {
        let now = OffsetDateTime::now_utc();
        Self {
            id: id.to_owned(),
            task_id: task_id.to_owned(),
            label: label.to_owned(),
            logical_name: logical_name.to_owned(),
            canonical_path: canonical_path.to_owned(),
            physical_path: physical_path.to_owned(),
            kind: ArtifactKind::Primary,
            status: ArtifactStatus::Ready,
            r#type: artifact_type,
            created_at: now,
            updated_at: now,
            content_id: Uuid::new_v4(),
        }
    }
}
