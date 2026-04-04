use std::time::Duration;
use async_trait::async_trait;
use reqwest::{Client, StatusCode};
use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::team::auth::RequestSigner;
use crate::team::retry::{RetryConfig, RetryError, RetryableClient};
use decacan_runtime::ports::team_action_gateway::{
    ApprovalContinuation, TeamActionDisposition, TeamActionGateway,
};
use decacan_runtime::ports::team_orchestrator::{
    AdvanceTeamSessionRequest, ApplyTeamInputRequest, StartTeamSessionRequest,
    StartTeamSessionResult, TeamOrchestratorPort, TeamSessionUpdate, TerminateTeamSessionRequest,
};
use decacan_runtime::team_session::action::TeamActionIntent;
use decacan_runtime::team_session::snapshot::TeamSessionSnapshot;

#[derive(Debug, Error)]
pub enum GatewayClientError {
    #[error("connection failed: {0}")]
    ConnectionFailed(String),
    #[error("timeout: {0}")]
    Timeout(String),
    #[error("serialization error: {0}")]
    Serialization(String),
    #[error("server error: {status}")]
    ServerError { status: u16 },
    #[error("client error: {status}")]
    ClientError { status: u16 },
    #[error("retry exhausted: {0}")]
    RetryExhausted(String),
    #[error("configuration error: {0}")]
    Configuration(String),
}

impl From<RetryError> for GatewayClientError {
    fn from(e: RetryError) -> Self {
        match e {
            RetryError::Transient(msg) if msg.contains("connection:") => {
                GatewayClientError::ConnectionFailed(msg)
            }
            RetryError::Transient(msg) if msg.contains("timeout:") => {
                GatewayClientError::Timeout(msg)
            }
            _ => GatewayClientError::RetryExhausted(e.to_string()),
        }
    }
}

#[derive(Debug, Clone)]
pub struct TeamGatewayClient {
    base_url: String,
    http_client: Client,
    retry_client: RetryableClient,
    timeout: Duration,
    signer: Option<RequestSigner>,
}

impl TeamGatewayClient {
    pub fn new(base_url: String, timeout: Duration) -> Self {
        Self {
            base_url,
            http_client: Client::new(),
            retry_client: RetryableClient::with_config(RetryConfig::default()),
            timeout,
            signer: None,
        }
    }
    
    pub fn with_retry_config(mut self, config: RetryConfig) -> Self {
        self.retry_client = RetryableClient::with_config(config);
        self
    }
    
    pub fn with_signer(mut self, signer: RequestSigner) -> Self {
        self.signer = Some(signer);
        self
    }
    
    pub fn has_signer(&self) -> bool {
        self.signer.is_some()
    }

    /// Creates a client from environment variables.
    ///
    /// Required environment variables:
    /// - `DECACAN_TEAM_GATEWAY_URL` - The gateway base URL
    ///
    /// Optional environment variables:
    /// - `DECACAN_TEAM_GATEWAY_TIMEOUT_SECS` - Timeout in seconds (default: 30)
    /// - `DECACAN_TEAM_GATEWAY_KEY_ID` - Signing key ID
    /// - `DECACAN_TEAM_GATEWAY_SECRET` - Signing secret key
    ///
    /// # Errors
    /// Returns `GatewayClientError::Configuration` if required env vars are missing.
    ///
    /// # Example
    /// ```
    /// use decacan_infra::team::gateway_client::TeamGatewayClient;
    ///
    /// std::env::set_var("DECACAN_TEAM_GATEWAY_URL", "http://gateway:8080");
    /// let client = TeamGatewayClient::from_env();
    /// ```
    pub fn from_env() -> Result<Self, GatewayClientError> {
        use std::env;
        
        let url = env::var("DECACAN_TEAM_GATEWAY_URL")
            .map_err(|_| GatewayClientError::Configuration("DECACAN_TEAM_GATEWAY_URL not set".to_string()))?;
        
        let timeout_secs = env::var("DECACAN_TEAM_GATEWAY_TIMEOUT_SECS")
            .ok()
            .and_then(|s| s.parse().ok())
            .unwrap_or(30);
        
        let mut client = Self::new(url, Duration::from_secs(timeout_secs));
        
        // Optional signing
        if let (Ok(key_id), Ok(secret)) = (
            env::var("DECACAN_TEAM_GATEWAY_KEY_ID"),
            env::var("DECACAN_TEAM_GATEWAY_SECRET"),
        ) {
            client = client.with_signer(RequestSigner::new(key_id, secret.as_bytes()));
        }
        
        Ok(client)
    }
    
