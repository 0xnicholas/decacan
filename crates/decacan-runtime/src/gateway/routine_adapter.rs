//! Tool Gateway Routine Adapter
//!
//! This module provides adapters that wrap Tool Gateway calls as Routine trait
//! implementations. This enables the new execution engine to work with existing
//! tools while maintaining policy enforcement and security.
//!
//! # Key Components
//!
//! - [`ToolGatewayRoutine`]: Wraps tool calls as Routine implementations
//! - [`ToolGatewayRoutineRegistry`]: Registry for managing tool routines
//! - [`ToolGatewayRoutineBuilder`]: Builder for creating custom tool routines
//!
//! # Example
//!
//! ```rust,ignore
//! let routine = ToolGatewayRoutine::read_file();
//! let mut ctx = RoutineContext::new("/tmp", "step1", "run1", "task1");
//! let output = routine.execute(&mut ctx, input).await?;
//! ```

use std::collections::HashMap;
use std::path::PathBuf;

use async_trait::async_trait;
use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use time::OffsetDateTime;

use crate::gateway::descriptor::ToolDescriptor;
use crate::gateway::request::ToolRequest;
use crate::gateway::result::PolicyDecision;
use crate::gateway::tool_gateway::ToolGateway;
use crate::ports::clock::ClockPort;
use crate::routine::contract::Contract;
use crate::routine::context::RoutineContext;
use crate::routine::error::RoutineError;
use crate::routine::r#trait::{Routine, RoutineType};

/// A routine that executes through the Tool Gateway
/// 
/// This wraps tool calls as Routine trait implementations, enabling
/// the new execution engine to work with existing tools.
pub struct ToolGatewayRoutine {
    tool_name: String,
    tool_description: String,
    input_contract: Contract,
    output_contract: Contract,
}

impl ToolGatewayRoutine {
    /// Create a new Tool Gateway routine
    pub fn new(
        tool_name: impl Into<String>,
        tool_description: impl Into<String>,
        input_contract: Contract,
        output_contract: Contract,
    ) -> Self {
        Self {
            tool_name: tool_name.into(),
            tool_description: tool_description.into(),
            input_contract,
            output_contract,
        }
    }

    /// Create a routine for a filesystem read operation
    pub fn read_file() -> Self {
        Self::new(
            "workspace.read",
            "Read file contents from workspace",
            crate::routine::contract::Contract::object()
                .field("path", crate::routine::contract::Contract::path())
                .build(),
            crate::routine::contract::Contract::object()
                .field("content", crate::routine::contract::Contract::string())
                .optional_field("encoding", crate::routine::contract::Contract::string())
                .build(),
        )
    }

    /// Create a routine for a filesystem write operation
    pub fn write_file() -> Self {
        Self::new(
            "workspace.write",
            "Write content to file in workspace",
            crate::routine::contract::Contract::object()
                .field("path", crate::routine::contract::Contract::path())
                .field("content", crate::routine::contract::Contract::string())
                .optional_field("encoding", crate::routine::contract::Contract::string())
                .build(),
            crate::routine::contract::Contract::object()
                .field("bytes_written", crate::routine::contract::Contract::integer())
                .field("path", crate::routine::contract::Contract::path())
                .build(),
        )
    }

    /// Create a routine for scanning markdown files
    pub fn scan_markdown() -> Self {
        Self::new(
            "workspace.scan_markdown",
            "Scan workspace for markdown files",
            crate::routine::contract::Contract::object()
                .optional_field("directory", crate::routine::contract::Contract::path())
                .optional_field("recursive", crate::routine::contract::Contract::boolean())
                .build(),
            crate::routine::contract::Contract::object()
                .field("files", crate::routine::contract::Contract::array(
                    crate::routine::contract::Contract::path()
                ).build())
                .field("count", crate::routine::contract::Contract::integer())
                .build(),
        )
    }

    /// Create a routine for semantic completion
    pub fn semantic_complete() -> Self {
        Self::new(
            "semantic.complete",
            "Generate content using semantic model",
            crate::routine::contract::Contract::object()
                .field("prompt", crate::routine::contract::Contract::string())
                .optional_field("context", crate::routine::contract::Contract::string())
                .optional_field("max_tokens", crate::routine::contract::Contract::integer())
                .build(),
            crate::routine::contract::Contract::object()
                .field("content", crate::routine::contract::Contract::string())
                .optional_field("tokens_used", crate::routine::contract::Contract::integer())
                .build(),
        )
    }

    /// Get the tool name
    pub fn tool_name(&self) -> &str {
        &self.tool_name
    }

