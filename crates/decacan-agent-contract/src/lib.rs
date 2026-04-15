//! Decacan Agent Contract
//!
//! Defines the white-box interaction protocol between the Decacan orchestration
//! layer and remote agent/execution engines.
//!
//! This crate must remain lightweight: it contains only data definitions and
//! basic validation utilities. No runtime, no IO, no business logic.

pub mod events;
pub mod request;
pub mod snapshot;
pub mod version;

#[cfg(feature = "schema")]
pub mod schema;

pub use events::{
    ApprovalRequiredEvent, ArtifactProducedEvent, ExecutionEvent, ExecutionPhase,
    FailedEvent, FileWriteEvent, InputRequiredEvent, ModelCalledEvent, RiskLevel,
    StepCompletedEvent, StepOutput, StepStartedEvent, ToolDidExecuteEvent,
    ToolResultStatus, ToolWillExecuteEvent,
};
pub use request::{
    ApprovalDecision, ExecutionContext, ExecutionInput, ExecutionRequest,
};
pub use snapshot::{
    CapabilityKind, CapabilityRef, CompiledWorkflow, ExecutionProfile,
    PlaybookSnapshot, WorkflowStepDef,
};
pub use version::{is_compatible, PROTOCOL_VERSION};
