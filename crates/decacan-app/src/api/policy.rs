use axum::extract::{Path, Query, State};
use axum::http::StatusCode;
use axum::routing::get;
use axum::{Json, Router};
use serde::Deserialize;

use crate::app::state::AppState;
use crate::dto::policy::{
    CheckPermissionResponseDto, PermissionDto, RolePermissionsResponseDto,
    UserPermissionsResponseDto,
};
use crate::CurrentUser;
use decacan_runtime::workspace::rbac::WorkspaceRole;

#[derive(Debug, Deserialize)]
struct CheckPermissionQuery {
    workspace_id: Option<String>,
    resource: String,
    action: String,
}

pub(super) fn router() -> Router<AppState> {
    Router::new()
        .route("/api/me/permissions", get(get_my_permissions))
        .route("/api/permissions/check", get(check_permission))
        .route("/api/roles/:role/permissions", get(get_role_permissions))
}

async fn get_my_permissions(
    State(state): State<AppState>,
    current_user: CurrentUser,
) -> Result<Json<UserPermissionsResponseDto>, StatusCode> {
    let permissions = state
        .get_current_user_permissions_for_user(&current_user)
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;

    Ok(Json(permissions))
}

async fn check_permission(
    State(state): State<AppState>,
    Query(query): Query<CheckPermissionQuery>,
) -> Json<CheckPermissionResponseDto> {
    let allowed = state.check_permission(
        query.workspace_id.as_deref(),
        &query.resource,
        &query.action,
    );

    Json(CheckPermissionResponseDto {
        allowed,
        reason: if allowed {
            None
        } else {
            Some("Permission denied".to_string())
        },
    })
}

async fn get_role_permissions(
    Path(role): Path<String>,
) -> Result<Json<RolePermissionsResponseDto>, StatusCode> {
    // Parse role string to WorkspaceRole enum
    let workspace_role = match role.as_str() {
        "owner" => Some(WorkspaceRole::Owner),
        "admin" => Some(WorkspaceRole::Admin),
        "editor" => Some(WorkspaceRole::Editor),
        "viewer" => Some(WorkspaceRole::Viewer),
        _ => None,
    };

    let permissions = if let Some(ws_role) = workspace_role {
        // Use actual WorkspaceRole permissions from runtime
        ws_role
            .permissions()
            .into_iter()
            .map(|p| PermissionDto {
                resource: format!("{:?}", p.resource).to_lowercase(),
                action: format!("{:?}", p.action).to_lowercase(),
            })
            .collect()
    } else {
        vec![]
    };

    Ok(Json(RolePermissionsResponseDto { role, permissions }))
}