    fn add_auth_headers(
        &self,
        builder: reqwest::RequestBuilder,
        method: &str,
        path: &str,
        body: &[u8],
    ) -> reqwest::RequestBuilder {
        if let Some(signer) = &self.signer {
            if let Ok(signed) = signer.sign_request(method, path, body) {
                return builder
                    .header("X-Decacan-Timestamp", signed.timestamp.to_string())
                    .header("X-Decacan-Nonce", signed.nonce)
                    .header("X-Decacan-Signature", signed.signature)
                    .header("X-Decacan-Key-Id", signed.key_id);
            }
        }
        builder
    }
    
    fn get_path(&self, full_url: &str) -> String {
        // Parse URL to extract path properly
        match url::Url::parse(full_url) {
            Ok(url) => url.path().to_string(),
            Err(_) => {
                // Fallback: extract path manually if URL parsing fails
                if let Some(pos) = full_url.find("/api/") {
                    full_url[pos..].to_string()
                } else {
                    "/".to_string()
                }
            }
        }
    }
}

// DTOs for gateway protocol
#[derive(Debug, Serialize)]
struct GatewayStartRequest {
    workspace_id: String,
    task_id: String,
    session_id: String,
}

#[derive(Debug, Deserialize)]
struct GatewayStartResponse {
    snapshot: TeamSessionSnapshot,
}

#[derive(Debug, Serialize)]
struct GatewayAdvanceRequest {
    session_id: String,
}

#[derive(Debug, Deserialize)]
struct GatewayAdvanceResponse {
    snapshot: TeamSessionSnapshot,
}

#[derive(Debug, Serialize)]
struct GatewayApplyInputRequest {
    session_id: String,
}

#[derive(Debug, Deserialize)]
struct GatewayApplyInputResponse {
    snapshot: TeamSessionSnapshot,
}

#[derive(Debug, Serialize)]
struct GatewayTerminateRequest {
    session_id: String,
    reason: String,
}

#[derive(Debug, Deserialize)]
struct GatewayTerminateResponse {
    snapshot: TeamSessionSnapshot,
}

#[derive(Debug, Serialize)]
struct GatewaySubmitActionRequest {
    intent: TeamActionIntent,
}

#[derive(Debug, Deserialize)]
struct GatewaySubmitActionResponse {
    disposition: TeamActionDisposition,
}

#[derive(Debug, Serialize)]
struct GatewayContinueRequest {
    continuation: ApprovalContinuation,
}

#[derive(Debug, Deserialize)]
struct GatewayContinueResponse {
    disposition: TeamActionDisposition,
}

#[async_trait]
impl TeamOrchestratorPort for TeamGatewayClient {
    type Error = GatewayClientError;

