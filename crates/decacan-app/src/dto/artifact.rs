use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ArtifactDto {
    pub id: String,
    pub task_id: String,
    pub label: String,
    pub canonical_path: String,
    pub status: String,
}