    /// Execute the tool through the gateway
    async fn execute_through_gateway(
        &self,
        gateway: &ToolGateway,
        input: &Value,
        clock: &dyn ClockPort,
    ) -> Result<Value, RoutineError> {
        // Build tool request from input
        let action = self.extract_action(input);
        let target_path = self.extract_target_path(input);
        
        let tool_request = ToolRequest::new(
            ToolDescriptor::new(&self.tool_name,
                &self.tool_description,
            ),
            action,
        )
        .with_overwrite_existing(self.should_overwrite(input))
        .with_target_path_opt(target_path);

        // Evaluate through gateway
        let (decision, _record) = gateway.evaluate(tool_request, clock.now_utc());

        match decision {
            PolicyDecision::Allow { .. } => {
                // Tool is allowed, execute it
                self.execute_tool(input).await
            }
            PolicyDecision::ApprovalRequired { reason } => {
                Err(RoutineError::SynthesisBlocked(format!(
                    "Tool '{}' requires approval: {}",
                    self.tool_name, reason
                )))
            }
            PolicyDecision::Deny { reason } => {
                Err(RoutineError::SynthesisFailed(format!(
                    "Tool '{}' denied: {}",
                    self.tool_name, reason
                )))
            }
        }
    }

    /// Extract action from input
    fn extract_action(&self, input: &Value) -> String {
        // Default action based on tool type
        if self.tool_name.contains("read") {
            "read".to_string()
        } else if self.tool_name.contains("write") {
            "write".to_string()
        } else if self.tool_name.contains("scan") {
            "scan".to_string()
        } else {
            "invoke".to_string()
        }
    }

    /// Extract target path from input
    fn extract_target_path(&self, input: &Value) -> Option<PathBuf> {
        input
            .get("path")
            .and_then(|v| v.as_str())
            .map(PathBuf::from)
    }

    /// Check if overwrite is requested
    fn should_overwrite(&self, input: &Value) -> bool {
        input
            .get("overwrite")
            .and_then(|v| v.as_bool())
            .unwrap_or(false)
    }

    /// Execute the actual tool logic
    async fn execute_tool(
        &self,
        input: &Value,
    ) -> Result<Value, RoutineError> {
        // This is a simplified implementation
        // In production, this would call actual tool implementations
        
        match self.tool_name.as_str() {
            "workspace.read" => {
                let path = input
                    .get("path")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| RoutineError::Execution("Missing path".to_string()))?;
                
                // Mock read operation
                Ok(json!({
                    "content": format!("Content of {}", path),
                    "encoding": "utf-8"
                }))
            }
            "workspace.write" => {
                let path = input
                    .get("path")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| RoutineError::Execution("Missing path".to_string()))?;
                let content = input
                    .get("content")
                    .and_then(|v| v.as_str())
                    .unwrap_or("");
                
                // Mock write operation
                Ok(json!({
                    "bytes_written": content.len(),
                    "path": path
                }))
            }
            "workspace.scan_markdown" => {
                // Mock scan operation
                Ok(json!({
                    "files": ["file1.md", "file2.md"],
                    "count": 2
                }))
            }
            "semantic.complete" => {
                let prompt = input
                    .get("prompt")
                    .and_then(|v| v.as_str())
                    .ok_or_else(|| RoutineError::Execution("Missing prompt".to_string()))?;
                
                // Mock semantic completion
                Ok(json!({
                    "content": format!("Generated content for: {}", prompt),
                    "tokens_used": 100
                }))
            }
            _ => {
                Err(RoutineError::Execution(format!(
                    "Unknown tool: {}",
                    self.tool_name
                )))
            }
        }
    }
}

#[async_trait]
impl Routine for ToolGatewayRoutine {
    fn routine_type(&self) -> RoutineType {
        RoutineType::new(
            "tool",
            &self.tool_name,
            "1.0.0",
        )
    }

    fn input_contract(&self) -> &Contract {
        &self.input_contract
    }

    fn output_contract(&self) -> &Contract {
        &self.output_contract
    }

    async fn execute(
        &self,
        _ctx: &mut RoutineContext,
        input: Value,
    ) -> Result<Value, RoutineError> {
        // For now, execute without gateway (direct execution)
        // In production, this would use the gateway from context
        self.execute_tool(&input).await
    }
}

/// Builder for creating Tool Gateway routines
pub struct ToolGatewayRoutineBuilder {
    tool_name: String,
    tool_description: String,
    input_contract: Option<Contract>,
    output_contract: Option<Contract>,
}

impl ToolGatewayRoutineBuilder {
    /// Create a new builder
    pub fn new(tool_name: impl Into<String>) -> Self {
        Self {
            tool_name: tool_name.into(),
            tool_description: String::new(),
            input_contract: None,
            output_contract: None,
        }
    }

    /// Set the description
    pub fn description(mut self, desc: impl Into<String>) -> Self {
        self.tool_description = desc.into();
        self
    }

    /// Set the input contract
    pub fn input_contract(mut self, contract: Contract) -> Self {
        self.input_contract = Some(contract);
        self
    }

