use axum::{
    extract::{Path, State},
    http::{HeaderMap, StatusCode},
    routing::{delete, get, post, put},
    Json, Router,
};
use serde::{Deserialize, Serialize};
use time::format_description::well_known::Rfc3339;

use decacan_runtime::workspace::entity::WorkspaceMembership;
use decacan_runtime::workspace::rbac::{ActionType, Permission, ResourceType, WorkspaceRole};
use decacan_runtime::workspace::service::member_service::{
    CreateMembershipInput, MemberServiceError, UpdateRoleInput,
};

use crate::app::state::AppState;

#[derive(Serialize)]
pub struct MemberResponse {
    pub id: String,
    pub user_id: String,
    pub name: String,
    pub email: String,
    pub role: WorkspaceRole,
    pub invited_by: Option<String>,
    pub joined_at: String,
}

#[derive(Deserialize)]
pub struct InviteMemberRequest {
    pub email: String,
    pub role: WorkspaceRole,
}

#[derive(Deserialize)]
pub struct UpdateRoleRequest {
    pub role: WorkspaceRole,
}

#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
    pub message: String,
}

fn error_response(
    status: StatusCode,
    error: &str,
    message: &str,
) -> (StatusCode, Json<ErrorResponse>) {
    (
        status,
        Json(ErrorResponse {
            error: error.to_string(),
            message: message.to_string(),
        }),
    )
}

impl MemberResponse {
    fn from_membership(membership: &WorkspaceMembership, name: String, email: String) -> Self {
        Self {
            id: membership.id.clone(),
            user_id: membership.user_id.clone(),
            name,
            email,
            role: membership.role,
            invited_by: membership.invited_by.clone(),
            joined_at: membership
                .joined_at
                .format(&Rfc3339)
                .unwrap_or_else(|_| membership.joined_at.to_string()),
        }
    }
}

/// Extract user_id from Authorization header
fn extract_user_id_from_headers(
    headers: &HeaderMap,
    state: &AppState,
) -> Result<String, StatusCode> {
    let auth_header = headers
        .get("authorization")
        .and_then(|value| value.to_str().ok())
        .ok_or(StatusCode::UNAUTHORIZED)?;

    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or(StatusCode::UNAUTHORIZED)?;

    // This is a synchronous function but verify_token is async
    // We need to handle this differently - for now return error
    // The actual verification will happen in the async handlers
    Err(StatusCode::UNAUTHORIZED)
}

pub(super) fn router() -> Router<AppState> {
    Router::new()
        .route(
            "/api/workspaces/:workspace_id/members",
            get(list_members).post(invite_member),
        )
        .route(
            "/api/workspaces/:workspace_id/members/:member_id",
            put(update_role).delete(remove_member),
        )
}

async fn list_members(
    State(state): State<AppState>,
    Path(workspace_id): Path<String>,
    headers: HeaderMap,
) -> Result<Json<Vec<MemberResponse>>, (StatusCode, Json<ErrorResponse>)> {
    // Extract and verify token from headers
    let auth_header = headers
        .get("authorization")
        .and_then(|value| value.to_str().ok())
        .ok_or_else(|| {
            error_response(
                StatusCode::UNAUTHORIZED,
                "unauthorized",
                "Missing authorization header",
            )
        })?;

    let token = auth_header.strip_prefix("Bearer ").ok_or_else(|| {
        error_response(
            StatusCode::UNAUTHORIZED,
            "unauthorized",
            "Invalid authorization format",
        )
    })?;

    let user_id = state
        .auth_service()
        .verify_token(token)
        .await
        .map_err(|_| error_response(StatusCode::UNAUTHORIZED, "unauthorized", "Invalid token"))?;

    // Check auth: User must be workspace member with Read permission on Member resource
    let membership = state
        .member_service()
        .get_membership_by_workspace_and_user(&workspace_id, &user_id)
        .map_err(|_| error_response(StatusCode::FORBIDDEN, "forbidden", "Access denied"))?;

    if !membership.has_permission(&Permission::new(ResourceType::Member, ActionType::Read)) {
        return Err(error_response(
            StatusCode::FORBIDDEN,
            "forbidden",
            "Insufficient permissions to list members",
        ));
    }

    // Get all workspace members
    let memberships = state.member_service().list_workspace_members(&workspace_id);

    // Build responses with user details
    let mut responses = Vec::new();
    for m in memberships {
        // Try to get user details from auth service
        let (name, email) = if let Some(user) = state.find_user_by_id(&m.user_id).await {
            (user.name, user.email)
        } else {
            (m.user_id.clone(), String::new())
        };
        responses.push(MemberResponse::from_membership(&m, name, email));
    }

    Ok(Json(responses))
}

