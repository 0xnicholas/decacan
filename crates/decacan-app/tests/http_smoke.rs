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

#[tokio::test]
async fn task_detail_endpoint_returns_plan_approvals_artifacts_and_timeline() {
    let app = decacan_app::app::wiring::router_for_test();

    let create_response = app
        .clone()
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
        .expect("create route should respond");

    assert_eq!(create_response.status(), StatusCode::ACCEPTED);

    let create_body = axum::body::to_bytes(create_response.into_body(), usize::MAX)
        .await
        .expect("create body should be readable");
    let create_json: Value =
        serde_json::from_slice(&create_body).expect("create response should be json");
    let task_id = create_json["task"]["id"]
        .as_str()
        .expect("create response should include a task id");

    let detail_response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri(format!("/api/tasks/{task_id}"))
                .body(Body::empty())
                .expect("request should build"),
        )
        .await
        .expect("task detail route should respond");

    assert_eq!(detail_response.status(), StatusCode::OK);

    let detail_body = axum::body::to_bytes(detail_response.into_body(), usize::MAX)
        .await
        .expect("detail body should be readable");
    let detail_json: Value =
        serde_json::from_slice(&detail_body).expect("detail response should be json");

    assert!(detail_json.get("task").is_some());
    assert!(detail_json.get("plan").is_some());
    assert!(detail_json.get("approvals").is_some());
    assert!(detail_json.get("artifacts").is_some());
    assert!(detail_json.get("timeline").is_some());
}

#[tokio::test]
async fn approval_decision_and_retry_routes_update_task_snapshot() {
    let app = decacan_app::app::wiring::router_for_test();

    let create_response = app
        .clone()
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
        .expect("create route should respond");
    let create_body = axum::body::to_bytes(create_response.into_body(), usize::MAX)
        .await
        .expect("create body should be readable");
    let create_json: Value =
        serde_json::from_slice(&create_body).expect("create response should be json");
    let task_id = create_json["task"]["id"]
        .as_str()
        .expect("create response should include a task id");
    let artifact_id = create_json["task"]["artifact_id"]
        .as_str()
        .expect("create response should include an artifact id");

    let approval_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri(format!("/api/tasks/{task_id}/approvals"))
                .header("content-type", "application/json")
                .body(Body::from(r#"{"decision":"pending","comment":null}"#))
                .expect("request should build"),
        )
        .await
        .expect("approval create route should respond");
    let approval_body = axum::body::to_bytes(approval_response.into_body(), usize::MAX)
        .await
        .expect("approval body should be readable");
    let approval_json: Value =
        serde_json::from_slice(&approval_body).expect("approval response should be json");
    let approval_id = approval_json["id"]
        .as_str()
        .expect("approval response should include an approval id");

    let decision_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri(format!("/api/approvals/{approval_id}/decision"))
                .header("content-type", "application/json")
                .body(Body::from(r#"{"decision":"approved","comment":"Proceed"}"#))
                .expect("request should build"),
        )
        .await
        .expect("approval decision route should respond");
    assert_eq!(decision_response.status(), StatusCode::ACCEPTED);

    let task_after_decision = app
        .clone()
        .oneshot(
            Request::builder()
                .method("GET")
                .uri(format!("/api/tasks/{task_id}"))
                .body(Body::empty())
                .expect("request should build"),
        )
        .await
        .expect("task detail route should respond");
    let task_after_decision_body =
        axum::body::to_bytes(task_after_decision.into_body(), usize::MAX)
            .await
            .expect("task detail body should be readable");
    let task_after_decision_json: Value =
        serde_json::from_slice(&task_after_decision_body).expect("task detail should be json");

    assert_eq!(task_after_decision_json["task"]["status"], "running");
    assert_eq!(task_after_decision_json["approvals"][0]["status"], "approved");

    let retry_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri(format!("/api/tasks/{task_id}/retry"))
                .header("content-type", "application/json")
                .body(Body::from(r#"{"note":"Try the task again"}"#))
                .expect("request should build"),
        )
        .await
        .expect("retry route should respond");
    assert_eq!(retry_response.status(), StatusCode::ACCEPTED);

    let content_response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri(format!("/api/artifacts/{artifact_id}/content"))
                .body(Body::empty())
                .expect("request should build"),
        )
        .await
        .expect("artifact content route should respond");
    assert_eq!(content_response.status(), StatusCode::OK);
}

#[tokio::test]
async fn root_route_serves_frontend_html_shell() {
    let app = decacan_app::app::wiring::router_for_test();

    let response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/")
                .body(Body::empty())
                .expect("request should build"),
        )
        .await
        .expect("root route should respond");

    assert_eq!(response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("root body should be readable");
    let html = String::from_utf8(body.to_vec()).expect("root response should be utf8");

    assert!(html.contains("<!doctype html>") || html.contains("<!DOCTYPE html>"));
    assert!(html.contains("id=\"root\""));
}
