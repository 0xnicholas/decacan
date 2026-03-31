//! Workflow execution engine
//!
//! This module provides the [`WorkflowExecutor`] for running compiled workflows
//! using the Routine trait system. It supports:
//!
//! - Contract validation (strict/lenient modes)
//! - Retry policies with configurable backoff
//! - Error handling strategies (Fail, Skip, Retry, Continue)
//! - Fallback mechanisms for graceful degradation
//! - Conditional transitions
//!
//! # Example
//!
//! ```rust,ignore
//! let executor = WorkflowExecutor::strict();
//! let result = executor.execute(
//!     &workflow,
//!     &registry,
//!     &filesystem,
//!     &storage,
//!     &clock,
//!     initial_input,
//! ).await?;
//! ```

use std::collections::HashMap;
use std::time::Duration;

use serde_json::Value;
use thiserror::Error;
use time::OffsetDateTime;
use tokio::time::timeout;

use crate::contract::{ContractValidator, ValidationMode};
use crate::playbook::spec::entities::{ErrorAction, FallbackAction, FallbackStrategy};
use crate::ports::clock::ClockPort;
use crate::ports::filesystem::FilesystemPort;
use crate::ports::storage::StoragePort;
use crate::routine::context::RoutineContext;
use crate::routine::error::RoutineError;
use crate::routine::r#trait::{Routine, RoutineRegistry, RoutineType};
use crate::workflow::entity::CompiledWorkflow;
use crate::workflow::step::{CompiledTransition, CompiledWorkflowStep};

/// Execution engine for running compiled workflows using the Routine trait
pub struct WorkflowExecutor {
    validation_mode: ValidationMode,
}

impl WorkflowExecutor {
    /// Create a new executor with the given validation mode
    pub fn new(validation_mode: ValidationMode) -> Self {
        Self { validation_mode }
    }

    /// Create a strict executor
    pub fn strict() -> Self {
        Self::new(ValidationMode::Strict)
    }

    /// Create a lenient executor
    pub fn lenient() -> Self {
        Self::new(ValidationMode::Lenient)
    }

    /// Execute a compiled workflow
    pub async fn execute<F, S, C>(
        &self,
        workflow: &CompiledWorkflow,
        registry: &RoutineRegistry,
        filesystem: &F,
        storage: &S,
        clock: &C,
        initial_input: Value,
    ) -> Result<ExecutionResult, ExecutionError>
    where
        F: FilesystemPort,
        F::Error: std::fmt::Debug,
        S: StoragePort,
        S::Error: std::fmt::Debug,
        C: ClockPort,
    {
        let validator = ContractValidator::new(self.validation_mode);
        let mut state = ExecutionState::new(workflow, initial_input);
        let mut step_outputs: HashMap<String, Value> = HashMap::new();

        while let Some(step_id) = &state.current_step_id {
            let step = workflow
                .get_step(step_id)
                .ok_or_else(|| ExecutionError::StepNotFound(step_id.clone()))?;

            // Get the routine from registry
            let routine = registry
                .get(&step.routine_type)
                .ok_or_else(|| ExecutionError::RoutineNotFound(step.routine_type.clone()))?;

            // Prepare input for this step
            let step_input = Self::prepare_step_input(step, &state.global_input, &step_outputs);

            // Validate input against contract using the validator
            if let Err(errors) = validator.validate_input(routine.input_contract(), &step_input) {
                return Err(ExecutionError::InputValidation {
                    step_id: step.id.clone(),
                    errors,
                });
            }

            // Execute the step with error handling and fallback
            match self
                .execute_step_with_retry(
                    routine.as_ref(),
                    step,
                    &mut state.context,
                    step_input,
                    filesystem,
                    storage,
                    clock,
                )
                .await
            {
                Ok(output) => {
                    // Store output
                    step_outputs.insert(step.id.clone(), output.clone());
                    state.step_history.push(StepExecution {
                        step_id: step.id.clone(),
                        output: output.clone(),
                        executed_at: clock.now_utc(),
                        success: true,
                    });

                    // Determine next step
                    state.current_step_id = Self::determine_next_step(step, &output)?;
                }
                Err(execution_error) => {
                    // Handle error based on error handling strategy
                    let error_action = step
                        .error_handling
                        .as_ref()
                        .map(|eh| eh.on_error)
                        .unwrap_or(ErrorAction::Fail);

                    match error_action {
                        ErrorAction::Fail => {
                            return Err(execution_error);
                        }
                        ErrorAction::Skip => {
                            // Skip this step and continue to next
                            state.step_history.push(StepExecution {
                                step_id: step.id.clone(),
                                output: serde_json::json!({"skipped": true}),
                                executed_at: clock.now_utc(),
                                success: false,
                            });
                            state.current_step_id = Self::determine_next_step(
                                step,
                                &serde_json::json!({"skipped": true}),
                            )?;
                        }
                        ErrorAction::Retry => {
                            // Retry is already handled in execute_step_with_retry
                            // If we reach here, retries have been exhausted
                            return Err(execution_error);
                        }
                        ErrorAction::Continue => {
                            // Apply fallback strategy
                            let fallback_output = self
                                .apply_fallback(step, execution_error, &step_outputs)?;

                            step_outputs.insert(step.id.clone(), fallback_output.clone());
                            state.step_history.push(StepExecution {
                                step_id: step.id.clone(),
                                output: fallback_output.clone(),
                                executed_at: clock.now_utc(),
                                success: false,
                            });

                            // Check if fallback is ExecuteAlternate with alternate_step_id
                            if let Some(ref alternate_id) = fallback_output
                                .get("alternate_step_id")
                                .and_then(|v| v.as_str())
                            {
                                // Jump to alternate step
                                state.current_step_id = Some(alternate_id.to_string());
                            } else {
                                state.current_step_id =
                                    Self::determine_next_step(step, &fallback_output)?;
                            }
                        }
                    }
                }
            }
        }

        // Workflow completed
        Ok(ExecutionResult {
            final_outputs: step_outputs,
            step_history: state.step_history,
            completed_at: clock.now_utc(),
        })
    }

