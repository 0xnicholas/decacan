use axum::body::Body;
use axum::http::{Request, StatusCode};
use serde_json::{json, Value};
use tower::ServiceExt;

const VALID_SPEC_DOCUMENT: &str = r#"metadata:
  title: valid draft
capability_refs:
  routines:
    - builtin.scan_markdown_files
  tools:
    - builtin.workspace.read
    - builtin.artifact.write
  validators:
    - builtin.output_contract.summary
execution_profile: single
"#;

#[tokio::test]
async fn published_playbook_catalog_lists_only_published_versions() {
    let app = decacan_app::app::wiring::router_for_test().await;

    let published_handle_id = fork_store_playbook(app.clone(), "store-entry-summary").await;
    save_playbook_draft(app.clone(), &published_handle_id, VALID_SPEC_DOCUMENT).await;
    let published_version_id = publish_studio_playbook(app.clone(), &published_handle_id).await;

    let draft_only_handle_id = fork_store_playbook(app.clone(), "store-entry-discovery").await;
    save_playbook_draft(app.clone(), &draft_only_handle_id, VALID_SPEC_DOCUMENT).await;

    let response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/api/published-playbooks")
                .body(Body::empty())
                .expect("request should build"),
        )
        .await
        .expect("catalog route should respond");

    assert_eq!(response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("catalog body should be readable");
    let json: Value = serde_json::from_slice(&body).expect("catalog body should be json");
    let items = json.as_array().expect("catalog response should be an array");
    assert_eq!(items.len(), 1);
    assert_eq!(
        items[0]["playbook_handle_id"],
        Value::String(published_handle_id)
    );
    assert_eq!(
        items[0]["playbook_version_id"],
        Value::String(published_version_id)
    );
    assert!(items[0]["title"].is_string());
    assert!(items[0]["summary"].is_string());
    assert!(items[0]["mode_label"].is_string());
    assert!(items[0].get("draft_id").is_none());
}

#[tokio::test]
async fn task_preview_requires_published_handle_and_version_ids() {
    let app = decacan_app::app::wiring::router_for_test().await;

    let handle_id = fork_store_playbook(app.clone(), "store-entry-summary").await;
    save_playbook_draft(app.clone(), &handle_id, VALID_SPEC_DOCUMENT).await;
    let version_id = publish_studio_playbook(app.clone(), &handle_id).await;

    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/task-previews")
                .header("content-type", "application/json")
                .body(Body::from(
                    json!({
                        "workspace_id": "workspace-1",
                        "playbook_handle_id": handle_id,
                        "playbook_version_id": version_id,
                        "input": "Summarize notes",
                    })
                    .to_string(),
                ))
                .expect("request should build"),
        )
        .await
        .expect("preview route should respond");

    assert_eq!(response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("preview body should be readable");
    let json: Value = serde_json::from_slice(&body).expect("preview body should be json");

    assert!(json["plan_steps"].is_array());
    assert!(json["expected_artifact_label"].is_string());
}

async fn fork_store_playbook(app: axum::Router, store_entry_id: &str) -> String {
    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/playbooks/fork")
                .header("content-type", "application/json")
                .body(Body::from(
                    json!({
                        "store_entry_id": store_entry_id,
                    })
                    .to_string(),
                ))
                .expect("request should build"),
        )
        .await
        .expect("fork route should respond");

    assert_eq!(response.status(), StatusCode::CREATED);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("fork body should be readable");
    let json: Value = serde_json::from_slice(&body).expect("fork body should be json");

    json["handle"]["playbook_handle_id"]
        .as_str()
        .expect("forked playbook handle id should be present")
        .to_owned()
}

async fn save_playbook_draft(app: axum::Router, handle_id: &str, spec_document: &str) {
    let response = app
        .oneshot(
            Request::builder()
                .method("PUT")
                .uri(format!("/api/studio/playbooks/{handle_id}/draft"))
                .header("content-type", "application/json")
                .body(Body::from(
                    json!({
                        "spec_document": spec_document,
                    })
                    .to_string(),
                ))
                .expect("request should build"),
        )
        .await
        .expect("save draft route should respond");

    assert_eq!(response.status(), StatusCode::OK);
}

async fn publish_studio_playbook(app: axum::Router, handle_id: &str) -> String {
    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri(format!("/api/studio/playbooks/{handle_id}/publish"))
                .body(Body::empty())
                .expect("request should build"),
        )
        .await
        .expect("publish route should respond");

    assert_eq!(response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(response.into_body(), usize::MAX)
        .await
        .expect("publish body should be readable");
    let json: Value = serde_json::from_slice(&body).expect("publish body should be json");

    json["version"]["playbook_version_id"]
        .as_str()
        .expect("published playbook version id should be present")
        .to_owned()
}
