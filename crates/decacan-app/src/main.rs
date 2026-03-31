use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    let app = decacan_app::app::wiring::router_for_local()
        .await
        .expect("local app router should initialize");
    let port = std::env::var("DECACAN_APP_PORT")
        .ok()
        .and_then(|value| value.parse::<u16>().ok())
        .unwrap_or(3000);
    let address = SocketAddr::from(([127, 0, 0, 1], port));
    let listener = tokio::net::TcpListener::bind(address)
        .await
        .expect("listener should bind");

    axum::serve(listener, app).await.expect("server should run");
}
