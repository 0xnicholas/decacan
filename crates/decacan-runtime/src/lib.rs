pub mod approval;
pub mod artifact;
pub mod assistant;
pub mod authority;
pub mod capability;
pub mod contract;
pub mod events;
pub mod execution;
pub mod gateway;
pub mod invocation;
pub mod merge;
mod outputs;
pub mod persistence;
pub mod playbook;
pub mod policy;
pub mod ports;
mod routine;
pub mod run;
pub mod storage;
mod synthesis;
// Alias for backward compatibility - some files still reference `semantic`
pub(crate) use synthesis as semantic;
pub mod task;
pub mod team;
pub mod team_session;
pub mod trace;
pub mod workflow;
pub mod workspace;

#[doc(hidden)]
pub mod unstable_synthesis {
    pub use crate::synthesis::executor::{
        resume_summary_invocation, start_summary_invocation, BlockedReason, ContinuationState,
        InvocationContext, InvocationOutcome, InvocationResult, InvocationState, PendingAction,
        ResumeAction,
    };
    pub use crate::synthesis::model::{ModelContext, OutputCandidate, SynthesisModel};
    pub use crate::synthesis::tool_protocol::{ToolCall, ToolCallResult, ToolProtocol};
}
