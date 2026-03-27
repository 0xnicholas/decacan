use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ModelContext {
    pub task_id: String,
    pub run_id: String,
    pub source_material: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct OutputCandidate {
    pub artifact_id: String,
    pub logical_name: String,
    pub canonical_path: String,
    pub physical_path: String,
    pub content: String,
}

pub trait SemanticModel {
    type Error;

    fn produce_output_candidate(
        &self,
        context: &ModelContext,
    ) -> Result<OutputCandidate, Self::Error>;
}
