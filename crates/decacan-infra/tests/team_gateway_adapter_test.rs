use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::Duration;
use decacan_infra::team::adapter::{AdapterMode, TeamAdapter, AdapterError};
use decacan_infra::team::gateway_client::{GatewayClientError, TeamGatewayClient};
use decacan_infra::team::retry::{RetryConfig, RetryableClient, RetryError};
use decacan_runtime::ports::team_orchestrator::{
    StartTeamSessionRequest, TeamOrchestratorPort,
};

#[tokio::test]
async fn adapter_in_process_mode_uses_in_process_orchestrator() {
    let adapter = TeamAdapter::new_in_process();
    
    let result = adapter
        .start_session(StartTeamSessionRequest::new_for_test("ws-1", "task-1"))
        .await;
    
    assert!(result.is_ok());
    assert_eq!(result.unwrap().snapshot.status.as_str(), "running");
}

#[tokio::test]
async fn adapter_gateway_mode_uses_gateway_client() {
    // This will fail to connect, but verifies the mode switch works
    let adapter = TeamAdapter::new_gateway(
        "http://192.0.2.1:9999".to_string(),
        Duration::from_millis(100),
    );
    
    let result = adapter
        .start_session(StartTeamSessionRequest::new_for_test("ws-1", "task-1"))
        .await;
    
    assert!(result.is_err());
    // Should be a gateway error, not in-process error
    match result {
        Err(decacan_infra::team::adapter::AdapterError::GatewayError(_)) => (),
        other => panic!("expected gateway error, got {:?}", other),
    }
}