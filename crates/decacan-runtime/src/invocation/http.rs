//! HTTP Tool Invoker
//!
//! Provides HTTP-based tool invocation for REST APIs.
//! Supports GET, POST, PUT, DELETE methods with JSON payloads.

use async_trait::async_trait;
use reqwest::{Client, Method, StatusCode};
use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::collections::HashMap;
use std::time::{Duration, Instant};

use crate::invocation::{Tool, ToolAuth, ToolError, ToolInput, ToolOutput, ToolOutputMetadata};

/// HTTP tool configuration
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct HttpToolConfig {
    /// Base URL for the API
    pub base_url: String,
    
    /// Default timeout in seconds
    #[serde(default = "default_timeout")]
    pub timeout_secs: u32,
    
    /// Default headers to include in all requests
    #[serde(skip_serializing_if = "Option::is_none")]
    pub default_headers: Option<HashMap<String, String>>,
    
    /// Whether to follow redirects
    #[serde(default = "default_follow_redirects")]
    pub follow_redirects: bool,
}

fn default_timeout() -> u32 {
    30
}

fn default_follow_redirects() -> bool {
    true
}

impl HttpToolConfig {
    /// Create a new HTTP tool config
    pub fn new(base_url: impl Into<String>) -> Self {
        Self {
            base_url: base_url.into(),
            timeout_secs: default_timeout(),
            default_headers: None,
            follow_redirects: default_follow_redirects(),
        }
    }

    /// Set timeout
    pub fn with_timeout(mut self, secs: u32) -> Self {
        self.timeout_secs = secs;
        self
    }

    /// Add default headers
    pub fn with_headers(mut self, headers: HashMap<String, String>) -> Self {
        self.default_headers = Some(headers);
        self
    }
}

/// HTTP-based tool implementation
pub struct HttpTool {
    name: String,
    version: String,
    description: String,
    config: HttpToolConfig,
    client: Client,
}

impl HttpTool {
    /// Create a new HTTP tool
    pub fn new(
        name: impl Into<String>,
        description: impl Into<String>,
        config: HttpToolConfig,
    ) -> Self {
        let client = Client::builder()
            .timeout(Duration::from_secs(config.timeout_secs as u64))
            .redirect(if config.follow_redirects {
                reqwest::redirect::Policy::default()
            } else {
                reqwest::redirect::Policy::none()
            })
            .build()
            .expect("Failed to create HTTP client");

        Self {
            name: name.into(),
            version: "1.0.0".to_string(),
            description: description.into(),
            config,
            client,
        }
    }

    /// Build the full URL from path
    fn build_url(&self, path: &str) -> String {
        let base = self.config.base_url.trim_end_matches('/');
        let path = path.trim_start_matches('/');
        format!("{}/{}", base, path)
    }

    /// Apply authentication to request builder
    fn apply_auth(
        &self,
        builder: reqwest::RequestBuilder,
        auth: Option<&ToolAuth>,
    ) -> reqwest::RequestBuilder {
        match auth {
            Some(ToolAuth::Bearer { token }) => {
                builder.header("Authorization", format!("Bearer {}", token))
            }
            Some(ToolAuth::ApiKey { key, header }) => {
                builder.header(header.clone(), key.clone())
            }
            Some(ToolAuth::Basic { username, password }) => {
                builder.basic_auth(username, Some(password))
            }
            None => builder,
        }
    }

    /// Apply default headers
    fn apply_default_headers(
        &self,
        builder: reqwest::RequestBuilder,
    ) -> reqwest::RequestBuilder {
        let mut builder = builder;
        
        // Always add JSON content type
        builder = builder.header("Content-Type", "application/json");
        builder = builder.header("Accept", "application/json");
        
        // Add custom default headers
        if let Some(ref headers) = self.config.default_headers {
            for (key, value) in headers {
                builder = builder.header(key.clone(), value.clone());
            }
        }
        
        builder
    }
}

#[async_trait]
impl Tool for HttpTool {
    fn name(&self) -> &str {
        &self.name
    }

