use std::path::Path;

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
    pub fn new_primary_for_test(id: &str, task_id: &str, path: &str) -> Self {
        let now = OffsetDateTime::now_utc();
        Self {
            id: id.to_owned(),
            task_id: task_id.to_owned(),
            path: path.to_owned(),
            kind: ArtifactKind::Primary,
            status: ArtifactStatus::Ready,
            r#type: ArtifactType::from_path(path),
            created_at: now,
            updated_at: now,
            content_id: Uuid::new_v4(),
        }
    }
}

impl ArtifactType {
    fn from_path(path: &str) -> Self {
        let path_ref = Path::new(path);
        let file_name = path_ref
            .file_name()
            .and_then(|value| value.to_str())
            .unwrap_or_default()
            .to_ascii_lowercase();

        if file_name.contains("summary") {
            Self::Summary
        } else if file_name.contains("report") {
            Self::Report
        } else if file_name.ends_with(".log") {
            Self::Log
        } else if file_name.ends_with(".json") || file_name.ends_with(".csv") {
            Self::Dataset
        } else {
            Self::Binary
        }
    }
}
