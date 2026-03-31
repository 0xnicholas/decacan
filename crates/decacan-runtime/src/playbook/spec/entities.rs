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

/// The kind of step reference - determines how the step is resolved
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "type", rename_all = "snake_case")]
pub enum StepKind {
    /// Direct routine reference (backward compatible)
    Routine {
        #[serde(flatten)]
        reference: RoutineRef,
    },
    /// Tool reference for external API calls
    Tool {
        name: String,
        #[serde(default)]
        version: String,
    },
    /// Capability-based reference (Phase 2)
    Capability {
        id: String,
        #[serde(default)]
        preferred_implementation: Option<String>,
    },
}

impl StepKind {
    /// Create a routine step kind
    pub fn routine(class: impl Into<String>, name: impl Into<String>) -> Self {
        Self::Routine {
            reference: RoutineRef {
                capability_class: class.into(),
                name: name.into(),
                version: "1.0.0".to_string(),
            },
        }
    }

    /// Create a tool step kind
    pub fn tool(name: impl Into<String>) -> Self {
        Self::Tool {
            name: name.into(),
            version: "1.0.0".to_string(),
        }
    }

    /// Create a capability step kind
    pub fn capability(id: impl Into<String>) -> Self {
        Self::Capability {
            id: id.into(),
            preferred_implementation: None,
        }
    }

    /// Get the type name for logging/debugging
    pub fn type_name(&self) -> &'static str {
        match self {
            Self::Routine { .. } => "routine",
            Self::Tool { .. } => "tool",
            Self::Capability { .. } => "capability",
        }
    }
}

/// Step reference that determines what to execute
///
/// This enum provides flexibility for step definitions:
/// - Legacy: Direct routine reference (backward compatible)
/// - Modern: Capability-based resolution (Phase 2)
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(untagged)]
pub enum StepReference {
    /// Legacy format: just a routine reference (backward compatible)
    Legacy(RoutineRef),
    /// Modern format: explicit step kind
    Modern(StepKind),
}

impl StepReference {
    /// Get the step kind, normalizing legacy format to Routine variant
    pub fn kind(&self) -> StepKind {
        match self {
            Self::Legacy(routine_ref) => StepKind::Routine {
                reference: routine_ref.clone(),
            },
            Self::Modern(kind) => kind.clone(),
        }
    }

    /// Check if this is a capability-based reference
    pub fn is_capability(&self) -> bool {
        matches!(self.kind(), StepKind::Capability { .. })
    }
}

impl From<RoutineRef> for StepReference {
    fn from(routine_ref: RoutineRef) -> Self {
        Self::Legacy(routine_ref)
    }
}

impl From<StepKind> for StepReference {
    fn from(kind: StepKind) -> Self {
        Self::Modern(kind)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct StepDefinition {
    pub id: String,
    pub name: String,
    #[serde(default)]
    pub description: String,
    /// The step implementation reference
    ///
    /// Can be specified as:
    /// - Legacy format: `routine: { "class": "builtin", "name": "echo" }` (backward compatible)
    /// - Modern format: `implementation: { "type": "routine", "class": "builtin", "name": "echo" }`
    /// - Capability format: `implementation: { "type": "capability", "id": "filesystem.read" }`
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub implementation: Option<StepReference>,
    /// Legacy field - kept for backward compatibility
    ///
    /// If `implementation` is None, this field is used instead
    #[serde(default, skip_serializing_if = "Option::is_none")]
    pub routine: Option<RoutineRef>,
    #[serde(default)]
    pub input_mapping: InputMapping,
    #[serde(default)]
    pub output_mapping: OutputMapping,
    pub retry_policy: Option<RetryPolicy>,
    pub timeout_seconds: Option<u32>,
    pub transition: Transition,
}

impl StepDefinition {
    /// Get the effective step reference
    ///
    /// Returns the implementation reference if set, otherwise falls back to the legacy routine field
    pub fn get_reference(&self) -> Option<StepReference> {
        self.implementation
            .clone()
            .or_else(|| self.routine.clone().map(StepReference::Legacy))
    }

    /// Get the step kind, normalizing all formats
    pub fn kind(&self) -> Option<StepKind> {
        self.get_reference().map(|r| r.kind())
    }

    /// Check if this step uses capability-based resolution
    pub fn uses_capability(&self) -> bool {
        self.get_reference()
            .map(|r| r.is_capability())
            .unwrap_or(false)
    }

    /// Create a new step with a routine reference (backward compatible)
    pub fn with_routine(
        id: impl Into<String>,
        name: impl Into<String>,
        routine: RoutineRef,
        transition: Transition,
    ) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            description: String::new(),
            implementation: None,
            routine: Some(routine),
            input_mapping: InputMapping::new(),
            output_mapping: OutputMapping::new(),
            retry_policy: None,
            timeout_seconds: None,
            transition,
        }
    }

