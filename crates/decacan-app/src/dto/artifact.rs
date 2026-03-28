use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ArtifactDto {
    pub id: String,
    pub task_id: String,
    pub label: String,
    pub canonical_path: String,
    pub status: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ArtifactContentDto {
    pub artifact_id: String,
    pub content_type: String,
    pub content: String,
}
