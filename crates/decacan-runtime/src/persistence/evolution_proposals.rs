use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EvolutionProposalRecord {
    pub proposal_id: String,
    pub team_session_id: String,
    pub summary: String,
    pub review_state: EvolutionProposalReviewState,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum EvolutionProposalReviewState {
    Pending,
    Approved,
    Rejected,
}

#[async_trait::async_trait]
pub trait EvolutionProposalRecordStore: Send + Sync {
    type Error;

    async fn load(&self, proposal_id: &str)
        -> Result<Option<EvolutionProposalRecord>, Self::Error>;

    async fn list_for_session(
        &self,
        team_session_id: &str,
    ) -> Result<Vec<EvolutionProposalRecord>, Self::Error>;

    async fn save(&self, proposal: EvolutionProposalRecord) -> Result<(), Self::Error>;
}
