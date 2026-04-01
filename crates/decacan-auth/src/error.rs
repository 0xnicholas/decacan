use thiserror::Error;

#[derive(Debug, Error, Clone)]
pub enum AuthError {
    #[error("invalid credentials")]
    InvalidCredentials,
    #[error("email already exists")]
    EmailAlreadyExists,
    #[error("user not found")]
    UserNotFound,
    #[error("invalid token")]
    InvalidToken,
    #[error("token expired")]
    TokenExpired,
    #[error("insufficient permissions")]
    InsufficientPermissions,
    #[error("rate limited - too many attempts, please try again later")]
    RateLimited,
    #[error("validation error: {0}")]
    Validation(String),
    #[error("storage error: {0}")]
    Storage(String),
    #[error("internal error: {0}")]
    Internal(String),
}

pub type AuthResult<T> = Result<T, AuthError>;
