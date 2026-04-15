use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CapabilityRef {
    pub ref_id: String,
    pub kind: CapabilityKind,
    pub config: Option<serde_json::Value>,
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum CapabilityKind {
    Routine,
    Tool,
    Validator,
    Model,
}
