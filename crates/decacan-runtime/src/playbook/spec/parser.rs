use thiserror::Error;

use super::entities::{PlaybookSpec, Transition};

pub struct PlaybookSpecParser;

impl PlaybookSpecParser {
    /// Parse a YAML string into a PlaybookSpec
    pub fn parse(yaml_content: &str) -> Result<PlaybookSpec, SpecParseError> {
        let spec: PlaybookSpec = serde_yaml::from_str(yaml_content)
            .map_err(|e| SpecParseError::InvalidYaml(e.to_string()))?;

        // Validate
        Self::validate(&spec)?;

        Ok(spec)
    }

    fn validate(spec: &PlaybookSpec) -> Result<(), SpecParseError> {
        // Validate step IDs are unique
        let step_ids: Vec<_> = spec.workflow.steps.iter().map(|s| &s.id).collect();
        let unique_ids: std::collections::HashSet<_> = step_ids.iter().cloned().collect();
        if step_ids.len() != unique_ids.len() {
            return Err(SpecParseError::DuplicateStepIds);
        }

        // Validate transitions reference valid steps
        for step in &spec.workflow.steps {
            Self::validate_transition(&step.transition, &unique_ids, &step.id)?;
        }

        // Validate workflow has at least one step
        if spec.workflow.steps.is_empty() {
            return Err(SpecParseError::NoStartStep);
        }

        Ok(())
    }

    fn validate_transition(
        transition: &Transition,
        valid_ids: &std::collections::HashSet<&String>,
        current_id: &str,
    ) -> Result<(), SpecParseError> {
        match transition {
            Transition::Next { step_id } => {
                if !valid_ids.contains(step_id) {
                    return Err(SpecParseError::InvalidTransition {
                        from: current_id.to_string(),
                        to: step_id.clone(),
                    });
                }
            }
            Transition::Conditional { branches } => {
                for branch in branches {
                    if !valid_ids.contains(&branch.step_id) {
                        return Err(SpecParseError::InvalidTransition {
                            from: current_id.to_string(),
                            to: branch.step_id.clone(),
                        });
                    }
                }
            }
            Transition::End => {}
        }
        Ok(())
    }

    /// Parse from a file path
    pub fn parse_file(path: &std::path::Path) -> Result<PlaybookSpec, SpecParseError> {
        let content =
            std::fs::read_to_string(path).map_err(|e| SpecParseError::FileRead(e.to_string()))?;
        Self::parse(&content)
    }
}

#[derive(Debug, Error)]
pub enum SpecParseError {
    #[error("invalid YAML: {0}")]
    InvalidYaml(String),
    #[error("duplicate step IDs")]
    DuplicateStepIds,
    #[error("invalid transition from '{from}' to '{to}'")]
    InvalidTransition { from: String, to: String },
    #[error("no steps found in workflow")]
    NoStartStep,
    #[error("unreachable steps: {0:?}")]
    UnreachableSteps(Vec<String>),
    #[error("failed to read file: {0}")]
    FileRead(String),
}
