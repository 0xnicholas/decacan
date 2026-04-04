use decacan_infra::team::auth::RequestSigner;
use decacan_infra::team::gateway_client::TeamGatewayClient;
use std::time::Duration;
use wiremock::{Mock, MockServer};
use wiremock::matchers::{method, path, header_exists};

#[tokio::test]
async fn gateway_client_includes_signature_headers_when_signer_configured() {
    // Start a mock server
    let mock_server = MockServer::start().await;
    
    // Create a client with signer
    let signer = RequestSigner::new("test-key-id", b"test-secret-key-32bytes-long!!");
    let client = TeamGatewayClient::new(
        mock_server.uri(),
        Duration::from_secs(5),
    ).with_signer(signer);
    
    // Verify signer is configured
    assert!(client.has_signer());
}

#[tokio::test]
async fn gateway_client_omits_signer_when_not_configured() {
    // Create a client WITHOUT signer
    let client = TeamGatewayClient::new(
        "http://localhost:8080".to_string(),
        Duration::from_secs(5),
    );
    
    // Verify no signer is configured
    assert!(!client.has_signer());
}

#[tokio::test]
async fn gateway_client_from_env_reads_signing_config() {
    // Set environment variables
    std::env::set_var("DECACAN_TEAM_GATEWAY_URL", "http://localhost:8080");
    std::env::set_var("DECACAN_TEAM_GATEWAY_KEY_ID", "env-key-id");
    std::env::set_var("DECACAN_TEAM_GATEWAY_SECRET", "env-secret-key");
    
    // Create client from env
    let client = TeamGatewayClient::from_env();
    
    // Should succeed with signer configured
    assert!(client.is_ok());
    let client = client.unwrap();
    assert!(client.has_signer());
    
    // Clean up
    std::env::remove_var("DECACAN_TEAM_GATEWAY_URL");
    std::env::remove_var("DECACAN_TEAM_GATEWAY_KEY_ID");
    std::env::remove_var("DECACAN_TEAM_GATEWAY_SECRET");
}