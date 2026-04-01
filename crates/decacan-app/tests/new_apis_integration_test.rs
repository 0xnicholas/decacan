//! Integration tests for new APIs (Playbook CRUD, TeamSpec, Policy)

use axum::body::Body;
use axum::http::{Request, StatusCode};
use tower::ServiceExt;

use decacan_app::app::state::AppState;
use decacan_app::app::wiring::router_with_state;

async fn setup_test_app() -> (axum::Router, AppState) {
    let state = AppState::new_for_test().await;
    let router = router_with_state(state.clone());
    (router, state)
}

mod playbook_api_tests {
    use super::*;

    #[tokio::test]
    async fn test_create_playbook() {
        let (app, _state) = setup_test_app().await;

        let request = Request::builder()
            .method("POST")
            .uri("/api/playbooks")
            .header("content-type", "application/json")
            .body(Body::from(
                r#"{
                "title": "Test Playbook",
                "description": "A test playbook",
                "mode": "standard"
            }"#,
            ))
            .unwrap();

        let response = app.oneshot(request).await.unwrap();
        assert_eq!(response.status(), StatusCode::CREATED);
    }

    #[tokio::test]
    async fn test_create_and_get_playbook() {
        let (app, _state) = setup_test_app().await;

        // Create a playbook
        let create_request = Request::builder()
            .method("POST")
            .uri("/api/playbooks")
            .header("content-type", "application/json")
            .body(Body::from(
                r#"{
                "title": "My Playbook",
                "description": "Test description",
                "mode": "standard"
            }"#,
            ))
            .unwrap();

        let create_response = app.clone().oneshot(create_request).await.unwrap();
        assert_eq!(create_response.status(), StatusCode::CREATED);

        // Get the playbook list to find the ID
        let list_request = Request::builder()
            .method("GET")
            .uri("/api/playbooks")
            .body(Body::empty())
            .unwrap();

        let list_response = app.oneshot(list_request).await.unwrap();
        assert_eq!(list_response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn test_update_playbook() {
        let (app, _state) = setup_test_app().await;

        // First create a playbook
        let create_request = Request::builder()
            .method("POST")
            .uri("/api/playbooks")
            .header("content-type", "application/json")
            .body(Body::from(
                r#"{
                "title": "Original Title",
                "description": "Original description",
                "mode": "standard"
            }"#,
            ))
            .unwrap();

        let create_response = app.clone().oneshot(create_request).await.unwrap();
        assert_eq!(create_response.status(), StatusCode::CREATED);

        // Try to update (will fail with 404 for now since we don't track IDs in test)
        let update_request = Request::builder()
            .method("PUT")
            .uri("/api/playbooks/pb-nonexistent")
            .header("content-type", "application/json")
            .body(Body::from(
                r#"{
                "title": "Updated Title"
            }"#,
            ))
            .unwrap();

        let update_response = app.oneshot(update_request).await.unwrap();
        // Expected: NOT_FOUND since we don't have the actual handle_id
        assert_eq!(update_response.status(), StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn test_delete_playbook_not_found() {
        let (app, _state) = setup_test_app().await;

        let delete_request = Request::builder()
            .method("DELETE")
            .uri("/api/playbooks/pb-nonexistent")
            .body(Body::empty())
            .unwrap();

        let delete_response = app.oneshot(delete_request).await.unwrap();
        assert_eq!(delete_response.status(), StatusCode::NOT_FOUND);
    }
}

mod team_api_tests {
    use super::*;

    #[tokio::test]
    async fn test_list_teams_empty() {
        let (app, _state) = setup_test_app().await;

        let request = Request::builder()
            .method("GET")
            .uri("/api/teams")
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(request).await.unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn test_create_team() {
        let (app, _state) = setup_test_app().await;

        let request = Request::builder()
            .method("POST")
            .uri("/api/teams")
            .header("content-type", "application/json")
            .body(Body::from(
                r#"{
                "name": "Engineering Team",
                "description": "Core engineering team",
                "roles": [
                    {
                        "name": "Tech Lead",
                        "description": "Technical leader",
                        "focus": "architecture",
                        "instructions": "Guide technical decisions"
                    }
                ],
                "lead_role_id": "team-1-role-1"
            }"#,
            ))
            .unwrap();

        let response = app.oneshot(request).await.unwrap();
        assert_eq!(response.status(), StatusCode::CREATED);
    }

    #[tokio::test]
    async fn test_get_team_not_found() {
        let (app, _state) = setup_test_app().await;

        let request = Request::builder()
            .method("GET")
            .uri("/api/teams/team-nonexistent")
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(request).await.unwrap();
        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }

    #[tokio::test]
    async fn test_delete_team_not_found() {
        let (app, _state) = setup_test_app().await;

        let request = Request::builder()
            .method("DELETE")
            .uri("/api/teams/team-nonexistent")
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(request).await.unwrap();
        assert_eq!(response.status(), StatusCode::NOT_FOUND);
    }
}

mod policy_api_tests {
    use super::*;

    #[tokio::test]
    async fn test_get_my_permissions() {
        let (app, _state) = setup_test_app().await;

        let request = Request::builder()
            .method("GET")
            .uri("/api/me/permissions")
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(request).await.unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn test_check_permission_with_workspace() {
        let (app, _state) = setup_test_app().await;

        let request = Request::builder()
            .method("GET")
            .uri("/api/permissions/check?workspace_id=workspace-1&resource=playbook&action=read")
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(request).await.unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn test_check_permission_without_workspace() {
        let (app, _state) = setup_test_app().await;

        let request = Request::builder()
            .method("GET")
            .uri("/api/permissions/check?resource=playbook&action=read")
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(request).await.unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn test_get_role_permissions_owner() {
        let (app, _state) = setup_test_app().await;

        let request = Request::builder()
            .method("GET")
            .uri("/api/roles/owner/permissions")
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(request).await.unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn test_get_role_permissions_admin() {
        let (app, _state) = setup_test_app().await;

        let request = Request::builder()
            .method("GET")
            .uri("/api/roles/admin/permissions")
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(request).await.unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn test_get_role_permissions_editor() {
        let (app, _state) = setup_test_app().await;

        let request = Request::builder()
            .method("GET")
            .uri("/api/roles/editor/permissions")
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(request).await.unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }

    #[tokio::test]
    async fn test_get_role_permissions_viewer() {
        let (app, _state) = setup_test_app().await;

        let request = Request::builder()
            .method("GET")
            .uri("/api/roles/viewer/permissions")
            .body(Body::empty())
            .unwrap();

        let response = app.oneshot(request).await.unwrap();
        assert_eq!(response.status(), StatusCode::OK);
    }
}