    /// Execute a single step with retry logic and output validation
    async fn execute_step_with_retry<F, S, C>(
        &self,
        routine: &dyn Routine,
        step: &CompiledWorkflowStep,
        ctx: &mut RoutineContext,
        input: Value,
        _filesystem: &F,
        _storage: &S,
        _clock: &C,
    ) -> Result<Value, ExecutionError>
    where
        F: FilesystemPort,
        S: StoragePort,
        C: ClockPort,
    {
        let validator = ContractValidator::new(self.validation_mode);
        let max_attempts = step
            .retry_policy
            .as_ref()
            .map(|p| p.max_attempts)
            .unwrap_or(1);
        let timeout_secs = step.timeout_seconds.unwrap_or(300); // Default 5 minutes

        let mut last_error = None;

        for attempt in 1..=max_attempts {
            match timeout(
                Duration::from_secs(timeout_secs as u64),
                routine.execute(ctx, input.clone()),
            )
            .await
            {
                Ok(Ok(output)) => {
                    // Validate output against contract (always strict for output)
                    if let Err(errors) = validator.validate_output(routine.output_contract(), &output) {
                        return Err(ExecutionError::OutputValidation {
                            step_id: step.id.clone(),
                            errors,
                        });
                    }
                    return Ok(output);
                }
                Ok(Err(e)) => {
                    last_error = Some(e);
                    if attempt < max_attempts {
                        // Calculate backoff delay
                        let delay = Self::calculate_backoff(
                            attempt,
                            step.retry_policy.as_ref(),
                        );
                        tokio::time::sleep(delay).await;
                    }
                }
                Err(_) => {
                    return Err(ExecutionError::Timeout {
                        step_id: step.id.clone(),
                        timeout_secs,
                    });
                }
            }
        }

        Err(ExecutionError::RoutineExecution {
            step_id: step.id.clone(),
            error: last_error.unwrap_or_else(|| {
                RoutineError::Execution("All retry attempts failed".to_string())
            }),
        })
    }

    /// Calculate backoff delay based on retry policy
    fn calculate_backoff(attempt: u32, policy: Option<&crate::playbook::spec::entities::RetryPolicy>) -> Duration {
        let base_delay = policy
            .map(|p| p.initial_delay_ms)
            .unwrap_or(1000);

        match policy.map(|p| p.backoff_strategy) {
            Some(crate::playbook::spec::entities::BackoffStrategy::Fixed) => {
                Duration::from_millis(base_delay as u64)
            }
            Some(crate::playbook::spec::entities::BackoffStrategy::Linear) => {
                Duration::from_millis((base_delay * attempt) as u64)
            }
            Some(crate::playbook::spec::entities::BackoffStrategy::Exponential) => {
                Duration::from_millis((base_delay * 2u32.pow(attempt - 1)) as u64)
            }
            None => Duration::from_millis(1000),
        }
    }