    fn version(&self) -> &str {
        &self.version
    }

    fn description(&self) -> &str {
        &self.description
    }

    async fn invoke(
        &self,
        input: &ToolInput,
    ) -> Result<ToolOutput, ToolError> {
        let start = Instant::now();
        
        // Parse input parameters
        let method_str = input.parameters.get("method")
            .and_then(|v| v.as_str())
            .unwrap_or("GET");
        
        let path = input.parameters.get("path")
            .and_then(|v| v.as_str())
            .unwrap_or("/");
        
        let body = input.parameters.get("body");
        
        let method = match method_str.to_uppercase().as_str() {
            "GET" => Method::GET,
            "POST" => Method::POST,
            "PUT" => Method::PUT,
            "DELETE" => Method::DELETE,
            "PATCH" => Method::PATCH,
            _ => Method::GET,
        };
        
        let url = self.build_url(path);
        
        // Build request
        let mut builder = self.client.request(method, &url);
        builder = self.apply_default_headers(builder);
        builder = self.apply_auth(builder, input.auth.as_ref());
        
        // Add custom headers from input
        if let Some(ref metadata) = input.metadata {
            for (key, value) in metadata {
                if key.to_lowercase().starts_with("header_") {
                    let header_name = key.strip_prefix("header_").unwrap_or(key);
                    builder = builder.header(header_name, value);
                }
            }
        }
        
        // Add body for POST/PUT/PATCH
        if let Some(body_value) = body {
            builder = builder.json(body_value);
        }
        
        // Execute request
        let response = builder.send().await.map_err(|e| {
            if e.is_timeout() {
                ToolError::Timeout {
                    tool_name: self.name.clone(),
                    timeout_secs: self.config.timeout_secs,
                }
            } else if e.is_connect() {
                ToolError::NetworkError {
                    tool_name: self.name.clone(),
                    error: e.to_string(),
                }
            } else {
                ToolError::ExecutionFailed {
                    tool_name: self.name.clone(),
                    error: e.to_string(),
                }
            }
        })?;
        
        let status = response.status();
        let headers: HashMap<String, String> = response
            .headers()
            .iter()
            .filter_map(|(k, v)| {
                v.to_str().ok().map(|v| (k.to_string(), v.to_string()))
            })
            .collect();
        
        // Parse response body
        let data: Value = response.json().await.unwrap_or_else(|_| {
            serde_json::json!({"raw_response": "Non-JSON response"})
        });
        
        let duration = start.elapsed().as_millis() as u64;
        
        Ok(ToolOutput {
            data,
            status_code: Some(status.as_u16()),
            headers: Some(headers),
            metadata: ToolOutputMetadata {
                tool_name: self.name.clone(),
                duration_ms: duration,
                executed_at: chrono::Utc::now().to_rfc3339(),
            },
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_http_tool_config() {
        let config = HttpToolConfig::new("https://api.example.com")
            .with_timeout(60)
            .with_headers({
                let mut h = HashMap::new();
                h.insert("X-API-Version".to_string(), "v2".to_string());
                h
            });

        assert_eq!(config.base_url, "https://api.example.com");
        assert_eq!(config.timeout_secs, 60);
        assert!(config.default_headers.is_some());
    }

    #[test]
    fn test_build_url() {
        let config = HttpToolConfig::new("https://api.example.com/");
        let tool = HttpTool::new("test", "Test API", config);

        assert_eq!(tool.build_url("/users"), "https://api.example.com/users");
        assert_eq!(tool.build_url("users"), "https://api.example.com/users");
    }

    #[tokio::test]
    async fn test_http_tool_mock() {
        // This would normally use a mock server
        // For now, just verify the tool structure is correct
        let config = HttpToolConfig::new("https://httpbin.org");
        let tool = HttpTool::new("httpbin", "HTTP Bin Test API", config);

        assert_eq!(tool.name(), "httpbin");
        assert_eq!(tool.version(), "1.0.0");
        assert_eq!(tool.description(), "HTTP Bin Test API");
    }
}
