use axum::body::Body;
use http::{Request, StatusCode};
use serde_json::Value;
use tower::ServiceExt;

use decacan_app::CurrentUser;

#[tokio::test]
async fn account_home_returns_cross_workspace_work_summary() {
    let state = decacan_app::app::state::AppState::new_for_test_with_workspaces(vec![
        (
            "workspace-1".to_owned(),
            "Default Workspace".to_owned(),
            "/workspace".to_owned(),
        ),
        (
            "workspace-2".to_owned(),
            "Secondary Workspace".to_owned(),
            "/workspace-2".to_owned(),
        ),
    ])
    .await
    .expect("test state should build");
    let app = decacan_app::app::wiring::router_with_state(state.clone());

    let mut request = Request::builder()
        .method("GET")
        .uri("/api/account/home")
        .body(Body::empty())
        .expect("request should build");
    request.extensions_mut().insert(CurrentUser {
        user_id: "user-1".to_owned(),
        default_workspace_id: "workspace-2".to_owned(),
    });

    let response = app
        .clone()
        .oneshot(request)
        .await
        .expect("router should respond");

    assert_eq!(response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("response body should be readable");
    let json: Value = serde_json::from_slice(&body).expect("response should be json");

    assert_eq!(
        json["default_workspace_id"],
        Value::String("workspace-2".to_owned())
    );
    assert!(json.get("workspaces").is_some());
    assert!(json["workspaces"].is_array());
    assert_eq!(json["workspaces"].as_array().unwrap().len(), 2);
    assert_eq!(
        json["workspaces"][0]["id"],
        Value::String("workspace-1".to_owned())
    );
    assert_eq!(
        json["workspaces"][1]["id"],
        Value::String("workspace-2".to_owned())
    );
    assert!(json.get("waiting_on_me").is_some());
    assert!(json["waiting_on_me"].is_array());
    assert!(json.get("recent_tasks").is_some());
    assert!(json["recent_tasks"].is_array());
    assert!(json.get("playbook_shortcuts").is_some());
    assert!(json["playbook_shortcuts"].is_array());
}
