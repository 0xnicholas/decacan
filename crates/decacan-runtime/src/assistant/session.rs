use serde::{Deserialize, Serialize};
use std::str::FromStr;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AssistantDelegationStatus {
    Active,
    Completed,
    Cancelled,
}

impl FromStr for AssistantDelegationStatus {
    type Err = String;

    fn from_str(s: &str) -> Result<Self, Self::Err> {
        match s {
            "active" => Ok(AssistantDelegationStatus::Active),
            "completed" => Ok(AssistantDelegationStatus::Completed),
            "cancelled" => Ok(AssistantDelegationStatus::Cancelled),
            _ => Err(format!("Unknown delegation status: {}", s)),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AssistantDelegationBinding {
    pub assistant_session_id: String,
    pub task_id: String,
    pub run_id: String,
    pub team_session_id: String,
    pub status: AssistantDelegationStatus,
}

impl AssistantDelegationBinding {
    pub fn new_for_test(
        assistant_session_id: impl Into<String>,
        task_id: impl Into<String>,
        run_id: impl Into<String>,
        team_session_id: impl Into<String>,
    ) -> Self {
        Self {
            assistant_session_id: assistant_session_id.into(),
            task_id: task_id.into(),
            run_id: run_id.into(),
            team_session_id: team_session_id.into(),
            status: AssistantDelegationStatus::Active,
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AssistantSession {
    pub assistant_session_id: String,
    pub active_delegation: Option<AssistantDelegationBinding>,
}

impl AssistantSession {
    pub fn new_for_test(assistant_session_id: impl Into<String>) -> Self {
        Self {
            assistant_session_id: assistant_session_id.into(),
            active_delegation: None,
        }
    }

    pub fn with_active_delegation(
        mut self,
        task_id: impl Into<String>,
        run_id: impl Into<String>,
        team_session_id: impl Into<String>,
    ) -> Self {
        let binding = AssistantDelegationBinding::new_for_test(
            self.assistant_session_id.clone(),
            task_id.into(),
            run_id.into(),
            team_session_id.into(),
        );
        self.active_delegation = Some(binding);
        self
    }

    pub fn can_start_new_delegation(&self) -> Result<(), &'static str> {
        if self.active_delegation.is_some() {
            return Err("assistant session already has an active delegation");
        }
        Ok(())
    }
}
