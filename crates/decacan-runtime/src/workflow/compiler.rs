use thiserror::Error;

use crate::playbook::spec::entities::{
    PlaybookSpec, StepDefinition, Transition, WorkflowDefinition,
};
use crate::routine::r#trait::{RoutineRegistry, RoutineType};

use super::entity::{CompiledWorkflow, Workflow};
use super::step::{CompiledBranch, CompiledTransition, CompiledWorkflowStep, LegacyWorkflowStep};

/// Compiles a PlaybookSpec into an executable Workflow
pub struct WorkflowCompiler;

impl WorkflowCompiler {
    /// Compile a PlaybookSpec into a CompiledWorkflow
    pub fn compile(
        spec: &PlaybookSpec,
        registry: &RoutineRegistry,
    ) -> Result<CompiledWorkflow, CompileError> {
        // Validate all referenced routines exist
        Self::validate_routines(&spec.workflow, registry)?;

        // Compile steps
        let steps = spec
            .workflow
            .steps
            .iter()
            .map(|step| Self::compile_step(step))
            .collect::<Result<Vec<_>, _>>()?;

        Ok(CompiledWorkflow {
            id: format!(
                "workflow-{}-v{}",
                spec.metadata.title.to_lowercase().replace(' ', "-"),
                spec.metadata.version.replace('.', "-")
            ),
            steps,
            compiled_at: time::OffsetDateTime::now_utc(),
        })
    }

    /// Validate that all routines referenced in the workflow exist in the registry
    fn validate_routines(
        workflow: &WorkflowDefinition,
        registry: &RoutineRegistry,
    ) -> Result<(), CompileError> {
        for step in &workflow.steps {
            let routine_type = RoutineType::new(
                &step.routine.capability_class,
                &step.routine.name,
                &step.routine.version,
            );

            if !registry.contains(&routine_type) {
                return Err(CompileError::UnknownRoutine {
                    step_id: step.id.clone(),
                    routine: routine_type,
                });
            }
        }
        Ok(())
    }

    /// Compile a single step
    fn compile_step(step: &StepDefinition) -> Result<CompiledWorkflowStep, CompileError> {
        let transition = Self::compile_transition(&step.transition)?;

        Ok(CompiledWorkflowStep {
            id: step.id.clone(),
            name: step.name.clone(),
            description: step.description.clone(),
            routine_type: RoutineType::new(
                &step.routine.capability_class,
                &step.routine.name,
                &step.routine.version,
            ),
            input_mapping: step.input_mapping.clone(),
            output_mapping: step.output_mapping.clone(),
            transition,
            retry_policy: step.retry_policy.clone(),
            timeout_seconds: step.timeout_seconds,
            error_handling: None, // TODO: Add to StepDefinition
            fallback: None,       // TODO: Add to StepDefinition
        })
    }

    /// Compile a transition
    fn compile_transition(transition: &Transition) -> Result<CompiledTransition, CompileError> {
        match transition {
            Transition::Next { step_id } => Ok(CompiledTransition::Next(step_id.clone())),
            Transition::Conditional { branches } => {
                let compiled_branches = branches
                    .iter()
                    .map(|b| super::step::CompiledBranch {
                        condition: b.condition.clone(),
                        step_id: b.step_id.clone(),
                    })
                    .collect();
                Ok(CompiledTransition::Conditional(compiled_branches))
            }
            Transition::End => Ok(CompiledTransition::End),
        }
    }

    /// Compile from a spec and return a test workflow
    pub fn compile_for_test(spec: &PlaybookSpec) -> Result<CompiledWorkflow, CompileError> {
        // For tests, create a registry with builtin routines
        let registry = crate::routine::builtin::create_builtin_registry();
        Self::compile(spec, &registry)
    }
}

#[derive(Debug, Error, Clone, PartialEq)]
pub enum CompileError {
    #[error("unknown routine in step '{step_id}': {routine}")]
    UnknownRoutine {
        step_id: String,
        routine: RoutineType,
    },

    #[error("contract mismatch: {0}")]
    ContractMismatch(String),

    #[error("invalid workflow: {0}")]
    InvalidWorkflow(String),
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::playbook::spec::entities::{
        BackupPolicy, CapabilityRefs, ConditionalBranch, OutputContract, PlaybookMetadata,
        PlaybookMode, PlaybookSpec, RoutineRef, StepDefinition, Transition, WorkflowDefinition,
    };
    use crate::routine::builtin::{create_builtin_registry, EchoRoutine, NoopRoutine};
    use crate::routine::r#trait::RoutineRegistry;
    use std::sync::Arc;

