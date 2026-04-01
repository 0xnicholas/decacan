use axum::body::Body;
use http::{Request, StatusCode};
use serde_json::Value;
use tower::ServiceExt;

use decacan_app::app::state::AppState;
use decacan_app::app::wiring::router_with_state;
use decacan_app::CurrentUser;
use decacan_runtime::workspace::rbac::WorkspaceRole;

async fn fetch_permissions(app: axum::Router, current_user: CurrentUser) -> Value {
    let mut request = Request::builder()
        .method("GET")
        .uri("/api/me/permissions")
        .body(Body::empty())
        .expect("request should build");
    request.extensions_mut().insert(current_user);

    let response = app.oneshot(request).await.expect("router should respond");
    assert_eq!(response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("response body should be readable");
    serde_json::from_slice(&body).expect("response should be json")
}

#[tokio::test]
async fn normal_user_gets_console_home_but_not_studio_playbooks() {
    let state = AppState::new_for_test().await;
    let app = router_with_state(state.clone());

    let json = fetch_permissions(
        app,
        CurrentUser {
            user_id: "user-1".to_owned(),
            default_workspace_id: "workspace-1".to_owned(),
        },
    )
    .await;

    assert_eq!(json["console_home"], Value::Bool(true));
    assert_eq!(json["studio_playbooks"], Value::Bool(false));
    assert_eq!(json["user_id"], Value::String("user-1".to_owned()));
}

#[tokio::test]
async fn workspace_owner_gets_studio_playbooks_access() {
    let state = AppState::new_for_test().await;
    state.create_test_membership(
        "workspace-1".to_owned(),
        "user-1".to_owned(),
        WorkspaceRole::Owner,
    );
    let app = router_with_state(state.clone());

    let json = fetch_permissions(
        app,
        CurrentUser {
            user_id: "user-1".to_owned(),
            default_workspace_id: "workspace-1".to_owned(),
        },
    )
    .await;

    assert_eq!(json["console_home"], Value::Bool(true));
    assert_eq!(json["studio_playbooks"], Value::Bool(true));
}
