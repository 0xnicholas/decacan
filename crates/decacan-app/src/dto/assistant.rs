use serde::{Deserialize, Serialize};

use crate::dto::TeamSessionSnapshotDto;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AssistantObjectiveDto {
    pub title: String,
    pub user_goal: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CreateAssistantSessionRequestDto {
    pub workspace_id: String,
    pub objective: AssistantObjectiveDto,
    pub execution_mode: String,
}

pub type CreateAssistantDelegationRequestDto = CreateAssistantSessionRequestDto;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AssistantDelegationDto {
    pub task_id: String,
    pub run_id: String,
    pub team_session_id: String,
    pub status: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AssistantSessionResponseDto {
    pub assistant_session_id: String,
    pub workspace_id: String,
    pub objective: AssistantObjectiveDto,
    pub execution_mode: String,
    pub delegation: AssistantDelegationDto,
    pub team_session: TeamSessionSnapshotDto,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AssistantSessionSummaryDto {
    pub assistant_session_id: String,
    pub active_team_session_id: Option<String>,
    pub state: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EvolutionProposalDto {
    pub proposal_id: String,
    pub team_session_id: String,
    pub title: String,
    pub review_state: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct EvolutionProposalReviewUpdateRequestDto {
    pub team_session_id: String,
    pub title: String,
    pub review_state: String,
}
