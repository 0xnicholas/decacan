use std::fmt::Debug;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ModelContext {
    pub source_material: String,
    pub source_path: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct OutputCandidate {
    pub artifact_id: String,
    pub logical_name: String,
    pub canonical_path: String,
    pub physical_path: String,
    pub content: String,
}

pub trait SynthesisModel {
    type Error: Debug;

    fn produce_output_candidate(
        &self,
        context: &ModelContext,
    ) -> Result<OutputCandidate, Self::Error>;
}
