use axum::body::Body;
use axum::http::{Request, StatusCode};
use tower::ServiceExt;

use decacan_app::app::state::AppState;
use decacan_app::app::wiring::router_with_state;

#[tokio::test]
async fn create_assistant_delegation_returns_session_and_team_snapshot() {
    let state = AppState::new_for_test().await;
    let app = router_with_state(state);

    let request = Request::builder()
        .method("POST")
        .uri("/api/assistant-sessions")
        .header("content-type", "application/json")
        .body(Body::from(
            r#"{
              "workspace_id": "workspace-1",
              "objective": {"title": "Prepare launch brief", "user_goal": "Create a brief"},
              "execution_mode": "interactive"
            }"#,
        ))
        .unwrap();

    let response = app.oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::CREATED);
}

#[tokio::test]
async fn creating_a_second_active_delegation_for_the_same_session_is_rejected() {
    let state = AppState::new_for_test().await;
    let app = router_with_state(state);

    let create_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/assistant-sessions")
                .header("content-type", "application/json")
                .body(Body::from(
                    r#"{
                      "workspace_id": "workspace-1",
                      "objective": {"title": "Prepare launch brief", "user_goal": "Create a brief"},
                      "execution_mode": "interactive"
                    }"#,
                ))
                .unwrap(),
        )
        .await
        .unwrap();

    assert_eq!(create_response.status(), StatusCode::CREATED);

    let body = axum::body::to_bytes(create_response.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    let assistant_session_id = json["assistant_session_id"].as_str().unwrap();

    let second_request = Request::builder()
        .method("POST")
        .uri(format!(
            "/api/assistant-sessions/{assistant_session_id}/delegations"
        ))
        .header("content-type", "application/json")
        .body(Body::from(
            r#"{
              "workspace_id": "workspace-1",
              "objective": {"title": "Prepare launch brief", "user_goal": "Create a brief"},
              "execution_mode": "interactive"
            }"#,
        ))
        .unwrap();

    let second_response = app.oneshot(second_request).await.unwrap();
    assert_eq!(second_response.status(), StatusCode::CONFLICT);
}

#[tokio::test]
async fn get_assistant_session_returns_persisted_session() {
    let state = AppState::new_for_test().await;
    let app = router_with_state(state);

    let create_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/assistant-sessions")
                .header("content-type", "application/json")
                .body(Body::from(
                    r#"{
                      "workspace_id": "workspace-1",
                      "objective": {"title": "Prepare launch brief", "user_goal": "Create a brief"},
                      "execution_mode": "interactive"
                    }"#,
                ))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(create_response.status(), StatusCode::CREATED);
    let body = axum::body::to_bytes(create_response.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    let assistant_session_id = json["assistant_session_id"].as_str().unwrap();

    let get_response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri(format!("/api/assistant-sessions/{assistant_session_id}"))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(get_response.status(), StatusCode::OK);
}

#[tokio::test]
async fn workspace_home_exposes_latest_assistant_session_summary() {
    let state = AppState::new_for_test().await;
    let app = router_with_state(state);

    let create_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/assistant-sessions")
                .header("content-type", "application/json")
                .body(Body::from(
                    r#"{
                      "workspace_id": "workspace-1",
                      "objective": {"title": "Prepare launch brief", "user_goal": "Create a brief"},
                      "execution_mode": "interactive"
                    }"#,
                ))
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(create_response.status(), StatusCode::CREATED);

    let home_response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/api/workspaces/workspace-1/home")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(home_response.status(), StatusCode::OK);
    let body = axum::body::to_bytes(home_response.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    assert!(json.get("assistant_session").is_some());
    assert_eq!(json["assistant_session"]["state"], "active");
}
