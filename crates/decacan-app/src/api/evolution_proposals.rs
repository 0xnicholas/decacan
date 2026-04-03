use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::{get, patch};
use axum::{Json, Router};
use serde::{Deserialize, Serialize};

use crate::app::state::AppState;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
struct EvolutionProposalReviewUpdateRequest {
    review_state: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
struct EvolutionProposalDto {
    proposal_id: String,
    review_state: String,
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
    State(_state): State<AppState>,
) -> Json<Vec<EvolutionProposalDto>> {
    Json(Vec::new())
}

async fn update_evolution_review_state(
    State(_state): State<AppState>,
    Path(proposal_id): Path<String>,
    Json(request): Json<EvolutionProposalReviewUpdateRequest>,
) -> Result<Json<EvolutionProposalDto>, StatusCode> {
    Ok(Json(EvolutionProposalDto {
        proposal_id,
        review_state: request.review_state,
    }))
}
