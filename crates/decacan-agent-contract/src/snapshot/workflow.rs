use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CompiledWorkflow {
    pub steps: Vec<WorkflowStepDef>,
    pub entry_points: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct WorkflowStepDef {
    pub step_id: String,
    pub capability_ref: String,
    pub inputs: HashMap<String, String>,
    pub policy_tags: Vec<String>,
    pub dependencies: Vec<String>,
}
