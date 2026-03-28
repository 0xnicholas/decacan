use std::fs;

use axum::response::Html;
use axum::routing::get;
use axum::Router;
use tower_http::services::ServeDir;

use crate::api;

use super::state::AppState;

const FRONTEND_DIST_DIR: &str = concat!(env!("CARGO_MANIFEST_DIR"), "/../../frontend/dist");
const FRONTEND_ASSETS_DIR: &str =
    concat!(env!("CARGO_MANIFEST_DIR"), "/../../frontend/dist/assets");

pub fn router_for_test() -> Router {
    router_with_state(AppState::new_for_test())
}

pub fn router_for_local() -> std::io::Result<Router> {
    Ok(router_with_state(AppState::new_local()?))
}

pub fn router_with_state(state: AppState) -> Router {
    Router::new()
        .route("/", get(frontend_index))
        .nest_service("/assets", ServeDir::new(FRONTEND_ASSETS_DIR))
        .merge(api::router())
        .with_state(state)
}

async fn frontend_index() -> Html<String> {
    Html(
        fs::read_to_string(format!("{FRONTEND_DIST_DIR}/index.html"))
            .unwrap_or_else(|_| fallback_frontend_html()),
    )
}

fn fallback_frontend_html() -> String {
    r#"<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Decacan</title>
  </head>
  <body>
    <div id="root"></div>
  </body>
</html>
"#
    .to_owned()
}
