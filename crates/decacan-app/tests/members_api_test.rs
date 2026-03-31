use axum::body::Body;
use axum::http::{Request, StatusCode};
use tower::ServiceExt;

use decacan_app::app::wiring::router_for_test;

/// Helper function to register a user and return their token
async fn register_user(
    app: &axum::Router,
    email: &str,
    password: &str,
    name: &str,
) -> (String, String) {
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/auth/register")
                .header("content-type", "application/json")
                .body(Body::from(format!(
                    r#"{{"email": "{}", "password": "{}", "name": "{}"}}"#,
                    email, password, name
                )))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body_bytes = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    let token = json["access_token"].as_str().unwrap().to_string();
    let user_id = json["user_id"].as_str().unwrap().to_string();

    (token, user_id)
}

/// Helper function to login and return token
async fn login_user(app: &axum::Router, email: &str, password: &str) -> String {
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/auth/login")
                .header("content-type", "application/json")
                .body(Body::from(format!(
                    r#"{{"email": "{}", "password": "{}"}}"#,
                    email, password
                )))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    let body_bytes = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    json["access_token"].as_str().unwrap().to_string()
}

#[tokio::test]
async fn test_list_members_requires_auth() {
    let app = router_for_test().await;

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/workspaces/workspace-1/members")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    // Debug: print the actual response
    let status = response.status();
    let body_bytes = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .unwrap();
    let body_str = String::from_utf8(body_bytes.to_vec()).unwrap();
    eprintln!("Response status: {:?}", status);
    eprintln!("Response body: {}", body_str);
    
    assert_eq!(status, StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn test_list_members_success() {
    let app = router_for_test().await;

    // 1. Register a user (this creates a workspace membership automatically via the auth flow)
    let (token, _user_id) = register_user(&app, "owner@example.com", "Password123", "Owner").await;

    // 2. List members with the token
    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/workspaces/workspace-1/members")
                .header("authorization", format!("Bearer {}", token))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::OK);

    // Verify response is a valid JSON array
    let body_bytes = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    assert!(json.is_array());
}

#[tokio::test]
async fn test_invite_member_success() {
    let app = router_for_test().await;

    // 1. Register owner
    let (owner_token, _owner_id) =
        register_user(&app, "owner@example.com", "Password123", "Owner").await;

    // 2. Register member to invite
    let (_member_token, _member_id) = register_user(
        &app,
        "member@example.com",
        "Password123",
        "Member",
    )
    .await;

    // 3. Owner invites member as Editor
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/workspaces/workspace-1/members")
                .header("content-type", "application/json")
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::from(
                    r#"{"email": "member@example.com", "role": "Editor"}"#,
                ))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::CREATED);

    // Verify response structure
    let body_bytes = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    assert!(json["id"].is_string());
    assert!(json["user_id"].is_string());
    assert!(json["email"].is_string());
    assert_eq!(json["email"].as_str().unwrap(), "member@example.com");

    // 4. Verify member is now in workspace by listing members
    let list_response = app
        .oneshot(
            Request::builder()
                .uri("/api/workspaces/workspace-1/members")
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(list_response.status(), StatusCode::OK);

    let list_body = axum::body::to_bytes(list_response.into_body(), usize::MAX)
        .await
        .unwrap();
    let members: Vec<serde_json::Value> = serde_json::from_slice(&list_body).unwrap();

    // Should have owner and member
    assert!(members.len() >= 2);
    let member_emails: Vec<&str> = members
        .iter()
        .filter_map(|m| m["email"].as_str())
        .collect();
    assert!(member_emails.contains(&"member@example.com"));
}

#[tokio::test]
async fn test_invite_member_already_exists() {
    let app = router_for_test().await;

    // 1. Register owner
    let (owner_token, _owner_id) =
        register_user(&app, "owner@example.com", "Password123", "Owner").await;

    // 2. Register member
    let (_member_token, _member_id) = register_user(
        &app,
        "member@example.com",
        "Password123",
        "Member",
    )
    .await;

    // 3. Owner invites member first time
    let first_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/workspaces/workspace-1/members")
                .header("content-type", "application/json")
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::from(
                    r#"{"email": "member@example.com", "role": "Editor"}"#,
                ))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(first_response.status(), StatusCode::CREATED);

    // 4. Try to invite the same member again - should return 409 CONFLICT
    let second_response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/workspaces/workspace-1/members")
                .header("content-type", "application/json")
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::from(
                    r#"{"email": "member@example.com", "role": "Viewer"}"#,
                ))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(second_response.status(), StatusCode::CONFLICT);
}

