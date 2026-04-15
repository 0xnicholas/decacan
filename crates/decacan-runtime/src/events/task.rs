use decacan_agent_contract::events::{ExecutionEvent, RiskLevel, StepOutput, ToolResultStatus};
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TaskEvent {
    pub task_id: String,
    pub event_type: String,
    pub occurred_at: OffsetDateTime,
    pub payload: TaskEventPayload,
}

impl TaskEvent {
    pub fn from_execution_event(
        task_id: impl Into<String>,
        _execution_id: &str,
        event: &ExecutionEvent,
    ) -> Self {
        let task_id = task_id.into();
        let payload = match event {
            ExecutionEvent::ExecutionStarted { run_id, .. } => TaskEventPayload::ExecutionStarted {
                run_id: run_id.clone(),
            },
            ExecutionEvent::PhaseChanged { phase, .. } => TaskEventPayload::PhaseChanged {
                phase: format!("{:?}", phase),
            },
            ExecutionEvent::StepStarted {
                step_id,
                capability_ref,
                ..
            } => TaskEventPayload::StepStarted {
                step_id: step_id.clone(),
                capability_ref: capability_ref.clone(),
            },
            ExecutionEvent::StepCompleted { outputs, .. } => TaskEventPayload::StepCompleted {
                outputs: outputs.clone(),
            },
            ExecutionEvent::ApprovalRequired {
                approval_id,
                prompt,
                ..
            } => TaskEventPayload::ApprovalCreated {
                approval_id: approval_id.clone(),
                prompt: prompt.clone(),
            },
            ExecutionEvent::InputRequired { prompt, .. } => TaskEventPayload::InputRequired {
                prompt: prompt.clone(),
            },
            ExecutionEvent::ToolWillExecute {
                tool_name,
                risk_level,
                ..
            } => TaskEventPayload::ToolPending {
                tool_name: tool_name.clone(),
                risk_level: *risk_level,
            },
            ExecutionEvent::ToolDidExecute {
                tool_name,
                result_status,
                ..
            } => TaskEventPayload::ToolFinished {
                tool_name: tool_name.clone(),
                status: *result_status,
            },
            ExecutionEvent::ArtifactProduced {
                artifact_id,
                artifact_name,
                canonical_path,
                ..
            } => TaskEventPayload::ArtifactReady {
                run_id: String::new(),
                artifact_id: artifact_id.clone(),
                logical_name: artifact_name.clone(),
                canonical_path: canonical_path.clone(),
                physical_path: canonical_path.clone(),
            },
            ExecutionEvent::Completed { .. } => TaskEventPayload::RunCompleted,
            ExecutionEvent::Failed { reason, .. } => TaskEventPayload::RunFailed {
                reason: reason.clone(),
            },
            _ => TaskEventPayload::Heartbeat,
        };

        Self {
            task_id,
            event_type: String::new(),
            occurred_at: OffsetDateTime::now_utc(),
            payload,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum TaskEventPayload {
    ArtifactReady {
        run_id: String,
        artifact_id: String,
        logical_name: String,
        canonical_path: String,
        physical_path: String,
    },
    ExecutionStarted {
        run_id: String,
    },
    PhaseChanged {
        phase: String,
    },
    StepStarted {
        step_id: String,
        capability_ref: String,
    },
    StepCompleted {
        outputs: Vec<StepOutput>,
    },
    ToolPending {
        tool_name: String,
        risk_level: RiskLevel,
    },
    ToolFinished {
        tool_name: String,
        status: ToolResultStatus,
    },
    ApprovalCreated {
        approval_id: String,
        prompt: String,
    },
    InputRequired {
        prompt: String,
    },
    RunCompleted,
    RunFailed {
        reason: String,
    },
    Heartbeat,
}
