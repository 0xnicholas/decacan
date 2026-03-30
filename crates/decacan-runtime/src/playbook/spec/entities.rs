use serde::{Deserialize, Serialize};
use std::collections::HashMap;

/// Playbook 完整规范
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PlaybookSpec {
    pub metadata: PlaybookMetadata,
    pub input_schema: InputSchema,
    pub workflow: WorkflowDefinition,
    pub capability_refs: CapabilityRefs,
    pub output_contract: OutputContract,
    pub policy_profile: Option<PolicyProfile>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PlaybookMetadata {
    pub title: String,
    pub description: String,
    pub mode: PlaybookMode,
    pub version: String,
    pub tags: Vec<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PlaybookMode {
    Standard,
    Autonomous,
    Mixed,
}

impl Default for PlaybookMode {
    fn default() -> Self {
        PlaybookMode::Standard
    }
}

pub type InputSchema = Vec<InputField>;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct InputField {
    pub name: String,
    #[serde(rename = "type")]
    pub field_type: InputFieldType,
    #[serde(default)]
    pub required: bool,
    #[serde(default)]
    pub description: String,
    pub default: Option<String>,
    pub options: Option<Vec<String>>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum InputFieldType {
    String,
    Path,
    Enum,
    Boolean,
    Integer,
    Number,
    Array,
    Object,
}

impl Default for InputFieldType {
    fn default() -> Self {
        InputFieldType::String
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkflowDefinition {
    pub steps: Vec<StepDefinition>,
    pub default_retry_policy: Option<RetryPolicy>,
    pub error_handling: Option<ErrorHandlingStrategy>,
}

impl Default for WorkflowDefinition {
    fn default() -> Self {
        Self {
            steps: Vec::new(),
            default_retry_policy: None,
            error_handling: None,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct StepDefinition {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub description: String,
    pub routine: RoutineRef,
    #[serde(default)]
    pub input_mapping: InputMapping,
    #[serde(default)]
    pub output_mapping: OutputMapping,
    pub retry_policy: Option<RetryPolicy>,
    pub timeout_seconds: Option<u32>,
    pub transition: Transition,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RoutineRef {
    #[serde(rename = "class")]
    pub capability_class: String,
    pub name: String,
    #[serde(default)]
    pub version: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum Transition {
    Next { step_id: String },
    Conditional { branches: Vec<ConditionalBranch> },
    End,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ConditionalBranch {
    pub condition: String,
    pub step_id: String,
}

pub type InputMapping = HashMap<String, String>;
pub type OutputMapping = HashMap<String, String>;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct RetryPolicy {
    pub max_attempts: u32,
    pub backoff_strategy: BackoffStrategy,
    pub initial_delay_ms: u32,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BackoffStrategy {
    Fixed,
    Linear,
    Exponential,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ErrorHandlingStrategy {
    pub on_error: ErrorAction,
    pub retry_on: Option<Vec<String>>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ErrorAction {
    Fail,
    Skip,
    Retry,
    Continue,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CapabilityRefs {
    #[serde(default)]
    pub routines: Vec<String>,
    #[serde(default)]
    pub tools: Vec<String>,
}

impl Default for CapabilityRefs {
    fn default() -> Self {
        Self {
            routines: Vec::new(),
            tools: Vec::new(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct OutputContract {
    pub primary_artifact: Option<ArtifactContract>,
    pub secondary_artifacts: Option<Vec<ArtifactContract>>,
    pub backup_policy: BackupPolicy,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ArtifactContract {
    #[serde(rename = "type")]
    pub artifact_type: String,
    pub path: String,
    pub schema: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum BackupPolicy {
    None,
    Single,
    Versioned,
}

impl Default for BackupPolicy {
    fn default() -> Self {
        BackupPolicy::None
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PolicyProfile {
    pub name: String,
    pub description: Option<String>,
    pub allowed_tools: Option<Vec<String>>,
    pub denied_tools: Option<Vec<String>>,
    pub approval_required_tools: Option<Vec<String>>,
}
