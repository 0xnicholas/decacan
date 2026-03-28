use axum::body::Body;
use http::{Request, StatusCode};
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
