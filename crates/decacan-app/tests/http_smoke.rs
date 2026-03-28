use std::time::Duration;

use axum::body::Body;
use http::{Request, StatusCode};
use serde_json::Value;
use tower::ServiceExt;

#[tokio::test]
async fn post_tasks_returns_202_from_router_for_test() {
    let app = decacan_app::app::wiring::router_for_test();

    let response = app
        .oneshot(create_task_request("总结资料", "alpha\nbeta\ngamma"))
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
async fn task_detail_endpoint_returns_runtime_backed_plan_artifacts_and_timeline() {
    let app = decacan_app::app::wiring::router_for_test();
    let (task_id, _artifact_id) = create_task(&app, "总结资料", "alpha\nbeta\ngamma").await;

    let detail_json = wait_for_terminal_task(&app, &task_id).await;

    assert_eq!(detail_json["task"]["status"], "succeeded");
    assert!(detail_json.get("plan").is_some());
    assert!(detail_json.get("approvals").is_some());
    assert!(detail_json.get("artifacts").is_some());
    assert!(detail_json.get("timeline").is_some());
    assert!(
        detail_json["timeline"]
            .as_array()
            .expect("timeline should be an array")
            .iter()
            .any(|event| event["event_type"] == "artifact.ready")
    );
    let plan_steps = detail_json["plan"]["steps"]
        .as_array()
        .expect("plan steps should be an array");
    assert_eq!(plan_steps.len(), 7);
    assert_eq!(
        plan_steps[0].as_str(),
        Some("Scan the workspace for markdown files that can be summarized.")
    );
    assert_eq!(
        plan_steps[6].as_str(),
        Some("Register the written summary as the workflow output artifact.")
    );
}

#[tokio::test]
async fn approval_retry_and_artifact_content_routes_work_with_runtime_execution() {
    let app = decacan_app::app::wiring::router_for_test();
    let (task_id, artifact_id) = create_task(&app, "总结资料", "alpha\nbeta\ngamma").await;

    let _ = wait_for_terminal_task(&app, &task_id).await;

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
    assert_eq!(approval_response.status(), StatusCode::ACCEPTED);

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

    let retried_detail = wait_for_terminal_task(&app, &task_id).await;
    assert_eq!(retried_detail["task"]["status"], "succeeded");

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

    let content_body = axum::body::to_bytes(content_response.into_body(), usize::MAX)
        .await
        .expect("content body should be readable");
    let content_json: Value =
        serde_json::from_slice(&content_body).expect("artifact content should be json");
    let content = content_json["content"]
        .as_str()
        .expect("artifact content should be a string");

    assert!(content.contains("## 总览"));
    assert!(content.contains("`notes.md`"));
}

#[tokio::test]
async fn workspace_home_endpoint_returns_attention_activity_deliverables_and_team_snapshot() {
    let app = decacan_app::app::wiring::router_for_test();

    let response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/api/workspaces/workspace-1/home")
                .body(Body::empty())
                .expect("request should build"),
        )
        .await
        .expect("workspace home route should respond");

    assert_eq!(response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("workspace home body should be readable");
    let json: Value =
        serde_json::from_slice(&body).expect("workspace home response should be json");

    assert!(json.get("attention").is_some());
    assert!(json.get("task_health").is_some());
    assert!(json.get("activity").is_some());
    assert!(json.get("deliverables").is_some());
    assert!(json.get("team_snapshot").is_some());
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

async fn create_task(app: &axum::Router, playbook_key: &str, input: &str) -> (String, String) {
    let response = app
        .clone()
        .oneshot(create_task_request(playbook_key, input))
        .await
        .expect("create route should respond");
    assert_eq!(response.status(), StatusCode::ACCEPTED);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("create body should be readable");
    let json: Value = serde_json::from_slice(&body).expect("create response should be json");

    (
        json["task"]["id"]
            .as_str()
            .expect("task id should be present")
            .to_owned(),
        json["task"]["artifact_id"]
            .as_str()
            .expect("artifact id should be present")
            .to_owned(),
    )
}

async fn wait_for_terminal_task(app: &axum::Router, task_id: &str) -> Value {
    for _ in 0..100 {
        let response = app
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
        assert_eq!(response.status(), StatusCode::OK);

        let body = axum::body::to_bytes(response.into_body(), usize::MAX)
            .await
            .expect("task detail body should be readable");
        let json: Value = serde_json::from_slice(&body).expect("task detail should be json");
        let status = json["task"]["status"]
            .as_str()
            .expect("task status should be present");

        if matches!(status, "succeeded" | "failed" | "cancelled") {
            return json;
        }

        tokio::time::sleep(Duration::from_millis(25)).await;
    }

    panic!("task {task_id} did not reach a terminal state in time");
}

fn create_task_request(playbook_key: &str, input: &str) -> Request<Body> {
    Request::builder()
        .method("POST")
        .uri("/api/tasks")
        .header("content-type", "application/json")
        .body(Body::from(
            serde_json::json!({
                "workspace_id": "workspace-1",
                "playbook_key": playbook_key,
                "input": input,
            })
            .to_string(),
        ))
        .expect("request should build")
}
