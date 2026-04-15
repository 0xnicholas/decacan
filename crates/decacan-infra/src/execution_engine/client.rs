use std::time::Duration;

use async_trait::async_trait;
use decacan_agent_contract::{
    ExecutionEvent, ExecutionInput, ExecutionRequest,
};
use decacan_runtime::ports::execution_engine::{
    ArtifactReference, ExecutionEnginePort, ExecutionHandle, ExecutionState, ExecutionStatus,
    PendingApproval,
};
use futures::stream::BoxStream;
use futures::StreamExt;
use reqwest::{Client, StatusCode};
use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::team::retry::{RetryConfig, RetryError, RetryableClient};

#[derive(Debug, Error)]
pub enum HttpEngineError {
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
    #[error("event stream error: {0}")]
    EventStream(String),
    #[error("protocol version mismatch: remote={remote}, local={local}")]
    ProtocolMismatch { remote: String, local: String },
}

impl From<RetryError> for HttpEngineError {
    fn from(e: RetryError) -> Self {
        match e {
            RetryError::Transient(msg) if msg.contains("connection:") => {
                HttpEngineError::ConnectionFailed(msg)
            }
            RetryError::Transient(msg) if msg.contains("timeout:") => {
                HttpEngineError::Timeout(msg)
            }
            _ => HttpEngineError::RetryExhausted(e.to_string()),
        }
    }
}

#[derive(Debug, Clone)]
pub struct HttpExecutionEngineClient {
    base_url: String,
    http_client: Client,
    retry_client: RetryableClient,
    timeout: Duration,
}

impl HttpExecutionEngineClient {
    pub fn new(base_url: impl Into<String>, timeout: Duration) -> Self {
        Self {
            base_url: base_url.into(),
            http_client: Client::new(),
            retry_client: RetryableClient::with_config(RetryConfig::default()),
            timeout,
        }
    }

    pub fn with_retry_config(mut self, config: RetryConfig) -> Self {
        self.retry_client = RetryableClient::with_config(config);
        self
    }

    async fn post_json(
        &self,
        url: impl AsRef<str>,
        body: &impl Serialize,
    ) -> Result<reqwest::Response, HttpEngineError> {
        let url = url.as_ref().to_string();
        let body_bytes = serde_json::to_vec(body)
            .map_err(|e| HttpEngineError::Serialization(e.to_string()))?;

        self.retry_client
            .execute_with_retry(|| async {
                let request = self
                    .http_client
                    .post(&url)
                    .timeout(self.timeout)
                    .header("content-type", "application/json")
                    .body(body_bytes.clone());

                let response = request.send().await.map_err(|e| {
                    if e.is_timeout() {
                        RetryError::Transient(format!("timeout: {}", e))
                    } else if e.is_connect() {
                        RetryError::Transient(format!("connection: {}", e))
                    } else {
                        RetryError::Permanent(format!("request failed: {}", e))
                    }
                })?;

                match response.status() {
                    StatusCode::OK | StatusCode::CREATED | StatusCode::ACCEPTED => Ok(response),
                    status if status.is_server_error() => {
                        Err(RetryError::Transient(format!("server error: {}", status)))
                    }
                    status => Err(RetryError::Permanent(format!("client error: {}", status))),
                }
            })
            .await
            .map_err(Into::into)
    }

