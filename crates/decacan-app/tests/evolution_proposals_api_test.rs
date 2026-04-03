use axum::body::Body;
use axum::http::{Request, StatusCode};
use serde_json::Value;
use tower::ServiceExt;

use decacan_app::app::state::AppState;
use decacan_app::app::wiring::router_with_state;

#[tokio::test]
async fn list_evolution_proposals_returns_ok() {
    let state = AppState::new_for_test().await;
    let app = router_with_state(state);

    let request = Request::builder()
        .method("GET")
        .uri("/api/evolution-proposals")
        .body(Body::empty())
        .unwrap();

    let response = app.oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn patch_evolution_proposal_review_returns_ok() {
    let state = AppState::new_for_test().await;
    let app = router_with_state(state.clone());

    let create_assistant_response = app
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
    assert_eq!(create_assistant_response.status(), StatusCode::CREATED);

    let create_body = axum::body::to_bytes(create_assistant_response.into_body(), usize::MAX)
        .await
        .unwrap();
    let create_json: Value = serde_json::from_slice(&create_body).unwrap();
    let team_session_id = create_json["team_session"]["session_id"].as_str().unwrap();
    let before_version = create_json["team_session"]["snapshot_version"].as_u64().unwrap();

    let request = Request::builder()
        .method("PATCH")
        .uri("/api/evolution-proposals/proposal-1/review")
        .header("content-type", "application/json")
        .body(Body::from(format!(
            r#"{{
              "team_session_id":"{}",
              "title":"Use stricter validator chain",
              "review_state":"approved"
            }}"#,
            team_session_id
        )))
        .unwrap();

    let response = app.clone().oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);

    let list_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("GET")
                .uri(format!(
                    "/api/evolution-proposals?team_session_id={}",
                    team_session_id
                ))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(list_response.status(), StatusCode::OK);

    let list_body = axum::body::to_bytes(list_response.into_body(), usize::MAX)
        .await
        .unwrap();
    let list_json: Value = serde_json::from_slice(&list_body).unwrap();
    assert_eq!(list_json.as_array().unwrap().len(), 1);
    assert_eq!(list_json[0]["review_state"], Value::String("approved".to_owned()));

    let team_session_response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri(format!("/api/team-sessions/{}", team_session_id))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    assert_eq!(team_session_response.status(), StatusCode::OK);
    let session_body = axum::body::to_bytes(team_session_response.into_body(), usize::MAX)
        .await
        .unwrap();
    let session_json: Value = serde_json::from_slice(&session_body).unwrap();
    assert_eq!(
        session_json["snapshot_version"],
        Value::Number(before_version.into())
    );
}
