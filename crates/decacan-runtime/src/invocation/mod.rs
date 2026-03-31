//! Tool Invocation Framework - Phase 4
//!
//! Provides a pluggable system for invoking external tools (HTTP APIs, CLI commands, etc.)
//! through a unified interface. Tools are resolved from capabilities and executed
//! with proper error handling and authentication.
//!
//! # Example
//!
//! ```rust,ignore
//! let tool_registry = ToolRegistry::new();
//! tool_registry.register(Box::new(HttpTool::new("api.example.com")));
//!
//! let invoker = ToolInvoker::new(tool_registry);
//! let result = invoker.invoke("http_api", tool_input).await?;
//! ```

pub mod http;

pub use http::{HttpTool, HttpToolConfig};

use std::collections::HashMap;
use std::sync::Arc;

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use serde_json::Value;
use thiserror::Error;

/// Input for tool invocation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolInput {
    /// Tool-specific parameters
    pub parameters: Value,
    
    /// Authentication context (if required)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub auth: Option<ToolAuth>,
    
    /// Request metadata
    #[serde(skip_serializing_if = "Option::is_none")]
    pub metadata: Option<HashMap<String, String>>,
}

impl ToolInput {
    /// Create tool input with parameters
    pub fn new(parameters: Value) -> Self {
        Self {
            parameters,
            auth: None,
            metadata: None,
        }
    }

    /// Add authentication
    pub fn with_auth(mut self, auth: ToolAuth) -> Self {
        self.auth = Some(auth);
        self
    }

    /// Add metadata
    pub fn with_metadata(mut self, metadata: HashMap<String, String>) -> Self {
        self.metadata = Some(metadata);
        self
    }
}

/// Authentication for tool invocation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ToolAuth {
    /// Bearer token authentication
    Bearer { token: String },
    
    /// API key authentication
    ApiKey { key: String, header: String },
    
    /// Basic authentication
    Basic { username: String, password: String },
}

/// Output from tool invocation
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolOutput {
    /// Response data
    pub data: Value,
    
    /// HTTP status code (for HTTP tools)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub status_code: Option<u16>,
    
    /// Response headers (for HTTP tools)
    #[serde(skip_serializing_if = "Option::is_none")]
    pub headers: Option<HashMap<String, String>>,
    
    /// Execution metadata
    pub metadata: ToolOutputMetadata,
}

/// Metadata about tool execution
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ToolOutputMetadata {
    /// Tool name that was invoked
    pub tool_name: String,
    
    /// Duration in milliseconds
    pub duration_ms: u64,
    
    /// Timestamp of execution
    pub executed_at: String,
}

/// Errors that can occur during tool invocation
#[derive(Debug, Error, Clone)]
pub enum ToolError {
    #[error("tool '{tool_name}' not found")]
    ToolNotFound { tool_name: String },
    
    #[error("tool '{tool_name}' execution failed: {error}")]
    ExecutionFailed { tool_name: String, error: String },
    
    #[error("authentication failed for tool '{tool_name}': {error}")]
    AuthenticationFailed { tool_name: String, error: String },
    
    #[error("network error for tool '{tool_name}': {error}")]
    NetworkError { tool_name: String, error: String },
    
    #[error("timeout invoking tool '{tool_name}' after {timeout_secs}s")]
    Timeout { tool_name: String, timeout_secs: u32 },
    
    #[error("invalid input for tool '{tool_name}': {error}")]
    InvalidInput { tool_name: String, error: String },
}

/// Trait for invokable tools
///
/// Implement this trait to create custom tool integrations.
/// Tools are registered in the ToolRegistry and invoked by name.
#[async_trait]
pub trait Tool: Send + Sync {
    /// Get the tool name
    fn name(&self) -> &str;
    
    /// Get the tool version
    fn version(&self) -> &str;
    
    /// Get tool description
    fn description(&self) -> &str;
    
    /// Invoke the tool with given input
    ///
    /// # Arguments
    /// * `input` - Tool input parameters and authentication
    ///
    /// # Returns
    /// Tool output or error
    async fn invoke(&self,
        input: &ToolInput,
    ) -> Result<ToolOutput, ToolError>;
}

/// Tool registry for managing available tools
pub struct ToolRegistry {
    tools: HashMap<String, Box<dyn Tool>>,
}