    fn create_test_spec() -> PlaybookSpec {
        PlaybookSpec {
            metadata: PlaybookMetadata {
                title: "Test Playbook".to_string(),
                description: "A test playbook".to_string(),
                mode: PlaybookMode::Standard,
                version: "1.0.0".to_string(),
                tags: vec![],
            },
            input_schema: vec![],
            workflow: WorkflowDefinition {
                steps: vec![
                    StepDefinition {
                        id: "step1".to_string(),
                        name: "First Step".to_string(),
                        description: "The first step".to_string(),
                        routine: RoutineRef {
                            capability_class: "builtin".to_string(),
                            name: "noop".to_string(),
                            version: "1.0.0".to_string(),
                        },
                        input_mapping: Default::default(),
                        output_mapping: Default::default(),
                        retry_policy: None,
                        timeout_seconds: None,
                        transition: Transition::Next {
                            step_id: "step2".to_string(),
                        },
                    },
                    StepDefinition {
                        id: "step2".to_string(),
                        name: "Second Step".to_string(),
                        description: "The second step".to_string(),
                        routine: RoutineRef {
                            capability_class: "builtin".to_string(),
                            name: "echo".to_string(),
                            version: "1.0.0".to_string(),
                        },
                        input_mapping: Default::default(),
                        output_mapping: Default::default(),
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
        }
    }

    #[test]
    fn test_compile_valid_spec() {
        let spec = create_test_spec();
        let registry = create_builtin_registry();

        let result = WorkflowCompiler::compile(&spec, &registry);

        assert!(result.is_ok());
        let workflow = result.unwrap();
        assert_eq!(workflow.steps.len(), 2);
        assert_eq!(workflow.steps[0].id, "step1");
        assert_eq!(workflow.steps[1].id, "step2");
    }

    #[test]
    fn test_compile_unknown_routine() {
        let mut spec = create_test_spec();
        // Change to an unknown routine
        spec.workflow.steps[0].routine.name = "unknown_routine".to_string();

        let registry = create_builtin_registry();
        let result = WorkflowCompiler::compile(&spec, &registry);

        assert!(result.is_err());
        assert!(matches!(
            result.unwrap_err(),
            CompileError::UnknownRoutine { .. }
        ));
    }

    #[test]
    fn test_compile_conditional_transition() {
        let mut spec = create_test_spec();
        spec.workflow.steps[0].transition = Transition::Conditional {
            branches: vec![
                ConditionalBranch {
                    condition: "x > 0".to_string(),
                    step_id: "step2".to_string(),
                },
                ConditionalBranch {
                    condition: "x <= 0".to_string(),
                    step_id: "step2".to_string(),
                },
            ],
        };

        let registry = create_builtin_registry();
        let result = WorkflowCompiler::compile(&spec, &registry);

        assert!(result.is_ok());
        let workflow = result.unwrap();
        match &workflow.steps[0].transition {
            CompiledTransition::Conditional(branches) => {
                assert_eq!(branches.len(), 2);
                assert_eq!(branches[0].condition, "x > 0");
            }
            _ => panic!("Expected conditional transition"),
        }
    }

    #[test]
    fn test_compile_step_mappings() {
        let mut spec = create_test_spec();
        spec.workflow.steps[0]
            .input_mapping
            .insert("key1".to_string(), "value1".to_string());
        spec.workflow.steps[0]
            .output_mapping
            .insert("out1".to_string(), "result1".to_string());

        let registry = create_builtin_registry();
        let result = WorkflowCompiler::compile(&spec, &registry);

        assert!(result.is_ok());
        let workflow = result.unwrap();
        assert_eq!(
            workflow.steps[0].input_mapping.get("key1"),
            Some(&"value1".to_string())
        );
        assert_eq!(
            workflow.steps[0].output_mapping.get("out1"),
            Some(&"result1".to_string())
        );
    }

    #[test]
    fn test_compile_with_custom_registry() {
        let spec = create_test_spec();
        let registry = RoutineRegistry::new();
        registry.register(Arc::new(NoopRoutine));
        registry.register(Arc::new(EchoRoutine));

        let result = WorkflowCompiler::compile(&spec, &registry);

        assert!(result.is_ok());
    }
}

// Backward compatibility functions - these maintain the old API
// while the new trait-based system is being adopted

use crate::playbook::entity::Playbook;
use crate::playbook::modes::PlaybookMode;
use crate::playbook::registry::{
    get_registered_discovery_playbook_for_test, get_registered_summary_playbook_for_test,
    DISCOVER_TOPICS_PLAYBOOK_KEY, SUMMARY_PLAYBOOK_KEY,
};
use crate::workflow::step::WorkflowStepType;

/// Legacy compile function for backward compatibility
///
/// This maintains the old hardcoded workflow compilation for existing playbooks
/// while new playbooks should use WorkflowCompiler with PlaybookSpec
pub fn compile_playbook(playbook: &Playbook) -> Option<Workflow> {
    match (playbook.key.as_str(), playbook.mode) {
        (SUMMARY_PLAYBOOK_KEY, PlaybookMode::Standard) => {
            Some(compile_summary_workflow_legacy(playbook))
        }
        (DISCOVER_TOPICS_PLAYBOOK_KEY, PlaybookMode::Discovery) => {
            Some(compile_discovery_workflow_legacy(playbook))
        }
        _ => None,
    }
}

/// Legacy test helper
pub fn compile_summary_playbook_for_test() -> Workflow {
    let playbook = get_registered_summary_playbook_for_test();
    compile_playbook(&playbook).expect("summary playbook should compile")
}

/// Legacy test helper
pub fn compile_discovery_playbook_for_test() -> Workflow {
    let playbook = get_registered_discovery_playbook_for_test();
    compile_playbook(&playbook).expect("discovery playbook should compile")
}

fn compile_summary_workflow_legacy(playbook: &Playbook) -> Workflow {
    use super::step::WorkflowStep as LegacyWorkflowStep;

    Workflow::new(
        format!("workflow-{}-legacy", playbook.id),
        vec![
            LegacyWorkflowStep::new(
                "scan_markdown_files",
                "scan_markdown_files",
                WorkflowStepType::Deterministic,
                "Scan the workspace for markdown files that can be summarized.",
                Some("read_markdown_contents".to_owned()),
            ),
            LegacyWorkflowStep::new(
                "read_markdown_contents",
                "read_markdown_contents",
                WorkflowStepType::Tool,
                "Read the selected markdown file contents into workflow context.",
                Some("discover_topics".to_owned()),
            ),
            LegacyWorkflowStep::new(
                "discover_topics",
                "discover_topics",
                WorkflowStepType::Psi,
                "Identify the primary topics covered by the markdown sources.",
                Some("draft_summary".to_owned()),
            ),
            LegacyWorkflowStep::new(
                "draft_summary",
                "draft_summary",
                WorkflowStepType::Psi,
                "Draft a concise summary from the discovered topics and sources.",
                Some("backup_existing_summary".to_owned()),
            ),
            LegacyWorkflowStep::new(
                "backup_existing_summary",
                "backup_existing_summary",
                WorkflowStepType::Deterministic,
                "Prepare a backup location before overwriting an existing summary artifact.",
                Some("write_summary".to_owned()),
            ),
            LegacyWorkflowStep::new(
                "write_summary",
                "write_summary",
                WorkflowStepType::Tool,
                "Write the generated summary to the target markdown artifact path.",
                Some("register_artifact".to_owned()),
            ),
            LegacyWorkflowStep::new(
                "register_artifact",
                "register_artifact",
                WorkflowStepType::Deterministic,
                "Register the written summary as the workflow output artifact.",
                None,
            ),
        ],
    )
}

fn compile_discovery_workflow_legacy(playbook: &Playbook) -> Workflow {
    use super::step::WorkflowStep as LegacyWorkflowStep;

    Workflow::new(
        format!("workflow-{}-legacy", playbook.id),
        vec![
            LegacyWorkflowStep::new(
                "scan_markdown_files",
                "scan_markdown_files",
                WorkflowStepType::Deterministic,
                "Scan the workspace for markdown files that can be inspected for themes.",
                Some("read_markdown_contents".to_owned()),
            ),
            LegacyWorkflowStep::new(
                "read_markdown_contents",
                "read_markdown_contents",
                WorkflowStepType::Tool,
                "Read the selected markdown file contents into workflow context.",
                Some("discover_themes".to_owned()),
            ),
            LegacyWorkflowStep::new(
                "discover_themes",
                "discover_themes",
                WorkflowStepType::Psi,
                "Identify recurring themes in the markdown sources.",
                Some("draft_discovery".to_owned()),
            ),
            LegacyWorkflowStep::new(
                "draft_discovery",
                "draft_discovery",
                WorkflowStepType::Psi,
                "Produce a lightweight discovery report from the identified themes.",
                Some("write_discovery".to_owned()),
            ),
            LegacyWorkflowStep::new(
                "write_discovery",
                "write_discovery",
                WorkflowStepType::Tool,
                "Write the discovery report to the target markdown artifact path.",
                Some("register_artifact".to_owned()),
            ),
            LegacyWorkflowStep::new(
                "register_artifact",
                "register_artifact",
                WorkflowStepType::Deterministic,
                "Register the written discovery report as the workflow output artifact.",
                None,
            ),
        ],
    )
}