async fn invite_member(
    State(state): State<AppState>,
    Path(workspace_id): Path<String>,
    headers: HeaderMap,
    Json(request): Json<InviteMemberRequest>,
) -> Result<(StatusCode, Json<MemberResponse>), (StatusCode, Json<ErrorResponse>)> {
    // Extract and verify token from headers
    let auth_header = headers
        .get("authorization")
        .and_then(|value| value.to_str().ok())
        .ok_or_else(|| {
            error_response(
                StatusCode::UNAUTHORIZED,
                "unauthorized",
                "Missing authorization header",
            )
        })?;

    let token = auth_header.strip_prefix("Bearer ").ok_or_else(|| {
        error_response(
            StatusCode::UNAUTHORIZED,
            "unauthorized",
            "Invalid authorization format",
        )
    })?;

    let user_id = state
        .auth_service()
        .verify_token(token)
        .await
        .map_err(|_| error_response(StatusCode::UNAUTHORIZED, "unauthorized", "Invalid token"))?;

    // Check auth: User must have Create permission on Member resource
    let membership = state
        .member_service()
        .get_membership_by_workspace_and_user(&workspace_id, &user_id)
        .map_err(|_| error_response(StatusCode::FORBIDDEN, "forbidden", "Access denied"))?;

    if !membership.has_permission(&Permission::new(ResourceType::Member, ActionType::Create)) {
        return Err(error_response(
            StatusCode::FORBIDDEN,
            "forbidden",
            "Insufficient permissions to invite members",
        ));
    }

    // Find user by email
    let target_user = state
        .find_user_by_email(&request.email)
        .await
        .ok_or_else(|| error_response(StatusCode::NOT_FOUND, "not_found", "User not found"))?;

    // Create new membership
    let input = CreateMembershipInput {
        workspace_id: workspace_id.clone(),
        user_id: target_user.id.clone(),
        role: request.role,
        invited_by: Some(user_id.clone()),
    };

    let new_membership = state
        .member_service()
        .invite_member(input)
        .map_err(|e| match e {
            MemberServiceError::AlreadyMember { .. } => {
                error_response(StatusCode::CONFLICT, "conflict", "User is already a member")
            }
            _ => error_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                "internal_error",
                "Failed to invite member",
            ),
        })?;

    let response =
        MemberResponse::from_membership(&new_membership, target_user.name, target_user.email);

    Ok((StatusCode::CREATED, Json(response)))
}

