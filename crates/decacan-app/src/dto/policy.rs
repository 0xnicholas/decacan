use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PermissionDto {
    pub resource: String,
    pub action: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct UserPermissionsResponseDto {
    pub user_id: String,
    pub console_home: bool,
    pub studio_playbooks: bool,
    pub global_permissions: Vec<PermissionDto>,
    pub workspace_permissions: Vec<WorkspacePermissionDto>,
}

#[derive(Debug, Clone, Serialize)]
pub struct WorkspacePermissionDto {
    pub workspace_id: String,
    pub role: String,
    pub permissions: Vec<PermissionDto>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CheckPermissionRequestDto {
    pub workspace_id: Option<String>,
    pub resource: String,
    pub action: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct CheckPermissionResponseDto {
    pub allowed: bool,
    pub reason: Option<String>,
}

#[derive(Debug, Clone, Serialize)]
pub struct RolePermissionsResponseDto {
    pub role: String,
    pub permissions: Vec<PermissionDto>,
}