    /// Create a new step with a capability reference
    pub fn with_capability(
        id: impl Into<String>,
        name: impl Into<String>,
        capability_id: impl Into<String>,
        transition: Transition,
    ) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            description: String::new(),
            implementation: Some(StepReference::Modern(StepKind::capability(capability_id))),
            routine: None,
            input_mapping: InputMapping::new(),
            output_mapping: OutputMapping::new(),
            retry_policy: None,
            timeout_seconds: None,
            transition,
        }
    }

    /// Create a new step with a tool reference
    pub fn with_tool(
        id: impl Into<String>,
        name: impl Into<String>,
        tool_name: impl Into<String>,
        transition: Transition,
    ) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            description: String::new(),
            implementation: Some(StepReference::Modern(StepKind::tool(tool_name))),
            routine: None,
            input_mapping: InputMapping::new(),
            output_mapping: OutputMapping::new(),
            retry_policy: None,
            timeout_seconds: None,
            transition,
        }
    }

    /// Set the description
    pub fn with_description(mut self, description: impl Into<String>) -> Self {
        self.description = description.into();
        self
    }

    /// Set input mapping
    pub fn with_input_mapping(mut self, mapping: InputMapping) -> Self {
        self.input_mapping = mapping;
        self
    }

    /// Set output mapping
    pub fn with_output_mapping(mut self, mapping: OutputMapping) -> Self {
        self.output_mapping = mapping;
        self
    }
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
pub struct FallbackStrategy {
    pub action: FallbackAction,
    pub default_value: Option<serde_json::Value>,
    pub alternate_step_id: Option<String>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum FallbackAction {
    Skip,
    UseDefault,
    ExecuteAlternate,
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

impl Default for PolicyProfile {
    fn default() -> Self {
        Self {
            name: String::new(),
            description: None,
            allowed_tools: None,
            denied_tools: None,
            approval_required_tools: None,
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_step_kind_routine() {
        let kind = StepKind::routine("builtin", "echo");
        match &kind {
            StepKind::Routine { reference } => {
                assert_eq!(reference.capability_class, "builtin");
                assert_eq!(reference.name, "echo");
                assert_eq!(reference.version, "1.0.0");
            }
            _ => panic!("Expected Routine variant"),
        }
        assert_eq!(kind.type_name(), "routine");
    }

    #[test]
    fn test_step_kind_tool() {
        let kind = StepKind::tool("http_api");
        match &kind {
            StepKind::Tool { name, version } => {
                assert_eq!(name, "http_api");
                assert_eq!(version, "1.0.0");
            }
            _ => panic!("Expected Tool variant"),
        }
        assert_eq!(kind.type_name(), "tool");
    }

    #[test]
    fn test_step_kind_capability() {
        let kind = StepKind::capability("filesystem.read");
        match &kind {
            StepKind::Capability {
                id,
                preferred_implementation,
            } => {
                assert_eq!(id, "filesystem.read");
                assert!(preferred_implementation.is_none());
            }
            _ => panic!("Expected Capability variant"),
        }
        assert_eq!(kind.type_name(), "capability");
    }

    #[test]
    fn test_step_reference_from_routine_ref() {
        let routine_ref = RoutineRef {
            capability_class: "builtin".to_string(),
            name: "echo".to_string(),
            version: "1.0.0".to_string(),
        };
        let reference: StepReference = routine_ref.into();
        assert!(!reference.is_capability());
        match reference.kind() {
            StepKind::Routine { reference: r } => {
                assert_eq!(r.name, "echo");
            }
            _ => panic!("Expected Routine"),
        }
    }

    #[test]
    fn test_step_reference_from_step_kind() {
        let kind = StepKind::capability("filesystem.read");
        let reference: StepReference = kind.into();
        assert!(reference.is_capability());
        match reference.kind() {
            StepKind::Capability { id, .. } => {
                assert_eq!(id, "filesystem.read");
            }
            _ => panic!("Expected Capability"),
        }
    }

    #[test]
    fn test_step_definition_with_routine() {
        let step = StepDefinition::with_routine(
            "step1",
            "Test Step",
            RoutineRef {
                capability_class: "builtin".to_string(),
                name: "echo".to_string(),
                version: "1.0.0".to_string(),
            },
            Transition::End,
        );

        assert_eq!(step.id, "step1");
        assert_eq!(step.name, "Test Step");
        assert!(!step.uses_capability());

        let reference = step.get_reference().unwrap();
        match reference.kind() {
            StepKind::Routine { reference: r } => {
                assert_eq!(r.name, "echo");
            }
            _ => panic!("Expected Routine"),
        }
    }

    #[test]
    fn test_step_definition_with_capability() {
        let step = StepDefinition::with_capability(
            "step1",
            "Test Step",
            "filesystem.read",
            Transition::End,
        );

        assert_eq!(step.id, "step1");
        assert!(step.uses_capability());

        let reference = step.get_reference().unwrap();
        match reference.kind() {
            StepKind::Capability { id, .. } => {
                assert_eq!(id, "filesystem.read");
            }
            _ => panic!("Expected Capability"),
        }
    }

    #[test]
    fn test_step_definition_with_tool() {
        let step = StepDefinition::with_tool("step1", "Test Step", "http_api", Transition::End);

        assert_eq!(step.id, "step1");
        assert!(!step.uses_capability());

        let reference = step.get_reference().unwrap();
        match reference.kind() {
            StepKind::Tool { name, .. } => {
                assert_eq!(name, "http_api");
            }
            _ => panic!("Expected Tool"),
        }
    }

    #[test]
    fn test_step_definition_builder_methods() {
        let step = StepDefinition::with_routine(
            "step1",
            "Test",
            RoutineRef {
                capability_class: "builtin".to_string(),
                name: "echo".to_string(),
                version: "1.0.0".to_string(),
            },
            Transition::End,
        )
        .with_description("A test step")
        .with_input_mapping({
            let mut map = InputMapping::new();
            map.insert("key".to_string(), "value".to_string());
            map
        });

        assert_eq!(step.description, "A test step");
        assert_eq!(step.input_mapping.get("key"), Some(&"value".to_string()));
    }

    #[test]
    fn test_serde_backward_compatibility() {
        // Test that old format (routine field) still deserializes
        let json = r#"{
            "id": "step1",
            "name": "Test",
            "routine": {
                "class": "builtin",
                "name": "echo",
                "version": "1.0.0"
            },
            "transition": { "type": "end" }
        }"#;

        let step: StepDefinition = serde_json::from_str(json).unwrap();
        assert_eq!(step.id, "step1");
        assert!(step.routine.is_some());
        assert!(step.implementation.is_none());

        let reference = step.get_reference().unwrap();
        match reference.kind() {
            StepKind::Routine { reference: r } => {
                assert_eq!(r.name, "echo");
            }
            _ => panic!("Expected Routine"),
        }
    }

    #[test]
    fn test_serde_modern_format() {
        // Test new format (implementation field)
        let json = r#"{
            "id": "step1",
            "name": "Test",
            "implementation": {
                "type": "capability",
                "id": "filesystem.read"
            },
            "transition": { "type": "end" }
        }"#;

        let step: StepDefinition = serde_json::from_str(json).unwrap();
        assert_eq!(step.id, "step1");
        assert!(step.implementation.is_some());
        assert!(step.routine.is_none());
        assert!(step.uses_capability());
    }
}
