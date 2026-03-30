use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use time::OffsetDateTime;
use uuid::Uuid;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepTrace {
    pub step_id: String,
    pub step_name: String,
    pub sequence: u32,
    pub input_snapshot: Value,
    pub output_snapshot: Value,
    pub started_at: OffsetDateTime,
    pub completed_at: Option<OffsetDateTime>,
    pub duration_ms: Option<u64>,
    pub retry_count: u32,
    pub resources_used: ResourceMetrics,
    pub status: StepStatus,
    pub error: Option<StepError>,
    pub invoked_cards: Vec<CardInvocation>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskExecutionTrace {
    pub task_id: String,
    pub playbook_version_id: Uuid,
    pub workspace_id: String,
    pub steps: Vec<StepTrace>,
    pub overall_status: TaskStatus,
    pub total_duration_ms: u64,
    pub step_count: u32,
    pub failed_step_index: Option<u32>,
    pub created_at: OffsetDateTime,
    pub completed_at: Option<OffsetDateTime>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum StepStatus {
    Running,
    Success,
    Failed,
    Skipped,
    Timeout,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "status")]
pub enum TaskStatus {
    Succeeded,
    Running,
    Paused,
    Failed { category: FailureCategory },
    Cancelled,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ResourceMetrics {
    pub files_processed: u32,
    pub tokens_consumed: u32,
    pub memory_peak_mb: u32,
}

impl Default for ResourceMetrics {
    fn default() -> Self {
        Self {
            files_processed: 0,
            tokens_consumed: 0,
            memory_peak_mb: 0,
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepError {
    pub error_type: String,
    pub message: String,
    pub stack_trace: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CardInvocation {
    pub card_id: String,
    pub invoked_at: OffsetDateTime,
    pub trigger_reason: String,
    pub details: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "category", rename_all = "snake_case")]
pub enum FailureCategory {
    Runtime(RuntimeError),
    Contract(ContractViolation),
    Quality(QualityIssue),
    Policy(PolicyViolation),
    PartialCompletion(PartialFailure),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RuntimeError {
    pub error_type: String,
    pub capability_ref: Option<String>,
    pub message: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ContractViolation {
    pub field: String,
    pub expected: String,
    pub actual: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct QualityIssue {
    pub dimension: String,
    pub score: f64,
    pub threshold: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PolicyViolation {
    pub policy_type: String,
    pub violation_detail: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PartialFailure {
    pub completed_steps: Vec<String>,
    pub failed_step: String,
    pub partial_output: Option<Value>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "snake_case", tag = "type")]
pub enum AttributionTarget {
    DraftCapabilityRef { ref_name: String, location: String },
    DraftWorkflowStep { step_index: u32, field: String },
    DraftInputSchema { field_name: String },
    DraftOutputContract { contract_type: String },
    DraftPolicyProfile { policy_name: String },
    KnowledgeCard { card_id: String, dimension: String },
    RuntimeEnvironment,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct FailureAttribution {
    pub task_id: String,
    pub failed_step_id: String,
    pub failure_category: FailureCategory,
    pub attribution: AttributionTarget,
    pub root_cause: String,
    pub suggested_fix: String,
    pub relevant_card_refs: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionExecutionStats {
    pub playbook_version_id: Uuid,
    pub version_number: u32,
    pub total_executions: u32,
    pub success_count: u32,
    pub failure_count: u32,
    pub success_rate: f64,
    pub avg_duration_ms: u64,
    pub min_duration_ms: u64,
    pub max_duration_ms: u64,
    pub failure_breakdown: HashMap<String, u32>,
    pub step_stats: Vec<StepStats>,
    pub period_start: OffsetDateTime,
    pub period_end: OffsetDateTime,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct StepStats {
    pub step_id: String,
    pub total_count: u32,
    pub success_count: u32,
    pub avg_duration_ms: u64,
}
