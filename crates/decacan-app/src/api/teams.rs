use axum::extract::{Path, State};
use axum::http::StatusCode;
use axum::routing::{delete, get, post, put};
use axum::{Json, Router};

use crate::app::state::AppState;
use crate::dto::team::{
    CreateTeamRequestDto, CreateTeamResponseDto, ListTeamsResponseDto, TeamSpecDto,
    UpdateTeamRequestDto,
};

pub(super) fn router() -> Router<AppState> {
    Router::new()
        .route("/api/teams", get(list_teams).post(create_team))
        .route(
            "/api/teams/:team_id",
            get(get_team).put(update_team).delete(delete_team),
        )
}

async fn list_teams(State(state): State<AppState>) -> Json<ListTeamsResponseDto> {
    Json(state.list_teams())
}

async fn get_team(
    State(state): State<AppState>,
    Path(team_id): Path<String>,
) -> Result<Json<TeamSpecDto>, StatusCode> {
    state
        .get_team(&team_id)
        .ok_or(StatusCode::NOT_FOUND)
        .map(Json)
}

async fn create_team(
    State(state): State<AppState>,
    Json(request): Json<CreateTeamRequestDto>,
) -> Result<(StatusCode, Json<CreateTeamResponseDto>), StatusCode> {
    let response = state
        .create_team(request)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok((StatusCode::CREATED, Json(response)))
}

async fn update_team(
    State(state): State<AppState>,
    Path(team_id): Path<String>,
    Json(request): Json<UpdateTeamRequestDto>,
) -> Result<Json<TeamSpecDto>, StatusCode> {
    state
        .update_team(&team_id, request)
        .map_err(|e| {
            if e.contains("not found") {
                StatusCode::NOT_FOUND
            } else {
                StatusCode::BAD_REQUEST
            }
        })
        .map(Json)
}

async fn delete_team(
    State(state): State<AppState>,
    Path(team_id): Path<String>,
) -> Result<StatusCode, StatusCode> {
    state
        .delete_team(&team_id)
        .map_err(|_| StatusCode::NOT_FOUND)?;

    Ok(StatusCode::NO_CONTENT)
}
