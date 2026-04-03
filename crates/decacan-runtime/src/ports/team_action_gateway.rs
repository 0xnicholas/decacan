use crate::team_session::action::TeamActionIntent;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ApprovalContinuation {
    pub approval_id: String,
    pub continuation_token: String,
    pub intent_version: u64,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum TeamActionDisposition {
    Applied {
        action_id: String,
        intent_version: u64,
    },
    ApprovalRequired {
        approval_id: String,
        intent_version: u64,
    },
    ApprovalRejected {
        approval_id: String,
        intent_version: u64,
    },
}

impl TeamActionDisposition {
    pub fn approval_rejected(approval_id: impl Into<String>, intent_version: u64) -> Self {
        Self::ApprovalRejected {
            approval_id: approval_id.into(),
            intent_version,
        }
    }

    pub fn can_reopen_with_intent_version(&self, next_intent_version: u64) -> bool {
        match self {
            Self::ApprovalRejected { intent_version, .. } => next_intent_version > *intent_version,
            _ => true,
        }
    }
}

#[async_trait::async_trait]
pub trait TeamActionGateway: Send + Sync {
    type Error;

    async fn submit_action(
        &self,
        intent: TeamActionIntent,
    ) -> Result<TeamActionDisposition, Self::Error>;

    async fn continue_after_approval(
        &self,
        continuation: ApprovalContinuation,
    ) -> Result<TeamActionDisposition, Self::Error>;
}
