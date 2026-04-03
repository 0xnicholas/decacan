use axum::body::Body;
use axum::http::{Request, StatusCode};
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
    let app = router_with_state(state);

    let request = Request::builder()
        .method("PATCH")
        .uri("/api/evolution-proposals/proposal-1/review")
        .header("content-type", "application/json")
        .body(Body::from(r#"{"review_state":"approved"}"#))
        .unwrap();

    let response = app.oneshot(request).await.unwrap();
    assert_eq!(response.status(), StatusCode::OK);
}
