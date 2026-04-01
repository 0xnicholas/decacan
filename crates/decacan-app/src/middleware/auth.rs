use axum::{
    extract::{FromRequestParts, Request, State},
    http::request::Parts,
    http::StatusCode,
    middleware::Next,
    response::IntoResponse,
};

use crate::app::state::AppState;

/// 当前认证用户信息
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct CurrentUser {
    pub user_id: String,
    pub default_workspace_id: String,
}

impl CurrentUser {
    pub fn from_state(state: &AppState, user_id: String) -> Self {
        Self {
            user_id,
            default_workspace_id: state.default_workspace_id(),
        }
    }
}

#[axum::async_trait]
impl FromRequestParts<AppState> for CurrentUser {
    type Rejection = StatusCode;

    async fn from_request_parts(
        parts: &mut Parts,
        _state: &AppState,
    ) -> Result<Self, Self::Rejection> {
        if let Some(current_user) = parts.extensions.get::<CurrentUser>() {
            return Ok(current_user.clone());
        }

        Err(StatusCode::UNAUTHORIZED)
    }
}

/// JWT 认证中间件
///
/// 从 Authorization header 提取 Bearer token，验证后注入 CurrentUser
pub async fn auth_middleware(
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Result<impl IntoResponse, StatusCode> {
    // 提取 Authorization header
    let auth_header = request
        .headers()
        .get("authorization")
        .and_then(|value| value.to_str().ok())
        .ok_or(StatusCode::UNAUTHORIZED)?;

    // 提取 Bearer token
    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or(StatusCode::UNAUTHORIZED)?;

    // 验证 token
    let user_id = state
        .auth_service()
        .verify_token(token)
        .await
        .map_err(|_| StatusCode::UNAUTHORIZED)?;

    // 将用户信息附加到请求扩展
    request
        .extensions_mut()
        .insert(CurrentUser::from_state(&state, user_id));

    Ok(next.run(request).await)
}

/// 可选的认证中间件
///
/// 如果提供了 token 则验证，否则继续执行（user_id 为 None）
pub async fn optional_auth_middleware(
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> impl IntoResponse {
    // 安全地异步提取和验证 token
    let token = request
        .headers()
        .get("authorization")
        .and_then(|value| value.to_str().ok())
        .and_then(|header| header.strip_prefix("Bearer "))
        .map(|t| t.to_string());

    // 异步验证 token（如果有的话）
    let user_id = if let Some(token) = token {
        state.auth_service().verify_token(&token).await.ok()
    } else {
        None
    };

    if let Some(uid) = user_id {
        request
            .extensions_mut()
            .insert(CurrentUser::from_state(&state, uid));
    }

    next.run(request).await
}