    /// Apply fallback strategy when a step fails
    fn apply_fallback(
        &self,
        step: &CompiledWorkflowStep,
        error: ExecutionError,
        step_outputs: &HashMap<String, Value>,
    ) -> Result<Value, ExecutionError> {
        match &step.fallback {
            Some(fallback) => match fallback.action {
                FallbackAction::Skip => {
                    // Return empty success
                    Ok(serde_json::json!({"fallback": "skipped"}))
                }
                FallbackAction::UseDefault => {
                    // Return default value
                    Ok(fallback
                        .default_value
                        .clone()
                        .unwrap_or_else(|| serde_json::json!({"fallback": "default"})))
                }
                FallbackAction::ExecuteAlternate => {
                    // ExecuteAlternate transitions to an alternate step instead of the normal flow
                    // The alternate step will be executed in the next iteration
                    // We return a marker that signals the executor to jump to the alternate step
                    if let Some(ref alternate_id) = fallback.alternate_step_id {
                        Ok(serde_json::json!({
                            "fallback": "execute_alternate",
                            "alternate_step_id": alternate_id.clone(),
                            "original_error": error.to_string()
                        }))
                    } else {
                        Err(ExecutionError::FallbackNotImplemented {
                            step_id: step.id.clone(),
                            reason: "ExecuteAlternate requires alternate_step_id to be set".to_string(),
                        })
                    }
                }
            },
            None => Err(error),
        }
    }

    /// Prepare input for a step by applying input mappings
    fn prepare_step_input(
        step: &CompiledWorkflowStep,
        global_input: &Value,
        step_outputs: &HashMap<String, Value>,
    ) -> Value {
        let mut input = serde_json::json!({});

        // Start with the global input
        if let Some(obj) = global_input.as_object() {
            for (key, value) in obj {
                input[key] = value.clone();
            }
        }

        // Apply input mappings
        for (target_key, source_path) in &step.input_mapping {
            if let Some(value) = Self::resolve_value(source_path, global_input, step_outputs) {
                input[target_key] = value;
            }
        }

        input
    }

    /// Resolve a value from source path (supports "input.x" and "output.step_id.x" patterns)
    fn resolve_value(
        path: &str,
        global_input: &Value,
        step_outputs: &HashMap<String, Value>,
    ) -> Option<Value> {
        let parts: Vec<&str> = path.split('.').collect();

        if parts.is_empty() {
            return None;
        }

        match parts[0] {
            "input" if parts.len() > 1 => {
                // Navigate into global input
                Self::navigate_value(global_input, &parts[1..])
            }
            "output" if parts.len() > 2 => {
                // Get output from previous step
                let step_id = parts[1];
                step_outputs
                    .get(step_id)
                    .and_then(|output| Self::navigate_value(output, &parts[2..]))
            }
            _ => {
                // Try as a direct path in global input
                Self::navigate_value(global_input, &parts)
            }
        }
    }

    /// Navigate a value using path segments
    fn navigate_value(value: &Value, path: &[&str]) -> Option<Value> {
        let mut current = value;

        for segment in path {
            current = current.get(segment)?;
        }

        Some(current.clone())
    }

    /// Determine the next step based on transition and output
    fn determine_next_step(
        step: &CompiledWorkflowStep,
        output: &Value,
    ) -> Result<Option<String>, ExecutionError> {
        match &step.transition {
            CompiledTransition::Next(step_id) => Ok(Some(step_id.clone())),
            CompiledTransition::End => Ok(None),
            CompiledTransition::Conditional(branches) => {
                // Evaluate conditions and find matching branch
                for branch in branches {
                    if Self::evaluate_condition(&branch.condition, output) {
                        return Ok(Some(branch.step_id.clone()));
                    }
                }
                // No matching branch - this is an error
                Err(ExecutionError::NoMatchingBranch {
                    step_id: step.id.clone(),
                })
            }
        }
    }

    /// Evaluate a simple condition expression
    /// Supports: "output.field > value", "output.field == value", "output.field.length > 0"
    fn evaluate_condition(condition: &str, output: &Value) -> bool {
        // Simple condition evaluator for basic cases
        // In a production system, this would use a proper expression parser

        let condition = condition.trim();

        // Handle "output.xxx" prefix
        let condition = if condition.starts_with("output.") {
            &condition[7..] // Remove "output." prefix
        } else {
            condition
        };

        // Parse simple comparisons
        if let Some((field, op, value)) = Self::parse_comparison(condition) {
            let field_value = Self::get_field_value(output, field);
            return Self::compare_values(field_value, op, value);
        }

        // Default to true for unrecognized conditions
        // In production, this should be an error
        true
    }

