use axum::body::Body;
use axum::http::{Request, StatusCode};
use tower::ServiceExt;

use decacan_app::app::wiring::router_for_test;

#[tokio::test]
async fn test_register_endpoint() {
    let app = router_for_test().await;
    
    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/auth/register")
                .header("content-type", "application/json")
                .body(Body::from(r#"{
                    "email": "test@example.com",
                    "password": "Password123",
                    "name": "Test User"
                }"#))
                .unwrap(),
        )
        .await
        .unwrap();
    
    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn test_register_duplicate_email() {
    let app = router_for_test().await;
    
    // First registration
    let _ = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/auth/register")
                .header("content-type", "application/json")
                .body(Body::from(r#"{
                    "email": "dup@example.com",
                    "password": "Password123",
                    "name": "User 1"
                }"#))
                .unwrap(),
        )
        .await
        .unwrap();
    
    // Second registration with same email
    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/auth/register")
                .header("content-type", "application/json")
                .body(Body::from(r#"{
                    "email": "dup@example.com",
                    "password": "Password456",
                    "name": "User 2"
                }"#))
                .unwrap(),
        )
        .await
        .unwrap();
    
    assert_eq!(response.status(), StatusCode::CONFLICT);
}

#[tokio::test]
async fn test_login_endpoint_success() {
    let app = router_for_test().await;
    
    // Register first
    let _ = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/auth/register")
                .header("content-type", "application/json")
                .body(Body::from(r#"{
                    "email": "login@example.com",
                    "password": "Password123",
                    "name": "Test User"
                }"#))
                .unwrap(),
        )
        .await
        .unwrap();
    
    // Login
    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/auth/login")
                .header("content-type", "application/json")
                .body(Body::from(r#"{
                    "email": "login@example.com",
                    "password": "Password123"
                }"#))
                .unwrap(),
        )
        .await
        .unwrap();
    
    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn test_login_endpoint_wrong_password() {
    let app = router_for_test().await;
    
    // Register first
    let _ = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/auth/register")
                .header("content-type", "application/json")
                .body(Body::from(r#"{
                    "email": "login@example.com",
                    "password": "Password123",
                    "name": "Test User"
                }"#))
                .unwrap(),
        )
        .await
        .unwrap();
    
    // Login with wrong password
    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/auth/login")
                .header("content-type", "application/json")
                .body(Body::from(r#"{
                    "email": "login@example.com",
                    "password": "wrongpassword"
                }"#))
                .unwrap(),
        )
        .await
        .unwrap();
    
    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn test_auth_flow_complete() {
    let app = router_for_test().await;
    
    // 1. Register
    let register_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/auth/register")
                .header("content-type", "application/json")
                .body(Body::from(r#"{
                    "email": "flow@example.com",
                    "password": "Password123",
                    "name": "Flow User"
                }"#))
                .unwrap(),
        )
        .await
        .unwrap();
    
    assert_eq!(register_response.status(), StatusCode::OK);
    
    // Extract token from response
    let body_bytes = axum::body::to_bytes(register_response.into_body(), usize::MAX)
        .await
        .unwrap();
    let body_str = String::from_utf8(body_bytes.to_vec()).unwrap();
    let json: serde_json::Value = serde_json::from_str(&body_str).unwrap();
    let access_token = json["access_token"].as_str().unwrap();
    
    // 2. Use token to access protected endpoint (if any)
    // For now, just verify token is returned
    assert!(!access_token.is_empty());
    
    // 3. Login again
    let login_response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/auth/login")
                .header("content-type", "application/json")
                .body(Body::from(r#"{
                    "email": "flow@example.com",
                    "password": "Password123"
                }"#))
                .unwrap(),
        )
        .await
        .unwrap();
    
    assert_eq!(login_response.status(), StatusCode::OK);
}

#[tokio::test]
async fn test_logout_endpoint() {
    let app = router_for_test().await;
    
    // 1. Register
    let register_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/auth/register")
                .header("content-type", "application/json")
                .body(Body::from(r#"{
                    "email": "logout@example.com",
                    "password": "Password123",
                    "name": "Logout User"
                }"#))
                .unwrap(),
        )
        .await
        .unwrap();
    
    assert_eq!(register_response.status(), StatusCode::OK);
    
    // Extract token
    let body_bytes = axum::body::to_bytes(register_response.into_body(), usize::MAX)
        .await
        .unwrap();
    let body_str = String::from_utf8(body_bytes.to_vec()).unwrap();
    let json: serde_json::Value = serde_json::from_str(&body_str).unwrap();
    let access_token = json["access_token"].as_str().unwrap();
    
    // 2. Logout with token
    let logout_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/auth/logout")
                .header("authorization", format!("Bearer {}", access_token))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    
    assert_eq!(logout_response.status(), StatusCode::NO_CONTENT);
    
    // 3. Try to login again (should still work - logout only revokes sessions)
    let login_response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/auth/login")
                .header("content-type", "application/json")
                .body(Body::from(r#"{
                    "email": "logout@example.com",
                    "password": "Password123"
                }"#))
                .unwrap(),
        )
        .await
        .unwrap();
    
    // Login should succeed - logout doesn't prevent future logins
    assert_eq!(login_response.status(), StatusCode::OK);
}

#[tokio::test]
async fn test_logout_without_token() {
    let app = router_for_test().await;
    
    // Try to logout without token
    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/auth/logout")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    
    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
}