async fn update_role(
    State(state): State<AppState>,
    Path((workspace_id, member_id)): Path<(String, String)>,
    headers: HeaderMap,
    Json(request): Json<UpdateRoleRequest>,
) -> Result<StatusCode, (StatusCode, Json<ErrorResponse>)> {
    // Extract and verify token from headers
    let auth_header = headers
        .get("authorization")
        .and_then(|value| value.to_str().ok())
        .ok_or_else(|| {
            error_response(
                StatusCode::UNAUTHORIZED,
                "unauthorized",
                "Missing authorization header",
            )
        })?;

    let token = auth_header.strip_prefix("Bearer ").ok_or_else(|| {
        error_response(
            StatusCode::UNAUTHORIZED,
            "unauthorized",
            "Invalid authorization format",
        )
    })?;

    let user_id = state
        .auth_service()
        .verify_token(token)
        .await
        .map_err(|_| error_response(StatusCode::UNAUTHORIZED, "unauthorized", "Invalid token"))?;

    // Check auth: User must have Update permission on Member resource
    let membership = state
        .member_service()
        .get_membership_by_workspace_and_user(&workspace_id, &user_id)
        .map_err(|_| error_response(StatusCode::FORBIDDEN, "forbidden", "Access denied"))?;

    if !membership.has_permission(&Permission::new(ResourceType::Member, ActionType::Update)) {
        return Err(error_response(
            StatusCode::FORBIDDEN,
            "forbidden",
            "Insufficient permissions to update member roles",
        ));
    }

    // Get the target membership
    let target_membership = state
        .member_service()
        .get_membership(&member_id)
        .map_err(|_| error_response(StatusCode::NOT_FOUND, "not_found", "Member not found"))?;

    // Prevent changing own role
    if target_membership.user_id == user_id {
        return Err(error_response(
            StatusCode::FORBIDDEN,
            "forbidden",
            "Cannot change your own role",
        ));
    }

    // Prevent changing Owner's role
    if target_membership.role == WorkspaceRole::Owner {
        return Err(error_response(
            StatusCode::FORBIDDEN,
            "forbidden",
            "Cannot change the workspace owner's role",
        ));
    }

    // Update role
    let input = UpdateRoleInput {
        membership_id: member_id,
        new_role: request.role,
        updated_by: user_id,
    };

    state.member_service().update_role(input).map_err(|_| {
        error_response(
            StatusCode::INTERNAL_SERVER_ERROR,
            "internal_error",
            "Failed to update role",
        )
    })?;

    Ok(StatusCode::OK)
}

async fn remove_member(
    State(state): State<AppState>,
    Path((workspace_id, member_id)): Path<(String, String)>,
    headers: HeaderMap,
) -> Result<StatusCode, (StatusCode, Json<ErrorResponse>)> {
    // Extract and verify token from headers
    let auth_header = headers
        .get("authorization")
        .and_then(|value| value.to_str().ok())
        .ok_or_else(|| {
            error_response(
                StatusCode::UNAUTHORIZED,
                "unauthorized",
                "Missing authorization header",
            )
        })?;

    let token = auth_header.strip_prefix("Bearer ").ok_or_else(|| {
        error_response(
            StatusCode::UNAUTHORIZED,
            "unauthorized",
            "Invalid authorization format",
        )
    })?;

    let user_id = state
        .auth_service()
        .verify_token(token)
        .await
        .map_err(|_| error_response(StatusCode::UNAUTHORIZED, "unauthorized", "Invalid token"))?;

    // Check auth: User must have Delete permission on Member resource
    let membership = state
        .member_service()
        .get_membership_by_workspace_and_user(&workspace_id, &user_id)
        .map_err(|_| error_response(StatusCode::FORBIDDEN, "forbidden", "Access denied"))?;

    if !membership.has_permission(&Permission::new(ResourceType::Member, ActionType::Delete)) {
        return Err(error_response(
            StatusCode::FORBIDDEN,
            "forbidden",
            "Insufficient permissions to remove members",
        ));
    }

    // Get the target membership
    let target_membership = state
        .member_service()
        .get_membership(&member_id)
        .map_err(|_| error_response(StatusCode::NOT_FOUND, "not_found", "Member not found"))?;

    // Prevent removing self
    if target_membership.user_id == user_id {
        return Err(error_response(
            StatusCode::FORBIDDEN,
            "forbidden",
            "Cannot remove yourself from the workspace",
        ));
    }

    // Prevent removing Owner
    if target_membership.role == WorkspaceRole::Owner {
        return Err(error_response(
            StatusCode::FORBIDDEN,
            "forbidden",
            "Cannot remove the workspace owner",
        ));
    }

    // Remove member
    state
        .member_service()
        .remove_member(&member_id)
        .map_err(|_| {
            error_response(
                StatusCode::INTERNAL_SERVER_ERROR,
                "internal_error",
                "Failed to remove member",
            )
        })?;

    Ok(StatusCode::NO_CONTENT)
}
