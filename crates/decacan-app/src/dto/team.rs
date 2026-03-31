use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamSpecDto {
    pub id: String,
    pub name: String,
    pub description: String,
    pub roles: Vec<TeamRoleDto>,
    pub lead_role_id: String,
    pub created_at: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TeamRoleDto {
    pub id: String,
    pub name: String,
    pub description: String,
    pub focus: String,
    pub instructions: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateTeamRequestDto {
    pub name: String,
    pub description: String,
    pub roles: Vec<CreateTeamRoleDto>,
    pub lead_role_id: String,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreateTeamRoleDto {
    pub name: String,
    pub description: String,
    pub focus: String,
    pub instructions: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct CreateTeamResponseDto {
    pub team: TeamSpecDto,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdateTeamRequestDto {
    pub name: Option<String>,
    pub description: Option<String>,
    pub roles: Option<Vec<TeamRoleDto>>,
    pub lead_role_id: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct ListTeamsResponseDto {
    pub teams: Vec<TeamSpecDto>,
}
