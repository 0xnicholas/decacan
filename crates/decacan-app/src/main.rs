use std::net::SocketAddr;

#[tokio::main]
async fn main() {
    let app = decacan_app::app::wiring::router_for_test();
    let address = SocketAddr::from(([127, 0, 0, 1], 3000));
    let listener = tokio::net::TcpListener::bind(address)
        .await
        .expect("listener should bind");

    axum::serve(listener, app)
        .await
        .expect("server should run");
}