    /// Parse a comparison expression like "field > 0" or "field == 'value'"
    fn parse_comparison(condition: &str) -> Option<(&str, &str, &str)> {
        let operators = [">=", "<=", "==", "!=", ">", "<"];

        for op in &operators {
            if let Some(pos) = condition.find(op) {
                let field = condition[..pos].trim();
                let value = condition[pos + op.len()..].trim();
                return Some((field, op, value));
            }
        }

        None
    }

    /// Get a field value from output (supports nested fields like "topics.length")
    fn get_field_value(output: &Value, field: &str) -> Option<Value> {
        let parts: Vec<&str> = field.split('.').collect();

        if parts.len() == 2 && parts[1] == "length" {
            // Handle array length: "topics.length"
            output.get(parts[0]).and_then(|v| {
                if let Some(arr) = v.as_array() {
                    Some(serde_json::json!(arr.len() as i64))
                } else {
                    None
                }
            })
        } else {
            // Simple field access
            Self::navigate_value(output, &parts)
        }
    }

    /// Compare two values
    fn compare_values(field_value: Option<Value>, op: &str, compare_value: &str) -> bool {
        let Some(field_val) = field_value else {
            return false;
        };

        // Try numeric comparison first
        if let (Some(field_num), Ok(compare_num)) = (
            field_val.as_f64(),
            compare_value.parse::<f64>(),
        ) {
            return match op {
                "==" => (field_num - compare_num).abs() < f64::EPSILON,
                "!=" => (field_num - compare_num).abs() >= f64::EPSILON,
                ">" => field_num > compare_num,
                "<" => field_num < compare_num,
                ">=" => field_num >= compare_num,
                "<=" => field_num <= compare_num,
                _ => false,
            };
        }

        // String comparison
        if let Some(field_str) = field_val.as_str() {
            // Remove quotes from compare_value
            let compare_str = compare_value
                .trim_start_matches('\'')
                .trim_end_matches('\'')
                .trim_start_matches('"')
                .trim_end_matches('"');
            return match op {
                "==" => field_str == compare_str,
                "!=" => field_str != compare_str,
                _ => false,
            };
        }

        false
    }
}

/// Execution state maintained during workflow execution
struct ExecutionState {
    current_step_id: Option<String>,
    global_input: Value,
    step_history: Vec<StepExecution>,
    context: RoutineContext,
}

impl ExecutionState {
    fn new(workflow: &CompiledWorkflow, initial_input: Value) -> Self {
        Self {
            current_step_id: workflow.first_step().map(|s| s.id.clone()),
            global_input: initial_input,
            step_history: Vec::new(),
            context: RoutineContext::new("/tmp", "initial", "run-1", "task-1"),
        }
    }
}

/// Record of a single step execution
#[derive(Debug, Clone)]
struct StepExecution {
    step_id: String,
    output: Value,
    executed_at: OffsetDateTime,
    success: bool,
}

/// Result of workflow execution
#[derive(Debug, Clone)]
pub struct ExecutionResult {
    pub final_outputs: HashMap<String, Value>,
    pub step_history: Vec<StepExecution>,
    pub completed_at: OffsetDateTime,
}

/// Errors that can occur during workflow execution
#[derive(Debug, Error, Clone)]
pub enum ExecutionError {
    #[error("step not found: {0}")]
    StepNotFound(String),

    #[error("routine not found: {0}")]
    RoutineNotFound(RoutineType),

    #[error("input validation failed for step {step_id}: {errors:?}")]
    InputValidation {
        step_id: String,
        errors: Vec<crate::routine::contract::ValidationError>,
    },

    #[error("output validation failed for step {step_id}: {errors:?}")]
    OutputValidation {
        step_id: String,
        errors: Vec<crate::routine::contract::ValidationError>,
    },

    #[error("routine execution failed for step {step_id}: {error}")]
    RoutineExecution { step_id: String, error: RoutineError },

    #[error("timeout after {timeout_secs}s in step {step_id}")]
    Timeout { step_id: String, timeout_secs: u32 },

    #[error("no matching branch for step {step_id}")]
    NoMatchingBranch { step_id: String },