impl ToolRegistry {
    /// Create a new empty tool registry
    pub fn new() -> Self {
        Self {
            tools: HashMap::new(),
        }
    }

    /// Register a tool
    pub fn register(&mut self,
        tool: Box<dyn Tool>,
    ) {
        let name = tool.name().to_string();
        self.tools.insert(name, tool);
    }

    /// Get a tool by name
    pub fn get(&self, name: &str) -> Option<&dyn Tool> {
        self.tools.get(name).map(|t| t.as_ref())
    }

    /// Check if a tool exists
    pub fn contains(&self, name: &str) -> bool {
        self.tools.contains_key(name)
    }

    /// List all registered tool names
    pub fn list(&self) -> Vec<String> {
        self.tools.keys().cloned().collect()
    }
}

impl Default for ToolRegistry {
    fn default() -> Self {
        Self::new()
    }
}

/// Tool invoker that executes tools by name
pub struct ToolInvoker {
    registry: Arc<ToolRegistry>,
    default_timeout_secs: u32,
}

impl ToolInvoker {
    /// Create a new tool invoker
    pub fn new(registry: Arc<ToolRegistry>) -> Self {
        Self {
            registry,
            default_timeout_secs: 30,
        }
    }

    /// Set default timeout
    pub fn with_timeout(mut self, secs: u32) -> Self {
        self.default_timeout_secs = secs;
        self
    }

    /// Invoke a tool by name
    ///
    /// # Arguments
    /// * `tool_name` - Name of the tool to invoke
    /// * `input` - Tool input parameters
    pub async fn invoke(
        &self,
        tool_name: &str,
        input: &ToolInput,
    ) -> Result<ToolOutput, ToolError> {
        let tool = self.registry
            .get(tool_name)
            .ok_or_else(|| ToolError::ToolNotFound {
                tool_name: tool_name.to_string(),
            })?;

        // TODO: Add timeout handling
        tool.invoke(input).await
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    struct MockTool {
        name: String,
    }

    #[async_trait]
    impl Tool for MockTool {
        fn name(&self) -> &str {
            &self.name
        }

        fn version(&self) -> &str {
            "1.0.0"
        }

        fn description(&self) -> &str {
            "Mock tool for testing"
        }

        async fn invoke(
            &self,
            input: &ToolInput,
        ) -> Result<ToolOutput, ToolError> {
            Ok(ToolOutput {
                data: input.parameters.clone(),
                status_code: Some(200),
                headers: None,
                metadata: ToolOutputMetadata {
                    tool_name: self.name.clone(),
                    duration_ms: 0,
                    executed_at: "2024-01-01T00:00:00Z".to_string(),
                },
            })
        }
    }

    #[test]
    fn test_tool_registry() {
        let mut registry = ToolRegistry::new();
        assert!(registry.list().is_empty());

        registry.register(Box::new(MockTool {
            name: "test_tool".to_string(),
        }));

        assert_eq!(registry.list().len(), 1);
        assert!(registry.contains("test_tool"));
        assert!(!registry.contains("missing"));

        let tool = registry.get("test_tool");
        assert!(tool.is_some());
        assert_eq!(tool.unwrap().name(), "test_tool");
    }

    #[tokio::test]
    async fn test_tool_invoker() {
        let mut registry = ToolRegistry::new();
        registry.register(Box::new(MockTool {
            name: "echo".to_string(),
        }));

        let invoker = ToolInvoker::new(Arc::new(registry));
        
        let input = ToolInput::new(serde_json::json!({"message": "hello"}));
        let result = invoker.invoke("echo", &input).await;

        assert!(result.is_ok());
        let output = result.unwrap();
        assert_eq!(output.data["message"], "hello");
        assert_eq!(output.metadata.tool_name, "echo");
    }

    #[tokio::test]
    async fn test_tool_not_found() {
        let registry = ToolRegistry::new();
        let invoker = ToolInvoker::new(Arc::new(registry));
        
        let input = ToolInput::new(serde_json::json!({}));
        let result = invoker.invoke("missing", &input).await;

        assert!(result.is_err());
        assert!(matches!(
            result.unwrap_err(),
            ToolError::ToolNotFound { tool_name } if tool_name == "missing"
        ));
    }
}