    async fn start_session(
        &self,
        request: StartTeamSessionRequest,
    ) -> Result<StartTeamSessionResult, Self::Error> {
        let body = GatewayStartRequest {
            workspace_id: request.workspace_id,
            task_id: request.task_id,
            session_id: request.session_id,
        };
        
        let url = format!("{}/api/team-sessions", self.base_url);
        let body_bytes = serde_json::to_vec(&body).map_err(|e| {
            GatewayClientError::Serialization(e.to_string())
        })?;
        let path = self.get_path(&url);
        
        self.retry_client
            .execute_with_retry(|| async {
                let request_builder = self
                    .http_client
                    .post(&url)
                    .timeout(self.timeout)
                    .header("content-type", "application/json")
                    .body(body_bytes.clone());
                
                let request_builder = self.add_auth_headers(
                    request_builder,
                    "POST",
                    &path,
                    &body_bytes,
                );
                
                let response = request_builder.send().await.map_err(|e| {
                    if e.is_timeout() {
                        RetryError::Transient(format!("timeout: {}", e))
                    } else if e.is_connect() {
                        RetryError::Transient(format!("connection: {}", e))
                    } else {
                        RetryError::Permanent(format!("request failed: {}", e))
                    }
                })?;
                
                match response.status() {
                    StatusCode::CREATED | StatusCode::OK => {
                        let resp: GatewayStartResponse = response.json().await.map_err(|e| {
                            RetryError::Permanent(format!("deserialization: {}", e))
                        })?;
                        Ok(StartTeamSessionResult {
                            snapshot: resp.snapshot,
                        })
                    }
                    status if status.is_server_error() => {
                        Err(RetryError::Transient(format!("server error: {}", status)))
                    }
                    status => Err(RetryError::Permanent(format!("client error: {}", status))),
                }
            })
            .await
            .map_err(Into::into)
    }

    async fn apply_input(
        &self,
        request: ApplyTeamInputRequest,
    ) -> Result<TeamSessionUpdate, Self::Error> {
        let body = GatewayApplyInputRequest {
            session_id: request.session_id,
        };
        
        let url = format!("{}/api/team-sessions/{}/input", self.base_url, body.session_id);
        let body_bytes = serde_json::to_vec(&body).map_err(|e| {
            GatewayClientError::Serialization(e.to_string())
        })?;
        let path = self.get_path(&url);
        
        self.retry_client
            .execute_with_retry(|| async {
                let request_builder = self
                    .http_client
                    .post(&url)
                    .timeout(self.timeout)
                    .header("content-type", "application/json")
                    .body(body_bytes.clone());
                
                let request_builder = self.add_auth_headers(
                    request_builder,
                    "POST",
                    &path,
                    &body_bytes,
                );
                
                let response = request_builder.send().await.map_err(|e| {
                    if e.is_timeout() || e.is_connect() {
                        RetryError::Transient(e.to_string())
                    } else {
                        RetryError::Permanent(e.to_string())
                    }
                })?;
                
                match response.status() {
                    StatusCode::OK => {
                        let resp: GatewayApplyInputResponse = response.json().await.map_err(|e| {
                            RetryError::Permanent(format!("deserialization: {}", e))
                        })?;
                        Ok(TeamSessionUpdate {
                            snapshot: resp.snapshot,
                        })
                    }
                    status if status.is_server_error() => {
                        Err(RetryError::Transient(format!("server error: {}", status)))
                    }
                    status => Err(RetryError::Permanent(format!("client error: {}", status))),
                }
            })
            .await
            .map_err(Into::into)
    }

    async fn advance_session(
        &self,
        request: AdvanceTeamSessionRequest,
    ) -> Result<TeamSessionUpdate, Self::Error> {
        let body = GatewayAdvanceRequest {
            session_id: request.session_id,
        };
        
        let url = format!("{}/api/team-sessions/{}/advance", self.base_url, body.session_id);
        let body_bytes = serde_json::to_vec(&body).map_err(|e| {
            GatewayClientError::Serialization(e.to_string())
        })?;
        let path = self.get_path(&url);
        
        self.retry_client
            .execute_with_retry(|| async {
                let request_builder = self
                    .http_client
                    .post(&url)
                    .timeout(self.timeout)
                    .header("content-type", "application/json")
                    .body(body_bytes.clone());
                
                let request_builder = self.add_auth_headers(
                    request_builder,
                    "POST",
                    &path,
                    &body_bytes,
                );
                
                let response = request_builder.send().await.map_err(|e| {
                    if e.is_timeout() || e.is_connect() {
                        RetryError::Transient(e.to_string())
                    } else {
                        RetryError::Permanent(e.to_string())
                    }
                })?;
                
                match response.status() {
                    StatusCode::OK => {
                        let resp: GatewayAdvanceResponse = response.json().await.map_err(|e| {
                            RetryError::Permanent(format!("deserialization: {}", e))
                        })?;
                        Ok(TeamSessionUpdate {
                            snapshot: resp.snapshot,
                        })
                    }
                    status if status.is_server_error() => {
                        Err(RetryError::Transient(format!("server error: {}", status)))
                    }
                    status => Err(RetryError::Permanent(format!("client error: {}", status))),
                }
            })
            .await
            .map_err(Into::into)
    }

