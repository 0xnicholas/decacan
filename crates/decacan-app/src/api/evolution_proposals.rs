use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::routing::{get, patch};
use axum::{Json, Router};
use serde::Deserialize;

use crate::app::state::{AppState, EvolutionProposalError};
use crate::dto::{EvolutionProposalDto, EvolutionProposalReviewUpdateRequestDto};

#[derive(Debug, Clone, PartialEq, Eq, Deserialize)]
struct ListEvolutionProposalQuery {
    team_session_id: Option<String>,
}

pub(super) fn router() -> Router<AppState> {
    Router::new()
        .route("/api/evolution-proposals", get(list_evolution_proposals))
        .route(
            "/api/evolution-proposals/:proposal_id/review",
            patch(update_evolution_review_state),
        )
}

async fn list_evolution_proposals(
    State(state): State<AppState>,
    Query(query): Query<ListEvolutionProposalQuery>,
) -> Json<Vec<EvolutionProposalDto>> {
    Json(state.list_evolution_proposals(query.team_session_id.as_deref()))
}

async fn update_evolution_review_state(
    State(state): State<AppState>,
    Path(proposal_id): Path<String>,
    Json(request): Json<EvolutionProposalReviewUpdateRequestDto>,
) -> Result<Json<EvolutionProposalDto>, StatusCode> {
    let updated = state
        .update_evolution_proposal_review(&proposal_id, request)
        .await
        .map_err(map_evolution_error_to_status)?;
    Ok(Json(updated))
}

fn map_evolution_error_to_status(error: EvolutionProposalError) -> StatusCode {
    match error {
        EvolutionProposalError::TeamSessionNotFound => StatusCode::NOT_FOUND,
        EvolutionProposalError::InvalidReviewState => StatusCode::UNPROCESSABLE_ENTITY,
    }
}
