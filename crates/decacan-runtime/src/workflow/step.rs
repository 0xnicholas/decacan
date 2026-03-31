use crate::team::entity::TeamSpecId;
use serde::{Deserialize, Serialize};

/// Legacy workflow step type - used by existing code
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkflowStepType {
    Deterministic,
    Tool,
    Routine,
    Psi,
    Approval,
    Branch,
}

/// Extended workflow step type with team execution support
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ExtendedWorkflowStepType {
    Deterministic,
    Tool,
    Routine,
    Psi,
    Approval,
    Branch,
    ParallelRoleGroup(ParallelRoleGroupConfig),
    Merge(MergeConfig),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParallelRoleGroupConfig {
    team_spec_id: TeamSpecId,
    completion_mode: CompletionMode,
}

impl ParallelRoleGroupConfig {
    pub fn new(team_spec_id: TeamSpecId) -> Self {
        Self {
            team_spec_id,
            completion_mode: CompletionMode::AllRequired,
        }
    }

    pub fn team_spec_id(&self) -> &TeamSpecId {
        &self.team_spec_id
    }

    pub fn completion_mode(&self) -> &CompletionMode {
        &self.completion_mode
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum CompletionMode {
    AllRequired, // MVP only supports this
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MergeConfig {
    strategy: MergeStrategy,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum MergeStrategy {
    Concatenate, // Default for MVP
}

/// Legacy workflow step - used by existing code
///
/// This is the original step structure used by the old compiler
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct LegacyWorkflowStep {
    pub id: String,
    pub name: String,
    pub r#type: WorkflowStepType,
    pub purpose: String,
    pub input_contract: String,
    pub output_contract: String,
    pub execution_profile: String,
    pub transition: Option<String>,
}

impl LegacyWorkflowStep {
    pub fn new(
        id: impl Into<String>,
        name: impl Into<String>,
        step_type: WorkflowStepType,
        purpose: impl Into<String>,
        transition: Option<String>,
    ) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            r#type: step_type,
            purpose: purpose.into(),
            input_contract: "input.contract".to_owned(),
            output_contract: "output.contract".to_owned(),
            execution_profile: "default".to_owned(),
            transition,
        }
    }

    pub fn new_for_test(
        id: &str,
        name: &str,
        step_type: WorkflowStepType,
        purpose: &str,
        transition: Option<&str>,
    ) -> Self {
        Self::new(id, name, step_type, purpose, transition.map(str::to_owned))
    }
}

// Re-export LegacyWorkflowStep as WorkflowStep for backward compatibility
pub use LegacyWorkflowStep as WorkflowStep;

use std::collections::HashMap;

use crate::playbook::spec::entities::{
    ConditionalBranch, ErrorHandlingStrategy, FallbackStrategy, RetryPolicy,
};
use crate::routine::r#trait::RoutineType;

/// Compiled transition for workflow execution
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum CompiledTransition {
    Next(String),
    Conditional(Vec<CompiledBranch>),
    End,
}

/// A compiled branch for conditional transitions
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CompiledBranch {
    pub condition: String,
    pub step_id: String,
}

impl From<&ConditionalBranch> for CompiledBranch {
    fn from(branch: &ConditionalBranch) -> Self {
        Self {
            condition: branch.condition.clone(),
            step_id: branch.step_id.clone(),
        }
    }
}

/// A compiled workflow step ready for execution (new trait-based system)
///
/// This is used by the new WorkflowCompiler and is separate from LegacyWorkflowStep
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CompiledWorkflowStep {
    pub id: String,
    pub name: String,
    pub description: String,
    pub routine_type: RoutineType,
    pub input_mapping: HashMap<String, String>,
    pub output_mapping: HashMap<String, String>,
    pub transition: CompiledTransition,
    pub retry_policy: Option<RetryPolicy>,
    pub timeout_seconds: Option<u32>,
    pub error_handling: Option<ErrorHandlingStrategy>,
    pub fallback: Option<FallbackStrategy>,
}

impl CompiledWorkflowStep {
    /// Get the next step ID based on the transition
    pub fn next_step_id(&self, _context: &serde_json::Value) -> Option<String> {
        match &self.transition {
            CompiledTransition::Next(step_id) => Some(step_id.clone()),
            CompiledTransition::Conditional(_) => {
                // For now, return the first branch
                // In the future, this should evaluate the condition
                None
            }
            CompiledTransition::End => None,
        }
    }

    /// Check if this is the last step
    pub fn is_terminal(&self) -> bool {
        matches!(self.transition, CompiledTransition::End)
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_legacy_workflow_step() {
        let step = WorkflowStep::new(
            "step1",
            "Step 1",
            WorkflowStepType::Deterministic,
            "Test purpose",
            Some("step2".to_string()),
        );

        assert_eq!(step.id, "step1");
        assert_eq!(step.transition, Some("step2".to_string()));
    }

    #[test]
    fn test_compiled_step_next_id() {
        let step = CompiledWorkflowStep {
            id: "step1".to_string(),
            name: "Step 1".to_string(),
            description: "First step".to_string(),
            routine_type: RoutineType::new("builtin", "noop", "1.0.0"),
            input_mapping: HashMap::new(),
            output_mapping: HashMap::new(),
            transition: CompiledTransition::Next("step2".to_string()),
            retry_policy: None,
            timeout_seconds: None,
            error_handling: None,
            fallback: None,
        };

        assert_eq!(
            step.next_step_id(&serde_json::json!({})),
            Some("step2".to_string())
        );
    }

    #[test]
    fn test_compiled_step_is_terminal() {
        let step = CompiledWorkflowStep {
            id: "last".to_string(),
            name: "Last Step".to_string(),
            description: "Final step".to_string(),
            routine_type: RoutineType::new("builtin", "noop", "1.0.0"),
            input_mapping: HashMap::new(),
            output_mapping: HashMap::new(),
            transition: CompiledTransition::End,
            retry_policy: None,
            timeout_seconds: None,
            error_handling: None,
            fallback: None,
        };

        assert!(step.is_terminal());
    }
}