    async fn get_snapshot(
        &self,
        session_id: &str,
    ) -> Result<Option<TeamSessionSnapshot>, Self::Error> {
        let url = format!("{}/api/team-sessions/{}", self.base_url, session_id);
        let path = self.get_path(&url);
        
        self.retry_client
            .execute_with_retry(|| async {
                let request_builder = self
                    .http_client
                    .get(&url)
                    .timeout(self.timeout);
                
                let request_builder = self.add_auth_headers(
                    request_builder,
                    "GET",
                    &path,
                    b"",
                );
                
                let response = request_builder.send().await.map_err(|e| {
                    if e.is_timeout() || e.is_connect() {
                        RetryError::Transient(e.to_string())
                    } else {
                        RetryError::Permanent(e.to_string())
                    }
                })?;
                
                match response.status() {
                    StatusCode::OK => {
                        let snapshot: TeamSessionSnapshot = response.json().await.map_err(|e| {
                            RetryError::Permanent(format!("deserialization: {}", e))
                        })?;
                        Ok(Some(snapshot))
                    }
                    StatusCode::NOT_FOUND => Ok(None),
                    status if status.is_server_error() => {
                        Err(RetryError::Transient(format!("server error: {}", status)))
                    }
                    status => Err(RetryError::Permanent(format!("client error: {}", status))),
                }
            })
            .await
            .map_err(Into::into)
    }

    async fn terminate_session(
        &self,
        request: TerminateTeamSessionRequest,
    ) -> Result<TeamSessionUpdate, Self::Error> {
        let body = GatewayTerminateRequest {
            session_id: request.session_id,
            reason: request.reason,
        };
        
        let url = format!("{}/api/team-sessions/{}/terminate", self.base_url, body.session_id);
        let body_bytes = serde_json::to_vec(&body).map_err(|e| {
            GatewayClientError::Serialization(e.to_string())
        })?;
        let path = self.get_path(&url);
        
        self.retry_client
            .execute_with_retry(|| async {
                let request_builder = self
                    .http_client
                    .post(&url)
                    .timeout(self.timeout)
                    .header("content-type", "application/json")
                    .body(body_bytes.clone());
                
                let request_builder = self.add_auth_headers(
                    request_builder,
                    "POST",
                    &path,
                    &body_bytes,
                );
                
                let response = request_builder.send().await.map_err(|e| {
                    if e.is_timeout() || e.is_connect() {
                        RetryError::Transient(e.to_string())
                    } else {
                        RetryError::Permanent(e.to_string())
                    }
                })?;
                
                match response.status() {
                    StatusCode::OK => {
                        let resp: GatewayTerminateResponse = response.json().await.map_err(|e| {
                            RetryError::Permanent(format!("deserialization: {}", e))
                        })?;
                        Ok(TeamSessionUpdate {
                            snapshot: resp.snapshot,
                        })
                    }
                    status if status.is_server_error() => {
                        Err(RetryError::Transient(format!("server error: {}", status)))
                    }
                    status => Err(RetryError::Permanent(format!("client error: {}", status))),
                }
            })
            .await
            .map_err(Into::into)
    }
}