    #[error("max retries exceeded for step {step_id}")]
    MaxRetriesExceeded { step_id: String },

    #[error("fallback not implemented for step {step_id}: {reason}")]
    FallbackNotImplemented { step_id: String, reason: String },

    #[error("capability resolution failed for step {step_id}: capability '{capability_id}' - {error}")]
    CapabilityResolution {
        step_id: String,
        capability_id: String,
        error: String,
    },

    #[error("tool execution not supported for step {step_id}: tool '{tool_name}'")]
    ToolNotSupported { step_id: String, tool_name: String },
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::routine::builtin::create_builtin_registry;
    use crate::workflow::compiler::WorkflowCompiler;
    use crate::playbook::spec::entities::*;

    fn create_simple_workflow() -> CompiledWorkflow {
        let spec = PlaybookSpec {
            metadata: PlaybookMetadata {
                title: "Test".to_string(),
                description: "Test workflow".to_string(),
                mode: PlaybookMode::Standard,
                version: "1.0.0".to_string(),
                tags: vec![],
            },
            input_schema: vec![],
            workflow: WorkflowDefinition {
                steps: vec![
                    StepDefinition {
                        id: "step1".to_string(),
                        name: "Step 1".to_string(),
                        description: "First step".to_string(),
                        implementation: None,
                        routine: Some(RoutineRef {
                            capability_class: "builtin".to_string(),
                            name: "noop".to_string(),
                            version: "1.0.0".to_string(),
                        }),
                        input_mapping: HashMap::new(),
                        output_mapping: HashMap::new(),
                        retry_policy: None,
                        timeout_seconds: None,
                        transition: Transition::Next { step_id: "step2".to_string() },
                    },
                    StepDefinition {
                        id: "step2".to_string(),
                        name: "Step 2".to_string(),
                        description: "Second step".to_string(),
                        implementation: None,
                        routine: Some(RoutineRef {
                            capability_class: "builtin".to_string(),
                            name: "echo".to_string(),
                            version: "1.0.0".to_string(),
                        }),
                        input_mapping: [("message".to_string(), "input.message".to_string())]
                            .into_iter()
                            .collect(),
                        output_mapping: HashMap::new(),
                        retry_policy: None,
                        timeout_seconds: None,
                        transition: Transition::End,
                    },
                ],
                default_retry_policy: None,
                error_handling: None,
            },
            capability_refs: CapabilityRefs::default(),
            output_contract: OutputContract {
                primary_artifact: None,
                secondary_artifacts: None,
                backup_policy: BackupPolicy::None,
            },
            policy_profile: None,
        };

        let registry = create_builtin_registry();
        WorkflowCompiler::compile(&spec, &registry).unwrap()
    }

    #[test]
    fn test_navigate_value() {
        let value = serde_json::json!({
            "a": {
                "b": {
                    "c": "deep_value"
                }
            }
        });

        assert_eq!(
            WorkflowExecutor::navigate_value(&value, &["a", "b", "c"]),
            Some(serde_json::json!("deep_value"))
        );

        assert_eq!(
            WorkflowExecutor::navigate_value(&value, &["a", "missing"]),
            None
        );
    }

    #[test]
    fn test_parse_comparison() {
        assert_eq!(
            WorkflowExecutor::parse_comparison("x > 0"),
            Some(("x", ">", "0"))
        );

        assert_eq!(
            WorkflowExecutor::parse_comparison("field == 'value'"),
            Some(("field", "==", "'value'"))
        );

        assert_eq!(
            WorkflowExecutor::parse_comparison("count >= 10"),
            Some(("count", ">=", "10"))
        );
    }

    #[test]
    fn test_evaluate_condition_numeric() {
        let output = serde_json::json!({
            "topics": ["a", "b", "c"],
            "count": 5
        });

        assert!(WorkflowExecutor::evaluate_condition("output.count > 0", &output));
        assert!(WorkflowExecutor::evaluate_condition("output.count == 5", &output));
        assert!(!WorkflowExecutor::evaluate_condition("output.count < 3", &output));
    }

    #[test]
    fn test_evaluate_condition_array_length() {
        let output = serde_json::json!({
            "topics": ["a", "b", "c"],
        });

        assert!(WorkflowExecutor::evaluate_condition("output.topics.length > 0", &output));
        assert!(WorkflowExecutor::evaluate_condition("output.topics.length == 3", &output));
        assert!(!WorkflowExecutor::evaluate_condition("output.topics.length > 5", &output));
    }
}
