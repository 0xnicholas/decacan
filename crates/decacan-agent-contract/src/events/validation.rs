use super::execution_event::ExecutionEvent;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ValidationError {
    MissingExecutionId,
    InvalidRelativePath(String),
    InvalidApprovalRiskLevel,
    EmptyToolName,
    EmptyStepId,
}

impl std::fmt::Display for ValidationError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ValidationError::MissingExecutionId => {
                write!(f, "execution_id is missing or empty")
            }
            ValidationError::InvalidRelativePath(path) => {
                write!(
                    f,
                    "relative_path must not be absolute or contain '..': {}",
                    path
                )
            }
            ValidationError::InvalidApprovalRiskLevel => {
                write!(f, "ApprovalRequired event must have risk_level >= High")
            }
            ValidationError::EmptyToolName => {
                write!(f, "tool_name must not be empty")
            }
            ValidationError::EmptyStepId => {
                write!(f, "step_id must not be empty")
            }
        }
    }
}

impl std::error::Error for ValidationError {}

pub fn validate_event(event: &ExecutionEvent) -> Result<(), ValidationError> {
    if event.execution_id().is_empty() {
        return Err(ValidationError::MissingExecutionId);
    }

    match event {
        ExecutionEvent::FileWrite { relative_path, .. } => {
            validate_relative_path(relative_path)?;
        }
        ExecutionEvent::ApprovalRequired { risk_level, .. } => {
            if !risk_level.requires_approval() {
                return Err(ValidationError::InvalidApprovalRiskLevel);
            }
        }
        ExecutionEvent::ToolWillExecute {
            tool_name, step_id, ..
        }
        | ExecutionEvent::ToolDidExecute {
            tool_name, step_id, ..
        } => {
            if tool_name.is_empty() {
                return Err(ValidationError::EmptyToolName);
            }
            if step_id.is_empty() {
                return Err(ValidationError::EmptyStepId);
            }
        }
        ExecutionEvent::StepStarted { step_id, .. }
        | ExecutionEvent::StepCompleted { step_id, .. } => {
            if step_id.is_empty() {
                return Err(ValidationError::EmptyStepId);
            }
        }
        _ => {}
    }

    Ok(())
}

pub fn validate_relative_path(path: &str) -> Result<(), ValidationError> {
    if path.starts_with('/') || path.contains("..") {
        return Err(ValidationError::InvalidRelativePath(path.to_string()));
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::events::execution_event::{
        ApprovalRequiredEvent, ExecutionEvent, FileWriteEvent, RiskLevel,
    };

    #[test]
    fn reject_absolute_path() {
        let event = ExecutionEvent::FileWrite {
            execution_id: "exec-1".into(),
            step_id: "step-1".into(),
            relative_path: "/etc/passwd".into(),
            size_bytes: 0,
            content_hash: "abc".into(),
        };
        assert_eq!(
            validate_event(&event),
            Err(ValidationError::InvalidRelativePath("/etc/passwd".into()))
        );
    }

    #[test]
    fn reject_parent_directory_traversal() {
        let event = ExecutionEvent::FileWrite {
            execution_id: "exec-1".into(),
            step_id: "step-1".into(),
            relative_path: "../secrets".into(),
            size_bytes: 0,
            content_hash: "abc".into(),
        };
        assert_eq!(
            validate_event(&event),
            Err(ValidationError::InvalidRelativePath("../secrets".into()))
        );
    }

    #[test]
    fn reject_low_risk_approval() {
        let event = ExecutionEvent::ApprovalRequired {
            execution_id: "exec-1".into(),
            approval_id: "appr-1".into(),
            step_id: "step-1".into(),
            prompt: "approve?".into(),
            risk_level: RiskLevel::Low,
            suggested_action: None,
            expires_at: None,
        };
        assert_eq!(
            validate_event(&event),
            Err(ValidationError::InvalidApprovalRiskLevel)
        );
    }

    #[test]
    fn accept_high_risk_approval() {
        let event = ExecutionEvent::ApprovalRequired {
            execution_id: "exec-1".into(),
            approval_id: "appr-1".into(),
            step_id: "step-1".into(),
            prompt: "approve?".into(),
            risk_level: RiskLevel::High,
            suggested_action: None,
            expires_at: None,
        };
        assert!(validate_event(&event).is_ok());
    }

    #[test]
    fn reject_missing_execution_id() {
        let event = ExecutionEvent::Heartbeat {
            execution_id: "".into(),
            timestamp_ms: 0,
        };
        assert_eq!(
            validate_event(&event),
            Err(ValidationError::MissingExecutionId)
        );
    }
}
