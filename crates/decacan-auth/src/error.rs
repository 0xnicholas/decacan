use thiserror::Error;

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("invalid credentials")]
    InvalidCredentials,
    #[error("email already exists")]
    EmailAlreadyExists,
    #[error("workspace slug already exists")]
    WorkspaceSlugExists,
    #[error("user not found")]
    UserNotFound,
    #[error("workspace not found")]
    WorkspaceNotFound,
    #[error("insufficient permissions")]
    InsufficientPermissions,
    #[error("user already in workspace")]
    UserAlreadyInWorkspace,
    #[error("cannot remove owner")]
    CannotRemoveOwner,
    #[error("invalid token")]
    InvalidToken,
    #[error("token expired")]
    TokenExpired,
    #[error("validation error: {0}")]
    Validation(String),
    #[error("storage error: {0}")]
    Storage(String),
}

pub type AuthResult<T> = Result<T, AuthError>;
