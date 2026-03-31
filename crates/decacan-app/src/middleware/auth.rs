use axum::{
    extract::{Request, State},
    middleware::Next,
    response::IntoResponse,
    http::StatusCode,
};

use crate::app::state::AppState;

/// 当前认证用户信息
#[derive(Debug, Clone)]
pub struct CurrentUser {
    pub user_id: String,
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
    request.extensions_mut().insert(CurrentUser { user_id });
    
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
    let user_id = request
        .headers()
        .get("authorization")
        .and_then(|value| value.to_str().ok())
        .and_then(|header| header.strip_prefix("Bearer "))
        .and_then(|token| {
            // 使用 block_in_place 避免在异步上下文中执行同步操作
            std::future::block_on(async {
                state.auth_service().verify_token(token).await.ok()
            })
        });
    
    if let Some(uid) = user_id {
        request.extensions_mut().insert(CurrentUser { user_id: uid });
    }
    
    next.run(request).await
}
