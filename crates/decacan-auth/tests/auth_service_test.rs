use std::sync::Arc;

use decacan_auth::{AuthService, SqliteUserStorage, AuthError};

#[tokio::test]
async fn test_register_new_user() {
    let storage = Arc::new(SqliteUserStorage::new(":memory:").await.unwrap());
    let auth_service = AuthService::new(storage, "test-secret");
    
    let (user, tokens) = auth_service
        .register("test@example.com", "Password123", "Test User")
        .await
        .unwrap();
    
    assert_eq!(user.email, "test@example.com");
    assert_eq!(user.name, "Test User");
    assert!(!tokens.access_token.is_empty());
    assert!(!tokens.refresh_token.is_empty());
}

#[tokio::test]
async fn test_register_duplicate_email() {
    let storage = Arc::new(SqliteUserStorage::new(":memory:").await.unwrap());
    let auth_service = AuthService::new(storage, "test-secret");
    
    // First registration
    auth_service
        .register("dup@example.com", "Password123", "User 1")
        .await
        .unwrap();
    
    // Second registration with same email
    let result = auth_service
        .register("dup@example.com", "Password456", "User 2")
        .await;
    
    assert!(matches!(result, Err(AuthError::EmailAlreadyExists)));
}

#[tokio::test]
async fn test_register_short_password() {
    let storage = Arc::new(SqliteUserStorage::new(":memory:").await.unwrap());
    let auth_service = AuthService::new(storage, "test-secret");
    
    let result = auth_service
        .register("test@example.com", "1234567", "Test User")
        .await;
    
    assert!(matches!(result, Err(AuthError::Validation(_))));
}

#[tokio::test]
async fn test_login_success() {
    let storage = Arc::new(SqliteUserStorage::new(":memory:").await.unwrap());
    let auth_service = AuthService::new(storage, "test-secret-login-unique-1");
    
    // Register first
    auth_service
        .register("login@example.com", "Password123", "Test User")
        .await
        .unwrap();
    
    // Login
    let (user, tokens) = auth_service
        .login("login@example.com", "Password123")
        .await
        .unwrap();
    
    assert_eq!(user.email, "login@example.com");
    assert!(!tokens.access_token.is_empty());
}

#[tokio::test]
async fn test_login_wrong_password() {
    let storage = Arc::new(SqliteUserStorage::new(":memory:").await.unwrap());
    let auth_service = AuthService::new(storage, "test-secret");
    
    // Register first
    auth_service
        .register("login@example.com", "Password123", "Test User")
        .await
        .unwrap();
    
    // Login with wrong password
    let result = auth_service
        .login("login@example.com", "wrongpassword")
        .await;
    
    assert!(matches!(result, Err(AuthError::InvalidCredentials)));
}

#[tokio::test]
async fn test_login_nonexistent_user() {
    let storage = Arc::new(SqliteUserStorage::new(":memory:").await.unwrap());
    let auth_service = AuthService::new(storage, "test-secret");
    
    let result = auth_service
        .login("nonexistent@example.com", "Password123")
        .await;
    
    assert!(matches!(result, Err(AuthError::InvalidCredentials)));
}

#[tokio::test]
async fn test_verify_token_success() {
    let storage = Arc::new(SqliteUserStorage::new(":memory:").await.unwrap());
    let auth_service = AuthService::new(storage, "test-secret-verify-unique-2");
    
    // Register and get token
    let (user, tokens) = auth_service
        .register("test@example.com", "Password123", "Test User")
        .await
        .unwrap();
    
    // Verify token
    let verified_user_id = auth_service
        .verify_token(&tokens.access_token)
        .await
        .unwrap();
    
    assert_eq!(verified_user_id, user.id);
}

#[tokio::test]
async fn test_verify_invalid_token() {
    let storage = Arc::new(SqliteUserStorage::new(":memory:").await.unwrap());
    let auth_service = AuthService::new(storage, "test-secret");
    
    let result = auth_service
        .verify_token("invalid.token.here")
        .await;
    
    assert!(matches!(result, Err(AuthError::InvalidToken)));
}

#[tokio::test]
async fn test_register_password_missing_uppercase() {
    let storage = Arc::new(SqliteUserStorage::new(":memory:").await.unwrap());
    let auth_service = AuthService::new(storage, "test-secret");
    
    let result = auth_service
        .register("test@example.com", "password123", "Test User")
        .await;
    
    assert!(matches!(result, Err(AuthError::Validation(_))));
}

#[tokio::test]
async fn test_register_password_missing_digit() {
    let storage = Arc::new(SqliteUserStorage::new(":memory:").await.unwrap());
    let auth_service = AuthService::new(storage, "test-secret");
    
    let result = auth_service
        .register("test@example.com", "PasswordOnly", "Test User")
        .await;
    
    assert!(matches!(result, Err(AuthError::Validation(_))));
}
