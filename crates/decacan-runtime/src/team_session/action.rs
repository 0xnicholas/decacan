use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, PartialOrd, Ord, Serialize, Deserialize)]
pub enum ActionRiskLevel {
    Low,
    Medium,
    High,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub enum TeamActionKind {
    WorkspaceRoleChange,
    ExternalPublish,
    ExternalSend,
    ToolInvoke,
}

impl TeamActionKind {
    pub fn is_mandatory_human_confirm(&self) -> bool {
        matches!(self, Self::WorkspaceRoleChange | Self::ExternalPublish)
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TeamActionIntent {
    pub intent_id: String,
    pub kind: TeamActionKind,
    pub risk_level: ActionRiskLevel,
    pub idempotency_key: Option<String>,
    pub intent_version: u64,
}

impl TeamActionIntent {
    pub fn new_for_test(
        intent_id: impl Into<String>,
        kind: TeamActionKind,
        risk_level: ActionRiskLevel,
    ) -> Self {
        Self {
            intent_id: intent_id.into(),
            kind,
            risk_level,
            idempotency_key: None,
            intent_version: 1,
        }
    }
}