    async fn get_json<T: serde::de::DeserializeOwned>(
        &self,
        url: impl AsRef<str>,
    ) -> Result<T, HttpEngineError> {
        let url = url.as_ref().to_string();

        self.retry_client
            .execute_with_retry(|| async {
                let response = self
                    .http_client
                    .get(&url)
                    .timeout(self.timeout)
                    .send()
                    .await
                    .map_err(|e| {
                        if e.is_timeout() {
                            RetryError::Transient(format!("timeout: {}", e))
                        } else if e.is_connect() {
                            RetryError::Transient(format!("connection: {}", e))
                        } else {
                            RetryError::Permanent(format!("request failed: {}", e))
                        }
                    })?;

                match response.status() {
                    StatusCode::OK => response.json::<T>().await.map_err(|e| {
                        RetryError::Permanent(format!("deserialization: {}", e))
                    }),
                    StatusCode::NOT_FOUND => Err(RetryError::Permanent(format!("not found"))),
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

#[derive(Debug, Serialize)]
struct StartRequest {
    #[serde(flatten)]
    request: ExecutionRequest,
}

#[derive(Debug, Deserialize)]
struct StartResponse {
    execution_id: String,
    protocol_version: String,
}

#[derive(Debug, Serialize)]
struct SubmitRequest {
    input: ExecutionInput,
}

#[derive(Debug, Deserialize)]
struct StatusResponse {
    execution_id: String,
    state: String,
    phase: Option<String>,
    outputs: Vec<EngineOutput>,
    approvals: Vec<EngineApproval>,
    artifacts: Vec<EngineArtifact>,
}

#[derive(Debug, Deserialize)]
struct EngineOutput {
    key: String,
    value: serde_json::Value,
}

#[derive(Debug, Deserialize)]
struct EngineApproval {
    approval_id: String,
    prompt: String,
}

#[derive(Debug, Deserialize)]
struct EngineArtifact {
    artifact_id: String,
    name: String,
    path: String,
}

#[async_trait]
impl ExecutionEnginePort for HttpExecutionEngineClient {
    type Error = HttpEngineError;

    async fn start(
        &self,
        req: ExecutionRequest,
    ) -> Result<ExecutionHandle, Self::Error> {
        let url = format!("{}/api/executions", self.base_url);
        let response = self.post_json(&url, &StartRequest { request: req }).await?;

        let resp: StartResponse = response.json().await.map_err(|e| {
            HttpEngineError::Serialization(e.to_string())
        })?;

        if !decacan_agent_contract::is_compatible(&resp.protocol_version) {
            return Err(HttpEngineError::ProtocolMismatch {
                remote: resp.protocol_version,
                local: decacan_agent_contract::PROTOCOL_VERSION.to_string(),
            });
        }

        Ok(ExecutionHandle {
            execution_id: resp.execution_id,
        })
    }

    async fn submit(
        &self,
        execution_id: &str,
        input: ExecutionInput,
    ) -> Result<(), Self::Error> {
        let url = format!("{}/api/executions/{}/input", self.base_url, execution_id);
        self.post_json(&url, &SubmitRequest { input }).await?;
        Ok(())
    }

    async fn get_status(
        &self,
        execution_id: &str,
    ) -> Result<Option<ExecutionStatus>, Self::Error> {
        let url = format!("{}/api/executions/{}", self.base_url, execution_id);

        match self.get_json::<StatusResponse>(&url).await {
            Ok(resp) => {
                let state = match resp.state.as_str() {
                    "running" => ExecutionState::Running,
                    "blocked_on_input" => ExecutionState::BlockedOnInput,
                    "blocked_on_approval" => ExecutionState::BlockedOnApproval,
                    "completed" => ExecutionState::Completed,
                    "failed" => ExecutionState::Failed,
                    _ => ExecutionState::Running,
                };

                Ok(Some(ExecutionStatus {
                    execution_id: resp.execution_id,
                    state,
                    phase: resp.phase,
                    outputs: resp
                        .outputs
                        .into_iter()
                        .map(|o| decacan_runtime::ports::execution_engine::ExecutionOutput {
                            key: o.key,
                            value: o.value,
                        })
                        .collect(),
                    approvals: resp
                        .approvals
                        .into_iter()
                        .map(|a| PendingApproval {
                            approval_id: a.approval_id,
                            prompt: a.prompt,
                        })
                        .collect(),
                    artifacts: resp
                        .artifacts
                        .into_iter()
                        .map(|a| ArtifactReference {
                            artifact_id: a.artifact_id,
                            name: a.name,
                            path: a.path,
                        })
                        .collect(),
                }))
            }
            Err(HttpEngineError::RetryExhausted(msg)) if msg.contains("not found") => {
                Ok(None)
            }
            Err(e) => Err(e),
        }
    }

    async fn subscribe_events(
        &self,
        execution_id: &str,
    ) -> Result<BoxStream<'static, Result<ExecutionEvent, Self::Error>>, Self::Error> {
        let url = format!("{}/api/executions/{}/events", self.base_url, execution_id);

        let response = self
            .http_client
            .get(&url)
            .timeout(self.timeout * 3)
            .header("Accept", "text/event-stream")
            .send()
            .await
            .map_err(|e| HttpEngineError::EventStream(e.to_string()))?;

        if !response.status().is_success() {
            return Err(HttpEngineError::ServerError {
                status: response.status().as_u16(),
            });
        }

        let stream = response.bytes_stream().map(|result| {
            result
                .map_err(|e| HttpEngineError::EventStream(e.to_string()))
                .and_then(|bytes| {
                    let text = String::from_utf8_lossy(&bytes);
                    parse_sse_event(&text)
                })
        });

        Ok(Box::pin(stream))
    }
}

fn parse_sse_event(text: &str) -> Result<ExecutionEvent, HttpEngineError> {
    for line in text.lines() {
        let line = line.trim();
        if line.starts_with("data:") {
            let data = line.strip_prefix("data:").unwrap_or("").trim();
            if data.is_empty() {
                continue;
            }
            return serde_json::from_str::<ExecutionEvent>(data)
                .map_err(|e| HttpEngineError::Serialization(format!("SSE parse error: {}", e)));
        }
    }
    Err(HttpEngineError::EventStream("No data field in SSE event".into()))
}

use decacan_runtime::execution::coordinator::CoordinatorError;

#[derive(Debug, Clone)]
pub struct CoordinatorHttpExecutionEngineClient(HttpExecutionEngineClient);

impl CoordinatorHttpExecutionEngineClient {
    pub fn new(base_url: impl Into<String>, timeout: Duration) -> Self {
        Self(HttpExecutionEngineClient::new(base_url, timeout))
    }
}

#[async_trait]
impl ExecutionEnginePort for CoordinatorHttpExecutionEngineClient {
    type Error = CoordinatorError;

    async fn start(&self, req: ExecutionRequest) -> Result<ExecutionHandle, Self::Error> {
        self.0
            .start(req)
            .await
            .map_err(|e| CoordinatorError::Engine(e.to_string()))
    }

    async fn submit(
        &self,
        execution_id: &str,
        input: ExecutionInput,
    ) -> Result<(), Self::Error> {
        self.0
            .submit(execution_id, input)
            .await
            .map_err(|e| CoordinatorError::Engine(e.to_string()))
    }

    async fn get_status(
        &self,
        execution_id: &str,
    ) -> Result<Option<ExecutionStatus>, Self::Error> {
        self.0
            .get_status(execution_id)
            .await
            .map_err(|e| CoordinatorError::Engine(e.to_string()))
    }

    async fn subscribe_events(
        &self,
        execution_id: &str,
    ) -> Result<BoxStream<'static, Result<ExecutionEvent, Self::Error>>, Self::Error> {
        let stream = self
            .0
            .subscribe_events(execution_id)
            .await
            .map_err(|e| CoordinatorError::Engine(e.to_string()))?;
        Ok(stream
            .map(|result| result.map_err(|e| CoordinatorError::Engine(e.to_string())))
            .boxed())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn parse_sse_with_simple_event() {
        let text = "event: execution_event\ndata: {\"event_type\": \"heartbeat\", \"execution_id\": \"exec-1\", \"timestamp_ms\": 123}\n\n";
        let result = parse_sse_event(text);
        assert!(result.is_ok());
    }

    #[test]
    fn parse_sse_empty_data() {
        let text = "event: ping\n\n";
        assert!(parse_sse_event(text).is_err());
    }
}