    /// Set the output contract
    pub fn output_contract(mut self, contract: Contract) -> Self {
        self.output_contract = Some(contract);
        self
    }

    /// Build the routine
    pub fn build(self) -> Result<ToolGatewayRoutine, String> {
        let input_contract = self
            .input_contract
            .ok_or("Input contract is required")?;
        let output_contract = self
            .output_contract
            .ok_or("Output contract is required")?;

        Ok(ToolGatewayRoutine::new(
            self.tool_name,
            self.tool_description,
            input_contract,
            output_contract,
        ))
    }
}

/// Registry for Tool Gateway routines
pub struct ToolGatewayRoutineRegistry {
    routines: HashMap<String, ToolGatewayRoutine>,
}

impl ToolGatewayRoutineRegistry {
    /// Create a new registry with built-in tool routines
    pub fn new() -> Self {
        let mut registry = Self {
            routines: HashMap::new(),
        };
        
        // Register built-in routines
        registry.register(ToolGatewayRoutine::read_file());
        registry.register(ToolGatewayRoutine::write_file());
        registry.register(ToolGatewayRoutine::scan_markdown());
        registry.register(ToolGatewayRoutine::semantic_complete());
        
        registry
    }

    /// Register a routine
    pub fn register(&mut self,
        routine: ToolGatewayRoutine,
    ) {
        self.routines.insert(routine.tool_name.clone(), routine);
    }

    /// Get a routine by name
    pub fn get(&self, name: &str) -> Option<&ToolGatewayRoutine> {
        self.routines.get(name)
    }

    /// List all registered tool names
    pub fn list_tools(&self) -> Vec<&String> {
        self.routines.keys().collect()
    }

    /// Convert to general RoutineRegistry
    pub fn to_routine_registry(self) -> crate::routine::RoutineRegistry {
        use std::sync::Arc;
        let registry = crate::routine::RoutineRegistry::new();
        
        for (_, routine) in self.routines {
            registry.register(Arc::new(routine));
        }
        
        registry
    }
}

impl Default for ToolGatewayRoutineRegistry {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_tool_routine_creation() {
        let routine = ToolGatewayRoutine::read_file();
        
        assert_eq!(routine.tool_name(), "workspace.read");
        assert_eq!(routine.routine_type().name, "workspace.read");
        assert_eq!(routine.routine_type().capability_class, "tool");
    }

    #[test]
    fn test_tool_routine_contracts() {
        let routine = ToolGatewayRoutine::write_file();
        
        // Input should require path and content
        let valid_input = json!({
            "path": "/tmp/test.txt",
            "content": "hello"
        });
        assert!(routine.validate_input(&valid_input).is_ok());

        // Missing required field
        let invalid_input = json!({
            "path": "/tmp/test.txt"
        });
        assert!(routine.validate_input(&invalid_input).is_err());
    }

    #[tokio::test]
    async fn test_tool_routine_execute_read() {
        let routine = ToolGatewayRoutine::read_file();
        let mut ctx = RoutineContext::new("/tmp", "step1", "run1", "task1");
        
        let input = json!({
            "path": "/tmp/test.md"
        });
        
        let result = routine.execute(&mut ctx, input).await;
        assert!(result.is_ok());
        
        let output = result.unwrap();
        assert!(output.get("content").is_some());
    }

    #[tokio::test]
    async fn test_tool_routine_execute_write() {
        let routine = ToolGatewayRoutine::write_file();
        let mut ctx = RoutineContext::new("/tmp", "step1", "run1", "task1");
        
        let input = json!({
            "path": "/tmp/output.md",
            "content": "Hello World"
        });
        
        let result = routine.execute(&mut ctx, input).await;
        assert!(result.is_ok());
        
        let output = result.unwrap();
        assert_eq!(output.get("bytes_written"), Some(&json!(11)));
    }

    #[test]
    fn test_tool_registry() {
        let registry = ToolGatewayRoutineRegistry::new();
        
        let tools = registry.list_tools();
        assert!(tools.contains(&&"workspace.read".to_string()));
        assert!(tools.contains(&&"workspace.write".to_string()));
        assert!(tools.contains(&&"workspace.scan_markdown".to_string()));
        assert!(tools.contains(&&"semantic.complete".to_string()));
    }

    #[test]
    fn test_builder() {
        let result = ToolGatewayRoutineBuilder::new("custom.tool")
            .description("A custom tool")
            .input_contract(
                crate::routine::contract::Contract::object()
                    .field("param", crate::routine::contract::Contract::string())
                    .build()
            )
            .output_contract(
                crate::routine::contract::Contract::object()
                    .field("result", crate::routine::contract::Contract::string())
                    .build()
            )
            .build();
        
        assert!(result.is_ok());
        let routine = result.unwrap();
        assert_eq!(routine.tool_name(), "custom.tool");
    }
}
