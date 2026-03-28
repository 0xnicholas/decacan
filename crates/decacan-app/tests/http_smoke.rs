use axum::body::Body;
use http::{Request, StatusCode};
use serde_json::Value;
use tower::ServiceExt;

#[tokio::test]
async fn post_tasks_returns_202_from_router_for_test() {
    let app = decacan_app::app::wiring::router_for_test();

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/tasks")
                .header("content-type", "application/json")
                .body(Body::from(
                    r#"{"workspace_id":"workspace-1","playbook_key":"总结资料","input":"notes.md"}"#,
                ))
                .expect("request should build"),
        )
        .await
        .expect("router should respond");

    assert_eq!(response.status(), StatusCode::ACCEPTED);
}

#[tokio::test]
async fn missing_task_event_routes_return_404() {
    let app = decacan_app::app::wiring::router_for_test();

    let events_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/api/tasks/task-missing/events")
                .body(Body::empty())
                .expect("request should build"),
        )
        .await
        .expect("events route should respond");

    let stream_response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/api/tasks/task-missing/events/stream")
                .body(Body::empty())
                .expect("request should build"),
        )
        .await
        .expect("stream route should respond");

    assert_eq!(events_response.status(), StatusCode::NOT_FOUND);
    assert_eq!(stream_response.status(), StatusCode::NOT_FOUND);
}

#[tokio::test]
async fn playbooks_endpoint_returns_card_metadata_and_preview_endpoint_returns_short_plan() {
    let app = decacan_app::app::wiring::router_for_test();

    let playbooks_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/api/playbooks")
                .body(Body::empty())
                .expect("request should build"),
        )
        .await
        .expect("playbooks route should respond");

    assert_eq!(playbooks_response.status(), StatusCode::OK);

    let playbooks_body = axum::body::to_bytes(playbooks_response.into_body(), usize::MAX)
        .await
        .expect("playbooks body should be readable");
    let playbooks_json: Value =
        serde_json::from_slice(&playbooks_body).expect("playbooks response should be json");
    let first_playbook = playbooks_json[0]
        .as_object()
        .expect("playbooks response should contain at least one object");

    assert!(first_playbook.contains_key("summary"));
    assert!(first_playbook.contains_key("expected_output_label"));

    let preview_response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/task-previews")
                .header("content-type", "application/json")
                .body(Body::from(
                    r#"{"workspace_id":"workspace-1","playbook_key":"总结资料","input":"notes.md"}"#,
                ))
                .expect("request should build"),
        )
        .await
        .expect("preview route should respond");

    assert_eq!(preview_response.status(), StatusCode::OK);

    let preview_body = axum::body::to_bytes(preview_response.into_body(), usize::MAX)
        .await
        .expect("preview body should be readable");
    let preview_json: Value =
        serde_json::from_slice(&preview_body).expect("preview response should be json");

    assert!(preview_json.get("plan_steps").is_some());
    assert!(preview_json.get("expected_artifact_label").is_some());
}
