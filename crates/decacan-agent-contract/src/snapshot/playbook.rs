use serde::{Deserialize, Serialize};

use super::workflow::CompiledWorkflow;
use super::CapabilityRef;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlaybookSnapshot {
    pub playbook_handle_id: String,
    pub version_id: String,
    pub workflow: CompiledWorkflow,
    pub capability_refs: Vec<CapabilityRef>,
    pub execution_profile: ExecutionProfile,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionProfile {
    pub mode: String,
    pub timeout_seconds: u64,
    pub max_retries: u32,
}
