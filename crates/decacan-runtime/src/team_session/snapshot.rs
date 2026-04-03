use crate::team_session::entity::{TeamExecutionPhase, TeamSessionStatus};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EvolutionProposalSummary {
    pub proposal_id: String,
    pub title: String,
    pub review_state: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TeamSessionSnapshot {
    pub session_id: String,
    pub status: TeamSessionStatus,
    pub phase: TeamExecutionPhase,
    pub snapshot_version: u64,
    pub continuation_token: Option<String>,
    #[serde(default)]
    pub evolution_proposals: Vec<EvolutionProposalSummary>,
}

impl TeamSessionSnapshot {
    pub fn new_for_test(session_id: impl Into<String>) -> Self {
        Self {
            session_id: session_id.into(),
            status: TeamSessionStatus::Pending,
            phase: TeamExecutionPhase::Planning,
            snapshot_version: 1,
            continuation_token: None,
            evolution_proposals: Vec::new(),
        }
    }

    pub fn with_snapshot_version(mut self, version: u64) -> Self {
        self.snapshot_version = version;
        self
    }

    pub fn with_continuation_token(mut self, token: impl Into<String>) -> Self {
        self.continuation_token = Some(token.into());
        self
    }

    pub fn can_resume(&self, token: &str, version: u64) -> bool {
        self.snapshot_version == version && self.continuation_token.as_deref() == Some(token)
    }

    pub fn with_evolution_proposal_for_test(
        mut self,
        proposal_id: impl Into<String>,
        title: impl Into<String>,
        review_state: impl Into<String>,
    ) -> Self {
        self.evolution_proposals.push(EvolutionProposalSummary {
            proposal_id: proposal_id.into(),
            title: title.into(),
            review_state: review_state.into(),
        });
        self
    }
}
