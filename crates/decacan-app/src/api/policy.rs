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
) -> Result<Json<UserPermissionsResponseDto>, StatusCode> {
    let permissions = state
        .get_current_user_permissions()
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
        reason: if allowed { None } else { Some("Permission denied".to_string()) },
    })
}

async fn get_role_permissions(
    Path(role): Path<String>,
) -> Result<Json<RolePermissionsResponseDto>, StatusCode> {
    let permissions = match role.as_str() {
        "owner" => vec![
            PermissionDto { resource: "workspace".to_string(), action: "*".to_string() },
            PermissionDto { resource: "playbook".to_string(), action: "*".to_string() },
            PermissionDto { resource: "task".to_string(), action: "*".to_string() },
            PermissionDto { resource: "member".to_string(), action: "*".to_string() },
        ],
        "admin" => vec![
            PermissionDto { resource: "playbook".to_string(), action: "*".to_string() },
            PermissionDto { resource: "task".to_string(), action: "*".to_string() },
            PermissionDto { resource: "member".to_string(), action: "create".to_string() },
            PermissionDto { resource: "member".to_string(), action: "read".to_string() },
            PermissionDto { resource: "member".to_string(), action: "update".to_string() },
        ],
        "editor" => vec![
            PermissionDto { resource: "playbook".to_string(), action: "create".to_string() },
            PermissionDto { resource: "playbook".to_string(), action: "read".to_string() },
            PermissionDto { resource: "playbook".to_string(), action: "update".to_string() },
            PermissionDto { resource: "playbook".to_string(), action: "execute".to_string() },
            PermissionDto { resource: "task".to_string(), action: "*".to_string() },
        ],
        "viewer" => vec![
            PermissionDto { resource: "playbook".to_string(), action: "read".to_string() },
            PermissionDto { resource: "task".to_string(), action: "read".to_string() },
            PermissionDto { resource: "artifact".to_string(), action: "read".to_string() },
        ],
        _ => vec![],
    };

    Ok(Json(RolePermissionsResponseDto {
        role,
        permissions,
    }))
}
