use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TeamSessionStatus {
    Pending,
    Running,
    BlockedOnAssistant,
    BlockedOnHuman,
    BlockedOnTool,
    Completed,
    Failed,
    Terminated,
}

impl TeamSessionStatus {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Pending => "pending",
            Self::Running => "running",
            Self::BlockedOnAssistant => "blocked_on_assistant",
            Self::BlockedOnHuman => "blocked_on_human",
            Self::BlockedOnTool => "blocked_on_tool",
            Self::Completed => "completed",
            Self::Failed => "failed",
            Self::Terminated => "terminated",
        }
    }

    pub fn can_transition_to(&self, next: &Self) -> bool {
        matches!(
            (self, next),
            (Self::Pending, Self::Running)
                | (Self::Running, Self::BlockedOnAssistant)
                | (Self::Running, Self::BlockedOnHuman)
                | (Self::Running, Self::BlockedOnTool)
                | (Self::BlockedOnAssistant, Self::Running)
                | (Self::BlockedOnHuman, Self::Running)
                | (Self::BlockedOnTool, Self::Running)
                | (Self::Running, Self::Completed)
                | (Self::Running, Self::Failed)
                | (Self::Running, Self::Terminated)
        )
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum TeamExecutionPhase {
    Planning,
    Executing,
    Reviewing,
    Finalizing,
}

impl TeamExecutionPhase {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Planning => "planning",
            Self::Executing => "executing",
            Self::Reviewing => "reviewing",
            Self::Finalizing => "finalizing",
        }
    }
}
