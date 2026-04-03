use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum AssistantDecisionResult {
    Approved,
    Rejected,
    Escalated,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AssistantDecisionRecord {
    pub decision_id: String,
    pub assistant_session_id: String,
    pub team_session_id: String,
    pub result: AssistantDecisionResult,
}

impl AssistantDecisionRecord {
    pub fn new_for_test(
        decision_id: impl Into<String>,
        assistant_session_id: impl Into<String>,
        team_session_id: impl Into<String>,
        result: AssistantDecisionResult,
    ) -> Self {
        Self {
            decision_id: decision_id.into(),
            assistant_session_id: assistant_session_id.into(),
            team_session_id: team_session_id.into(),
            result,
        }
    }
}
