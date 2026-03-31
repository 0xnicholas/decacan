use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use uuid::Uuid;

use super::step::{CompiledWorkflowStep, WorkflowStep};

/// A compiled workflow ready for execution (legacy format)
///
/// This represents the compiled form of a PlaybookSpec's workflow definition.
/// It is independent of the original playbook and can be executed directly.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Workflow {
    pub id: String,
    pub steps: Vec<WorkflowStep>,
    pub compiled_at: OffsetDateTime,
    pub version_id: Uuid,
}

/// A compiled workflow ready for execution (new trait-based system)
///
/// This represents the compiled form of a PlaybookSpec's workflow definition
/// using the new routine trait system.
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CompiledWorkflow {
    pub id: String,
    pub steps: Vec<CompiledWorkflowStep>,
    pub compiled_at: OffsetDateTime,
}

impl Workflow {
    /// Create a new workflow with the current timestamp
    pub fn new(id: impl Into<String>, steps: Vec<WorkflowStep>) -> Self {
        Self {
            id: id.into(),
            steps,
            compiled_at: OffsetDateTime::now_utc(),
            version_id: Uuid::new_v4(),
        }
    }

    /// Get a step by its ID
    pub fn get_step(&self, step_id: &str) -> Option<&WorkflowStep> {
        self.steps.iter().find(|s| s.id == step_id)
    }

    /// Get the first step
    pub fn first_step(&self) -> Option<&WorkflowStep> {
        self.steps.first()
    }

    /// Get the total number of steps
    pub fn step_count(&self) -> usize {
        self.steps.len()
    }

    /// Create a test workflow
    pub fn new_for_test(id: &str, steps: Vec<WorkflowStep>) -> Self {
        Self::new(id, steps)
    }
}

impl CompiledWorkflow {
    /// Create a new compiled workflow with the current timestamp
    pub fn new(id: impl Into<String>, steps: Vec<CompiledWorkflowStep>) -> Self {
        Self {
            id: id.into(),
            steps,
            compiled_at: OffsetDateTime::now_utc(),
        }
    }

    /// Get a step by its ID
    pub fn get_step(&self, step_id: &str) -> Option<&CompiledWorkflowStep> {
        self.steps.iter().find(|s| s.id == step_id)
    }

    /// Get the first step
    pub fn first_step(&self) -> Option<&CompiledWorkflowStep> {
        self.steps.first()
    }

    /// Get the total number of steps
    pub fn step_count(&self) -> usize {
        self.steps.len()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::routine::r#trait::RoutineType;
    use crate::workflow::step::{CompiledTransition, CompiledWorkflowStep};
    use std::collections::HashMap;

    fn create_test_step(id: &str, transition: CompiledTransition) -> CompiledWorkflowStep {
        CompiledWorkflowStep {
            id: id.to_string(),
            name: format!("Step {}", id),
            description: format!("Description for {}", id),
            routine_type: RoutineType::new("builtin", "noop", "1.0.0"),
            input_mapping: HashMap::new(),
            output_mapping: HashMap::new(),
            transition,
            retry_policy: None,
            timeout_seconds: None,
        }
    }

    #[test]
    fn test_compiled_workflow_creation() {
        let steps = vec![create_test_step("step1", CompiledTransition::End)];
        let workflow = CompiledWorkflow::new("test-workflow", steps);

        assert_eq!(workflow.id, "test-workflow");
        assert_eq!(workflow.step_count(), 1);
        assert!(workflow.compiled_at > time::OffsetDateTime::UNIX_EPOCH);
    }

    #[test]
    fn test_compiled_get_step() {
        let steps = vec![
            create_test_step("step1", CompiledTransition::Next("step2".to_string())),
            create_test_step("step2", CompiledTransition::End),
        ];
        let workflow = CompiledWorkflow::new("test", steps);

        assert!(workflow.get_step("step1").is_some());
        assert!(workflow.get_step("step2").is_some());
        assert!(workflow.get_step("nonexistent").is_none());
    }

    #[test]
    fn test_compiled_first_step() {
        let steps = vec![
            create_test_step("first", CompiledTransition::End),
            create_test_step("second", CompiledTransition::End),
        ];
        let workflow = CompiledWorkflow::new("test", steps);

        let first = workflow.first_step();
        assert!(first.is_some());
        assert_eq!(first.unwrap().id, "first");
    }

    #[test]
    fn test_compiled_empty_workflow() {
        let workflow = CompiledWorkflow::new("empty", vec![]);
        assert_eq!(workflow.step_count(), 0);
        assert!(workflow.first_step().is_none());
    }
}
