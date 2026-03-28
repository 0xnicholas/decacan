use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ArtifactRelationKind {
    BackupOf,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ArtifactRelation {
    pub id: String,
    pub from_artifact_id: String,
    pub to_artifact_id: String,
    pub kind: ArtifactRelationKind,
}

pub fn artifact_relation_storage_key(relation: &ArtifactRelation) -> String {
    format!("artifact_relation/{}", relation.id)
}
