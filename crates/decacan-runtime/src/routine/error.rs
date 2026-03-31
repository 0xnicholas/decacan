use thiserror::Error;

use super::contract::ValidationError;

/// Errors that can occur during routine execution
#[derive(Debug, Error, Clone)]
pub enum RoutineError {
    #[error("input validation failed: {0:?}")]
    InputValidation(Vec<ValidationError>),

    #[error("execution failed: {0}")]
    Execution(String),

    #[error("output validation failed: {0:?}")]
    OutputValidation(Vec<ValidationError>),

    #[error("timeout after {0}s")]
    Timeout(u32),

    #[error("routine not found: {0}")]
    NotFound(String),

    #[error("filesystem error: {0}")]
    Filesystem(String),

    #[error("synthesis execution blocked: {0}")]
    SynthesisBlocked(String),

    #[error("synthesis execution failed: {0}")]
    SynthesisFailed(String),

    #[error("missing state: {0}")]
    MissingState(String),

    #[error("artifact error: {0}")]
    Artifact(String),
}

impl RoutineError {
    /// Create a filesystem error from any error type
    pub fn filesystem<E: std::fmt::Debug>(error: E) -> Self {
        Self::Filesystem(format!("{:?}", error))
    }

    /// Create an execution error from any error type
    pub fn execution<E: std::fmt::Display>(error: E) -> Self {
        Self::Execution(error.to_string())
    }

    /// Check if this is a validation error
    pub fn is_validation_error(&self) -> bool {
        matches!(self, Self::InputValidation(_) | Self::OutputValidation(_))
    }

    /// Check if this is a timeout error
    pub fn is_timeout(&self) -> bool {
        matches!(self, Self::Timeout(_))
    }
}

/// Result type for routine operations
pub type RoutineResult<T> = Result<T, RoutineError>;
