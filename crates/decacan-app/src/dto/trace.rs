use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskTraceResponse {
    pub task_id: String,
    pub playbook_version_id: String,
    pub workspace_id: String,
    pub status: String,
    pub steps: Vec<StepTraceDto>,
    pub total_duration_ms: u64,
    pub step_count: u32,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepTraceDto {
    pub step_id: String,
    pub step_name: String,
    pub sequence: u32,
    pub status: String,
    pub duration_ms: Option<u64>,
    pub error: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AttributionResponse {
    pub task_id: String,
    pub failure_category: String,
    pub root_cause: String,
    pub suggested_fix: String,
    pub attribution_target: AttributionTargetDto,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum AttributionTargetDto {
    DraftCapabilityRef { ref_name: String, location: String },
    DraftWorkflowStep { step_index: u32, field: String },
    DraftInputSchema { field_name: String },
    DraftOutputContract { contract_type: String },
    DraftPolicyProfile { policy_name: String },
    KnowledgeCard { card_id: String, dimension: String },
    RuntimeEnvironment,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionStatsResponse {
    pub playbook_version_id: String,
    pub version_number: u32,
    pub total_executions: u32,
    pub success_count: u32,
    pub failure_count: u32,
    pub success_rate: f64,
    pub avg_duration_ms: u64,
    pub min_duration_ms: u64,
    pub max_duration_ms: u64,
    pub failure_breakdown: HashMap<String, u32>,
    pub period_start: String,
    pub period_end: String,
}
