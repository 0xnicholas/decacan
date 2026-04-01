use super::types::{ModelRequest, ModelResponse};
use async_trait::async_trait;
use std::error::Error;
use std::fmt;

/// 模型提供商 trait
#[async_trait]
pub trait ModelProvider: Send + Sync {
    /// 提供商名称
    fn name(&self) -> &str;

    /// 支持的模型列表
    fn supported_models(&self) -> Vec<&str>;

    /// 执行模型请求
    async fn complete(&self, request: ModelRequest) -> Result<ModelResponse, ProviderError>;
}

/// 提供商错误
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ProviderError {
    ApiError(String),
    AuthenticationError(String),
    RateLimitError(String),
    TimeoutError(String),
    InvalidRequest(String),
    NetworkError(String),
}

impl fmt::Display for ProviderError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ProviderError::ApiError(msg) => write!(f, "API error: {}", msg),
            ProviderError::AuthenticationError(msg) => {
                write!(f, "Authentication error: {}", msg)
            }
            ProviderError::RateLimitError(msg) => write!(f, "Rate limit: {}", msg),
            ProviderError::TimeoutError(msg) => write!(f, "Timeout: {}", msg),
            ProviderError::InvalidRequest(msg) => write!(f, "Invalid request: {}", msg),
            ProviderError::NetworkError(msg) => write!(f, "Network error: {}", msg),
        }
    }
}

impl Error for ProviderError {}

impl From<reqwest::Error> for ProviderError {
    fn from(err: reqwest::Error) -> Self {
        if err.is_timeout() {
            ProviderError::TimeoutError(err.to_string())
        } else if err.is_connect() {
            ProviderError::NetworkError(err.to_string())
        } else {
            ProviderError::ApiError(err.to_string())
        }
    }
}
