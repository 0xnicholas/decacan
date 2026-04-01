use axum::body::Body;
use axum::http::{Request, StatusCode};
use serde_json::Value;
use tower::ServiceExt;

#[tokio::test]
async fn studio_playbook_routes_list_and_create_lifecycle_handles() {
    let app = decacan_app::app::wiring::router_for_test().await;

    let create_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/studio/playbooks")
                .header("content-type", "application/json")
                .body(Body::from(
                    r#"{"title":"Summary Builder","description":"Authoring route","mode":"standard"}"#,
                ))
                .expect("request should build"),
        )
        .await
        .expect("create route should respond");

    assert_eq!(create_response.status(), StatusCode::CREATED);

    let create_body = axum::body::to_bytes(create_response.into_body(), usize::MAX)
        .await
        .expect("create body should be readable");
    let create_json: Value = serde_json::from_slice(&create_body).expect("create body should be json");
    let handle_id = create_json["handle"]["playbook_handle_id"]
        .as_str()
        .expect("created playbook handle id should be present")
        .to_owned();

    let list_response = app
        .oneshot(
            Request::builder()
                .method("GET")
                .uri("/api/studio/playbooks")
                .body(Body::empty())
                .expect("request should build"),
        )
        .await
        .expect("list route should respond");

    assert_eq!(list_response.status(), StatusCode::OK);

    let body = axum::body::to_bytes(list_response.into_body(), usize::MAX)
        .await
        .expect("list body should be readable");
    let json: Value = serde_json::from_slice(&body).expect("list body should be json");
    let items = json.as_array().expect("list response should be an array");
    assert_eq!(items.len(), 1);
    assert_eq!(
        items[0]["handle"]["playbook_handle_id"],
        Value::String(handle_id)
    );
    assert!(items[0]["draft"].is_object());
    assert!(items[0]["latest_version"].is_null());
    assert_eq!(items[0]["publishable"], Value::Bool(false));
}