#[async_trait]
impl TeamActionGateway for TeamGatewayClient {
    type Error = GatewayClientError;

    async fn submit_action(
        &self,
        intent: TeamActionIntent,
    ) -> Result<TeamActionDisposition, Self::Error> {
        let body = GatewaySubmitActionRequest { intent };
        
        let url = format!("{}/api/team-actions", self.base_url);
        let body_bytes = serde_json::to_vec(&body).map_err(|e| {
            GatewayClientError::Serialization(e.to_string())
        })?;
        let path = self.get_path(&url);
        let idempotency_key = Self::generate_idempotency_key(&body);
        
        self.retry_client
            .execute_with_retry(|| async {
                let request_builder = self
                    .http_client
                    .post(&url)
                    .header("X-Idempotency-Key", &idempotency_key)
                    .timeout(self.timeout)
                    .header("content-type", "application/json")
                    .body(body_bytes.clone());
                
                let request_builder = self.add_auth_headers(
                    request_builder,
                    "POST",
                    &path,
                    &body_bytes,
                );
                
                let response = request_builder.send().await.map_err(|e| {
                    if e.is_timeout() || e.is_connect() {
                        RetryError::Transient(e.to_string())
                    } else {
                        RetryError::Permanent(e.to_string())
                    }
                })?;
                
                match response.status() {
                    StatusCode::OK | StatusCode::ACCEPTED | StatusCode::CREATED => {
                        let resp: GatewaySubmitActionResponse = response.json().await.map_err(|e| {
                            RetryError::Permanent(format!("deserialization: {}", e))
                        })?;
                        Ok(resp.disposition)
                    }
                    status if status.is_server_error() => {
                        Err(RetryError::Transient(format!("server error: {}", status)))
                    }
                    status => Err(RetryError::Permanent(format!("client error: {}", status))),
                }
            })
            .await
            .map_err(Into::into)
    }

    async fn continue_after_approval(
        &self,
        continuation: ApprovalContinuation,
    ) -> Result<TeamActionDisposition, Self::Error> {
        let body = GatewayContinueRequest { continuation };
        
        let url = format!("{}/api/team-actions/continue", self.base_url);
        let body_bytes = serde_json::to_vec(&body).map_err(|e| {
            GatewayClientError::Serialization(e.to_string())
        })?;
        let path = self.get_path(&url);
        
        self.retry_client
            .execute_with_retry(|| async {
                let request_builder = self
                    .http_client
                    .post(&url)
                    .timeout(self.timeout)
                    .header("content-type", "application/json")
                    .body(body_bytes.clone());
                
                let request_builder = self.add_auth_headers(
                    request_builder,
                    "POST",
                    &path,
                    &body_bytes,
                );
                
                let response = request_builder.send().await.map_err(|e| {
                    if e.is_timeout() || e.is_connect() {
                        RetryError::Transient(e.to_string())
                    } else {
                        RetryError::Permanent(e.to_string())
                    }
                })?;
                
                match response.status() {
                    StatusCode::OK => {
                        let resp: GatewayContinueResponse = response.json().await.map_err(|e| {
                            RetryError::Permanent(format!("deserialization: {}", e))
                        })?;
                        Ok(resp.disposition)
                    }
                    status if status.is_server_error() => {
                        Err(RetryError::Transient(format!("server error: {}", status)))
                    }
                    status => Err(RetryError::Permanent(format!("client error: {}", status))),
                }
            })
            .await
            .map_err(Into::into)
    }
}

impl TeamGatewayClient {
    fn generate_idempotency_key<T: Serialize>(body: &T) -> String {
        use std::collections::hash_map::DefaultHasher;
        use std::hash::{Hash, Hasher};
        
        let json = serde_json::to_string(body).unwrap_or_default();
        let mut hasher = DefaultHasher::new();
        json.hash(&mut hasher);
        format!("{:x}", hasher.finish())
    }
}