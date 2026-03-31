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
