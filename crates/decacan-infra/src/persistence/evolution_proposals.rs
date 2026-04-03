use decacan_runtime::persistence::evolution_proposals::{
    EvolutionProposalRecord, EvolutionProposalRecordStore,
};
use std::collections::HashMap;
use std::convert::Infallible;
use std::sync::{Arc, RwLock};

#[derive(Debug, Clone, Default)]
pub struct InMemoryEvolutionProposalRecordStore {
    proposals: Arc<RwLock<HashMap<String, EvolutionProposalRecord>>>,
}

impl InMemoryEvolutionProposalRecordStore {
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait::async_trait]
impl EvolutionProposalRecordStore for InMemoryEvolutionProposalRecordStore {
    type Error = Infallible;

    async fn load(
        &self,
        proposal_id: &str,
    ) -> Result<Option<EvolutionProposalRecord>, Self::Error> {
        let proposals = self.proposals.read().unwrap_or_else(|e| e.into_inner());
        Ok(proposals.get(proposal_id).cloned())
    }

    async fn list_for_session(
        &self,
        team_session_id: &str,
    ) -> Result<Vec<EvolutionProposalRecord>, Self::Error> {
        let proposals = self.proposals.read().unwrap_or_else(|e| e.into_inner());
        Ok(proposals
            .values()
            .filter(|proposal| proposal.team_session_id == team_session_id)
            .cloned()
            .collect())
    }

    async fn save(&self, proposal: EvolutionProposalRecord) -> Result<(), Self::Error> {
        let mut proposals = self.proposals.write().unwrap_or_else(|e| e.into_inner());
        proposals.insert(proposal.proposal_id.clone(), proposal);
        Ok(())
    }
}