#[tokio::test]
async fn test_invite_member_user_not_found() {
    let app = router_for_test().await;

    // 1. Register owner
    let (owner_token, _owner_id) =
        register_user(&app, "owner@example.com", "Password123", "Owner").await;

    // 2. Try to invite a non-existent user
    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/workspaces/workspace-1/members")
                .header("content-type", "application/json")
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::from(
                    r#"{"email": "nonexistent@example.com", "role": "Editor"}"#,
                ))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_update_role_success() {
    let app = router_for_test().await;

    // 1. Register owner
    let (owner_token, _owner_id) =
        register_user(&app, "owner@example.com", "Password123", "Owner").await;

    // 2. Register member
    let (_member_token, _member_id) = register_user(
        &app,
        "member@example.com",
        "Password123",
        "Member",
    )
    .await;

    // 3. Owner invites member as Viewer
    let invite_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/workspaces/workspace-1/members")
                .header("content-type", "application/json")
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::from(
                    r#"{"email": "member@example.com", "role": "Viewer"}"#,
                ))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(invite_response.status(), StatusCode::CREATED);

    let body_bytes = axum::body::to_bytes(invite_response.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    let membership_id = json["id"].as_str().unwrap();

    // 4. Owner updates member role to Editor
    let update_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("PUT")
                .uri(format!("/api/workspaces/workspace-1/members/{}", membership_id))
                .header("content-type", "application/json")
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::from(r#"{"role": "Editor"}"#))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(update_response.status(), StatusCode::OK);

    // 5. Verify role change by listing members
    let list_response = app
        .oneshot(
            Request::builder()
                .uri("/api/workspaces/workspace-1/members")
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    let list_body = axum::body::to_bytes(list_response.into_body(), usize::MAX)
        .await
        .unwrap();
    let members: Vec<serde_json::Value> = serde_json::from_slice(&list_body).unwrap();

    let member = members
        .iter()
        .find(|m| m["email"].as_str() == Some("member@example.com"))
        .expect("Member should exist");
    assert_eq!(member["role"].as_str().unwrap(), "Editor");
}

#[tokio::test]
async fn test_update_role_prevents_self_update() {
    let app = router_for_test().await;

    // 1. Register owner
    let (owner_token, owner_id) =
        register_user(&app, "owner@example.com", "Password123", "Owner").await;

    // 2. List members to find owner's membership ID
    let list_response = app
        .clone()
        .oneshot(
            Request::builder()
                .uri("/api/workspaces/workspace-1/members")
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    let list_body = axum::body::to_bytes(list_response.into_body(), usize::MAX)
        .await
        .unwrap();
    let members: Vec<serde_json::Value> = serde_json::from_slice(&list_body).unwrap();

    let owner_membership = members
        .iter()
        .find(|m| m["user_id"].as_str() == Some(&owner_id))
        .expect("Owner should be in members list");
    let membership_id = owner_membership["id"].as_str().unwrap();

    // 3. Try to update own role - should return 403 FORBIDDEN
    let response = app
        .oneshot(
            Request::builder()
                .method("PUT")
                .uri(format!("/api/workspaces/workspace-1/members/{}", membership_id))
                .header("content-type", "application/json")
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::from(r#"{"role": "Editor"}"#))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::FORBIDDEN);
}

#[tokio::test]
async fn test_update_role_prevents_owner_role_update() {
    let app = router_for_test().await;

    // 1. Register two users - first will be owner
    let (owner_token, _owner_id) =
        register_user(&app, "owner@example.com", "Password123", "Owner").await;

    // 2. Register second user and invite them
    // First, we need to check if we can invite someone as Owner
    // For now, let's test that we can't change Owner's role via update

    // List members to find the owner membership
    let list_response = app
        .clone()
        .oneshot(
            Request::builder()
                .uri("/api/workspaces/workspace-1/members")
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    let list_body = axum::body::to_bytes(list_response.into_body(), usize::MAX)
        .await
        .unwrap();
    let members: Vec<serde_json::Value> = serde_json::from_slice(&list_body).unwrap();

    let owner_membership = members
        .iter()
        .find(|m| m["role"].as_str() == Some("Owner"))
        .expect("Owner should exist");
    let membership_id = owner_membership["id"].as_str().unwrap();

    // Try to change Owner's role - should be forbidden
    let response = app
        .oneshot(
            Request::builder()
                .method("PUT")
                .uri(format!("/api/workspaces/workspace-1/members/{}", membership_id))
                .header("content-type", "application/json")
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::from(r#"{"role": "Editor"}"#))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::FORBIDDEN);
}

#[tokio::test]
async fn test_remove_member_success() {
    let app = router_for_test().await;

    // 1. Register owner
    let (owner_token, _owner_id) =
        register_user(&app, "owner@example.com", "Password123", "Owner").await;

    // 2. Register member
    let (_member_token, _member_id) = register_user(
        &app,
        "member@example.com",
        "Password123",
        "Member",
    )
    .await;

    // 3. Owner invites member
    let invite_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/workspaces/workspace-1/members")
                .header("content-type", "application/json")
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::from(
                    r#"{"email": "member@example.com", "role": "Editor"}"#,
                ))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(invite_response.status(), StatusCode::CREATED);

    let body_bytes = axum::body::to_bytes(invite_response.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body_bytes).unwrap();
    let membership_id = json["id"].as_str().unwrap();

    // 4. Owner removes member
    let remove_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("DELETE")
                .uri(format!("/api/workspaces/workspace-1/members/{}", membership_id))
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(remove_response.status(), StatusCode::NO_CONTENT);

    // 5. Verify member is removed by listing members
    let list_response = app
        .oneshot(
            Request::builder()
                .uri("/api/workspaces/workspace-1/members")
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    let list_body = axum::body::to_bytes(list_response.into_body(), usize::MAX)
        .await
        .unwrap();
    let members: Vec<serde_json::Value> = serde_json::from_slice(&list_body).unwrap();

    let member_emails: Vec<&str> = members
        .iter()
        .filter_map(|m| m["email"].as_str())
        .collect();
    assert!(!member_emails.contains(&"member@example.com"));
}

#[tokio::test]
async fn test_remove_member_prevents_self_removal() {
    let app = router_for_test().await;

    // 1. Register owner
    let (owner_token, owner_id) =
        register_user(&app, "owner@example.com", "Password123", "Owner").await;

    // 2. List members to find owner's membership ID
    let list_response = app
        .clone()
        .oneshot(
            Request::builder()
                .uri("/api/workspaces/workspace-1/members")
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    let list_body = axum::body::to_bytes(list_response.into_body(), usize::MAX)
        .await
        .unwrap();
    let members: Vec<serde_json::Value> = serde_json::from_slice(&list_body).unwrap();

    let owner_membership = members
        .iter()
        .find(|m| m["user_id"].as_str() == Some(&owner_id))
        .expect("Owner should be in members list");
    let membership_id = owner_membership["id"].as_str().unwrap();

    // 3. Try to remove self - should return 403 FORBIDDEN
    let response = app
        .oneshot(
            Request::builder()
                .method("DELETE")
                .uri(format!("/api/workspaces/workspace-1/members/{}", membership_id))
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::FORBIDDEN);
}

#[tokio::test]
async fn test_remove_member_prevents_owner_removal() {
    let app = router_for_test().await;

    // 1. Register two users
    let (owner_token, _owner_id) =
        register_user(&app, "owner@example.com", "Password123", "Owner").await;

    // 2. Register another user and invite them
    let (_editor_token, _editor_id) = register_user(
        &app,
        "editor@example.com",
        "Password123",
        "Editor",
    )
    .await;

    // Owner invites editor
    let _invite_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/workspaces/workspace-1/members")
                .header("content-type", "application/json")
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::from(
                    r#"{"email": "editor@example.com", "role": "Editor"}"#,
                ))
                .unwrap(),
        )
        .await
        .unwrap();

    // 3. List members to find owner membership ID
    let list_response = app
        .clone()
        .oneshot(
            Request::builder()
                .uri("/api/workspaces/workspace-1/members")
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    let list_body = axum::body::to_bytes(list_response.into_body(), usize::MAX)
        .await
        .unwrap();
    let members: Vec<serde_json::Value> = serde_json::from_slice(&list_body).unwrap();

    let owner_membership = members
        .iter()
        .find(|m| m["role"].as_str() == Some("Owner"))
        .expect("Owner should exist");
    let membership_id = owner_membership["id"].as_str().unwrap();

    // Even as an editor, try to remove the owner (this requires Delete permission)
    // Actually, let me login as editor and try to remove owner
    let editor_token = login_user(&app, "editor@example.com", "Password123").await;

    let response = app
        .oneshot(
            Request::builder()
                .method("DELETE")
                .uri(format!("/api/workspaces/workspace-1/members/{}", membership_id))
                .header("authorization", format!("Bearer {}", editor_token))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    // Should be forbidden because target is owner
    assert_eq!(response.status(), StatusCode::FORBIDDEN);
}

#[tokio::test]
async fn test_viewer_cannot_invite_members() {
    let app = router_for_test().await;

    // 1. Register owner
    let (owner_token, _owner_id) =
        register_user(&app, "owner@example.com", "Password123", "Owner").await;

    // 2. Register viewer
    let (_viewer_token, _viewer_id) = register_user(
        &app,
        "viewer@example.com",
        "Password123",
        "Viewer",
    )
    .await;

    // 3. Owner invites viewer as Viewer role
    let _invite_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/workspaces/workspace-1/members")
                .header("content-type", "application/json")
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::from(
                    r#"{"email": "viewer@example.com", "role": "Viewer"}"#,
                ))
                .unwrap(),
        )
        .await
        .unwrap();

    // 4. Register another user to try to invite
    let (_target_token, _target_id) = register_user(
        &app,
        "target@example.com",
        "Password123",
        "Target",
    )
    .await;

    // 5. Viewer tries to invite the target user - should return 403 FORBIDDEN
    let viewer_token = login_user(&app, "viewer@example.com", "Password123").await;

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/workspaces/workspace-1/members")
                .header("content-type", "application/json")
                .header("authorization", format!("Bearer {}", viewer_token))
                .body(Body::from(
                    r#"{"email": "target@example.com", "role": "Viewer"}"#,
                ))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::FORBIDDEN);
}

#[tokio::test]
async fn test_editor_can_invite_members() {
    let app = router_for_test().await;

    // 1. Register owner
    let (owner_token, _owner_id) =
        register_user(&app, "owner@example.com", "Password123", "Owner").await;

    // 2. Register editor
    let (_editor_token, _editor_id) = register_user(
        &app,
        "editor@example.com",
        "Password123",
        "Editor",
    )
    .await;

    // 3. Owner invites editor as Editor role
    let _invite_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/workspaces/workspace-1/members")
                .header("content-type", "application/json")
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::from(
                    r#"{"email": "editor@example.com", "role": "Editor"}"#,
                ))
                .unwrap(),
        )
        .await
        .unwrap();

    // 4. Register target user
    let (_target_token, _target_id) = register_user(
        &app,
        "target@example.com",
        "Password123",
        "Target",
    )
    .await;

    // 5. Editor tries to invite target user - Editor should have Create permission
    let editor_token = login_user(&app, "editor@example.com", "Password123").await;

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/workspaces/workspace-1/members")
                .header("content-type", "application/json")
                .header("authorization", format!("Bearer {}", editor_token))
                .body(Body::from(
                    r#"{"email": "target@example.com", "role": "Viewer"}"#,
                ))
                .unwrap(),
        )
        .await
        .unwrap();

    // Editor should be able to invite (has Create permission)
    assert_eq!(response.status(), StatusCode::CREATED);
}

#[tokio::test]
async fn test_list_members_not_workspace_member() {
    let app = router_for_test().await;

    // 1. Register a user
    let (token, _user_id) = register_user(
        &app, "user@example.com", "Password123", "User").await;

    // 2. Try to list members of a non-existent workspace
    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/workspaces/nonexistent-workspace/members")
                .header("authorization", format!("Bearer {}", token))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    // Should be forbidden because user is not a member of this workspace
    assert_eq!(response.status(), StatusCode::FORBIDDEN);
}

#[tokio::test]
async fn test_update_role_member_not_found() {
    let app = router_for_test().await;

    // 1. Register owner
    let (owner_token, _owner_id) =
        register_user(&app, "owner@example.com", "Password123", "Owner").await;

    // 2. Try to update role of non-existent member
    let response = app
        .oneshot(
            Request::builder()
                .method("PUT")
                .uri("/api/workspaces/workspace-1/members/nonexistent-id")
                .header("content-type", "application/json")
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::from(r#"{"role": "Editor"}"#))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_remove_member_not_found() {
    let app = router_for_test().await;

    // 1. Register owner
    let (owner_token, _owner_id) =
        register_user(&app, "owner@example.com", "Password123", "Owner").await;

    // 2. Try to remove non-existent member
    let response = app
        .oneshot(
            Request::builder()
                .method("DELETE")
                .uri("/api/workspaces/workspace-1/members/nonexistent-id")
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(response.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn test_viewer_can_list_members() {
    let app = router_for_test().await;

    // 1. Register owner
    let (owner_token, _owner_id) =
        register_user(&app, "owner@example.com", "Password123", "Owner").await;

    // 2. Register viewer
    let (_viewer_token, _viewer_id) = register_user(
        &app,
        "viewer@example.com",
        "Password123",
        "Viewer",
    )
    .await;

    // 3. Owner invites viewer as Viewer role
    let _invite_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/workspaces/workspace-1/members")
                .header("content-type", "application/json")
                .header("authorization", format!("Bearer {}", owner_token))
                .body(Body::from(
                    r#"{"email": "viewer@example.com", "role": "Viewer"}"#,
                ))
                .unwrap(),
        )
        .await
        .unwrap();

    // 4. Viewer should be able to list members (has Read permission)
    let viewer_token = login_user(&app, "viewer@example.com", "Password123").await;

    let response = app
        .oneshot(
            Request::builder()
                .uri("/api/workspaces/workspace-1/members")
                .header("authorization", format!("Bearer {}", viewer_token))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();

    // Viewer should be able to list members
    assert_eq!(response.status(), StatusCode::OK);
}
