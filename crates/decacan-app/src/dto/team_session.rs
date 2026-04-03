use decacan_runtime::team_session::snapshot::TeamSessionSnapshot;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TeamSessionEvolutionProposalDto {
    pub proposal_id: String,
    pub title: String,
    pub review_state: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct TeamSessionSnapshotDto {
    pub session_id: String,
    pub status: String,
    pub phase: String,
    pub snapshot_version: u64,
    pub continuation_token: Option<String>,
    pub evolution_proposals: Vec<TeamSessionEvolutionProposalDto>,
}

impl From<TeamSessionSnapshot> for TeamSessionSnapshotDto {
    fn from(value: TeamSessionSnapshot) -> Self {
        Self {
            session_id: value.session_id,
            status: value.status.as_str().to_owned(),
            phase: value.phase.as_str().to_owned(),
            snapshot_version: value.snapshot_version,
            continuation_token: value.continuation_token,
            evolution_proposals: value
                .evolution_proposals
                .into_iter()
                .map(|proposal| TeamSessionEvolutionProposalDto {
                    proposal_id: proposal.proposal_id,
                    title: proposal.title,
                    review_state: proposal.review_state,
                })
                .collect(),
        }
    }
}
