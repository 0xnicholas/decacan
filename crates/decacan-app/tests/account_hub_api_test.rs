use axum::body::Body;
use http::{Request, StatusCode};
use serde_json::Value;
use tower::ServiceExt;

#[tokio::test]
async fn account_home_returns_cross_workspace_work_summary() {
    let app = decacan_app::app::wiring::router_for_test().await;

    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/api/account/home")
                .body(Body::empty())
                .expect("request should build"),
        )
        .await
        .expect("router should respond");

    assert_eq!(response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("response body should be readable");
    let json: Value = serde_json::from_slice(&body).expect("response should be json");

    assert!(json.get("default_workspace_id").is_some());
    assert!(json["default_workspace_id"].is_string());
    assert!(json.get("workspaces").is_some());
    assert!(json["workspaces"].is_array());
    assert!(json.get("waiting_on_me").is_some());
    assert!(json["waiting_on_me"].is_array());
    assert!(json.get("recent_tasks").is_some());
    assert!(json["recent_tasks"].is_array());
    assert!(json.get("playbook_shortcuts").is_some());
    assert!(json["playbook_shortcuts"].is_array());
}
