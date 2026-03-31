use axum::{
    extract::State,
    routing::post,
    Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::app::state::AppState;

/// 认证响应 DTO
#[derive(Serialize)]
pub struct AuthResponse {
    pub user_id: String,
    pub email: String,
    pub name: String,
    pub access_token: String,
    pub refresh_token: String,
    pub expires_in: i64,
}

/// 注册请求
#[derive(Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub password: String,
    pub name: String,
}

/// 登录请求
#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

/// 刷新 Token 请求
#[derive(Deserialize)]
pub struct RefreshRequest {
    pub refresh_token: String,
}

/// 错误响应
#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
    pub message: String,
}

/// 创建认证路由
pub fn router() -> Router<AppState> {
    Router::new()
        .route("/auth/register", post(register))
        .route("/auth/login", post(login))
        .route("/auth/refresh", post(refresh_token))
        .route("/auth/logout", post(logout))
}

/// 用户注册
async fn register(
    State(state): State<AppState>,
    Json(req): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>, (axum::http::StatusCode, Json<ErrorResponse>)> {
    let (user, tokens) = state
        .auth_service()
        .register(&req.email, &req.password, &req.name)
        .await
        .map_err(|e| {
            let (status, error_code) = match e {
                decacan_auth::AuthError::EmailAlreadyExists => {
                    (axum::http::StatusCode::CONFLICT, "email_already_exists")
                }
                decacan_auth::AuthError::Validation(_) => {
                    (axum::http::StatusCode::BAD_REQUEST, "validation_error")
                }
                _ => (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "internal_error"),
            };
            
            (status, Json(ErrorResponse {
                error: error_code.to_string(),
                message: e.to_string(),
            }))
        })?;
    
    Ok(Json(AuthResponse {
        user_id: user.id,
        email: user.email,
        name: user.name,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
    }))
}

/// 用户登录
async fn login(
    State(state): State<AppState>,
    Json(req): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, (axum::http::StatusCode, Json<ErrorResponse>)> {
    let (user, tokens) = state
        .auth_service()
        .login(&req.email, &req.password)
        .await
        .map_err(|e| {
            let (status, error_code) = match e {
                decacan_auth::AuthError::InvalidCredentials => {
                    (axum::http::StatusCode::UNAUTHORIZED, "invalid_credentials")
                }
                _ => (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "internal_error"),
            };
            
            (status, Json(ErrorResponse {
                error: error_code.to_string(),
                message: e.to_string(),
            }))
        })?;
    
    Ok(Json(AuthResponse {
        user_id: user.id,
        email: user.email,
        name: user.name,
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
    }))
}

/// 刷新 Access Token
async fn refresh_token(
    State(state): State<AppState>,
    Json(req): Json<RefreshRequest>,
) -> Result<Json<AuthResponse>, (axum::http::StatusCode, Json<ErrorResponse>)> {
    let tokens = state
        .auth_service()
        .refresh_token(&req.refresh_token)
        .await
        .map_err(|e| {
            let (status, error_code) = match e {
                decacan_auth::AuthError::InvalidToken => {
                    (axum::http::StatusCode::UNAUTHORIZED, "invalid_token")
                }
                decacan_auth::AuthError::TokenExpired => {
                    (axum::http::StatusCode::UNAUTHORIZED, "token_expired")
                }
                _ => (axum::http::StatusCode::INTERNAL_SERVER_ERROR, "internal_error"),
            };
            
            (status, Json(ErrorResponse {
                error: error_code.to_string(),
                message: e.to_string(),
            }))
        })?;
    
    // Note: refresh token doesn't return user info, caller should use /me endpoint
    Ok(Json(AuthResponse {
        user_id: "".to_string(),
        email: "".to_string(),
        name: "".to_string(),
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
    }))
}

/// 用户登出
async fn logout(
    State(state): State<AppState>,
    headers: axum::http::HeaderMap,
) -> Result<axum::http::StatusCode, (axum::http::StatusCode, Json<ErrorResponse>)> {
    // 从 header 手动提取 token
    let auth_header = headers
        .get("authorization")
        .and_then(|value| value.to_str().ok())
        .ok_or((
            axum::http::StatusCode::UNAUTHORIZED,
            Json(ErrorResponse {
                error: "unauthorized".to_string(),
                message: "Missing authorization header".to_string(),
            }),
        ))?;

    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or((
            axum::http::StatusCode::UNAUTHORIZED,
            Json(ErrorResponse {
                error: "unauthorized".to_string(),
                message: "Invalid authorization format".to_string(),
            }),
        ))?;

    // 验证 token 获取 user_id
    let user_id = state
        .auth_service()
        .verify_token(token)
        .await
        .map_err(|e| {
            (
                axum::http::StatusCode::UNAUTHORIZED,
                Json(ErrorResponse {
                    error: "unauthorized".to_string(),
                    message: e.to_string(),
                }),
            )
        })?;

    // 执行登出（撤销所有会话）
    state
        .auth_service()
        .logout(&user_id)
        .await
        .map_err(|e| {
            (
                axum::http::StatusCode::INTERNAL_SERVER_ERROR,
                Json(ErrorResponse {
                    error: "logout_error".to_string(),
                    message: e.to_string(),
                }),
            )
        })?;

    Ok(axum::http::StatusCode::NO_CONTENT)
}
