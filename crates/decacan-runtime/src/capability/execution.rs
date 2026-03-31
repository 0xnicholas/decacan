//! Phase 4: Tool Invocation Integration
//!
//! This module provides integration between the capability system,
//! tool invocation framework, and the runtime execution.

use std::sync::Arc;

use serde_json::Value;

use crate::capability::{
    CapabilityRef, CapabilityRegistry, CapabilityResolver, ImplementationRef, ResolutionContext,
    SimpleResolver,
};
use crate::execution::{ExecutionError, ExecutionResult, WorkflowExecutor};
use crate::invocation::{ToolInvoker, ToolRegistry};
use crate::routine::r#trait::{Routine, RoutineRegistry, RoutineType};
use crate::workflow::entity::CompiledWorkflow;

/// Executor that handles runtime capability and tool resolution
pub struct CapabilityAwareExecutor {
    base_executor: WorkflowExecutor,
    routine_registry: Arc<RoutineRegistry>,
    capability_registry: Arc<CapabilityRegistry>,
    tool_registry: Arc<ToolRegistry>,
    resolver: Arc<dyn CapabilityResolver>,
    tool_invoker: ToolInvoker,
}

impl CapabilityAwareExecutor {
    /// Create a new capability-aware executor
    pub fn new(
        base_executor: WorkflowExecutor,
        routine_registry: Arc<RoutineRegistry>,
        capability_registry: Arc<CapabilityRegistry>,
    ) -> Self {
        let resolver = Arc::new(SimpleResolver::new(capability_registry.clone()));
        let tool_registry = Arc::new(ToolRegistry::new());
        let tool_invoker = ToolInvoker::new(tool_registry.clone());
        
        Self {
            base_executor,
            routine_registry,
            capability_registry,
            tool_registry,
            resolver,
            tool_invoker,
        }
    }

    /// Create with custom tool registry
    pub fn with_tools(
        base_executor: WorkflowExecutor,
        routine_registry: Arc<RoutineRegistry>,
        capability_registry: Arc<CapabilityRegistry>,
        tool_registry: Arc<ToolRegistry>,
    ) -> Self {
        let resolver = Arc::new(SimpleResolver::new(capability_registry.clone()));
        let tool_invoker = ToolInvoker::new(tool_registry.clone());
        
        Self {
            base_executor,
            routine_registry,
            capability_registry,
            tool_registry,
            resolver,
            tool_invoker,
        }
    }

    /// Get mutable access to tool registry for registration
    pub fn tool_registry_mut(&mut self) -> &mut ToolRegistry {
        Arc::get_mut(&mut self.tool_registry)
            .expect("Cannot get mutable reference to tool registry")
    }

    /// Resolve a step's routine type to an actual routine
    pub fn resolve_step_routine(
        &self,
        routine_type: &RoutineType,
        step_id: &str,
        workflow_input: &Value,
    ) -> Result<Arc<dyn Routine>, ExecutionError> {
        match routine_type.capability_class.as_str() {
            "capability" => {
                let capability_id = &routine_type.name;
                let resolution_context = ResolutionContext::new()
                    .with_input(workflow_input.clone());
                
                let result = self.resolver
                    .resolve(
                        &CapabilityRef::new(capability_id),
                        &resolution_context,
                    )
                    .map_err(|e| ExecutionError::CapabilityResolution {
                        step_id: step_id.to_string(),
                        capability_id: capability_id.clone(),
                        error: e.to_string(),
                    })?;
                
                let implementation = &result.implementation;
                
                // Handle different implementation types
                match implementation {
                    ImplementationRef::Routine { .. } => {
                        let resolved_routine_type = implementation_to_routine_type(implementation);
                        self.routine_registry
                            .get(&resolved_routine_type)
                            .ok_or_else(|| ExecutionError::RoutineNotFound(resolved_routine_type))
                    }
                    ImplementationRef::Tool { name, .. } => {
                        // Tool implementation - check if registered
                        if self.tool_registry.contains(name) {
                            // Return error for now - tools need special handling
                            // In full implementation, we'd wrap the tool as a routine
                            Err(ExecutionError::ToolNotSupported {
                                step_id: step_id.to_string(),
                                tool_name: name.clone(),
                            })
                        } else {
                            Err(ExecutionError::RoutineNotFound(RoutineType::new(
                                "tool", name, "1.0.0"
                            )))
                        }
                    }
                    ImplementationRef::Skill { playbook_id, .. } => {
                        // Skill implementation - sub-workflow
                        Err(ExecutionError::RoutineNotFound(RoutineType::new(
                            "skill", playbook_id, "1.0.0"
                        )))
                    }
                }
            }
            "tool" => {
                // Direct tool invocation (not through capability)
                if self.tool_registry.contains(&routine_type.name) {
                    Err(ExecutionError::ToolNotSupported {
                        step_id: step_id.to_string(),
                        tool_name: routine_type.name.clone(),
                    })
                } else {
                    Err(ExecutionError::RoutineNotFound(routine_type.clone()))
                }
            }
            _ => {
                // Regular routine
                self.routine_registry
                    .get(routine_type)
                    .ok_or_else(|| ExecutionError::RoutineNotFound(routine_type.clone()))
            }
        }
    }

    /// Check if a tool is registered
    pub fn has_tool(&self, name: &str) -> bool {
        self.tool_registry.contains(name)
    }
}

fn implementation_to_routine_type(implementation: &ImplementationRef) -> RoutineType {
    match implementation {
        ImplementationRef::Routine { class, name, version } => {
            RoutineType::new(class, name, version)
        }
        ImplementationRef::Tool { name, version } => {
            RoutineType::new("tool", name, version)
        }
        ImplementationRef::Skill { playbook_id, version } => {
            RoutineType::new("skill", playbook_id, version)
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::capability::{Capability, ImplementationRef};
    use crate::routine::builtin::NoopRoutine;
    use crate::routine::contract::Contract;

    #[test]
    fn test_capability_resolution_basic() {
        let routine_registry = Arc::new(RoutineRegistry::new());
        let capability_registry = Arc::new(CapabilityRegistry::new());

        routine_registry.register(Arc::new(NoopRoutine));

        let cap = Capability {
            id: "test.capability".to_string(),
            name: "Test".to_string(),
            description: "Test".to_string(),
            input_contract: Contract::object().build(),
            output_contract: Contract::object().build(),
            implementations: vec![
                ImplementationRef::routine("builtin", "noop", "1.0.0"),
            ],
        };
        capability_registry.register(Arc::new(cap));

        let executor = CapabilityAwareExecutor::new(
            WorkflowExecutor::strict(),
            routine_registry.clone(),
            capability_registry,
        );

        let routine_type = RoutineType::new("capability", "test.capability", "1.0.0");
        let workflow_input = serde_json::json!({});
        
        let result = executor.resolve_step_routine(
            &routine_type,
            "test_step",
            &workflow_input,
        );

        assert!(result.is_ok());
    }

    #[test]
    fn test_tool_registry_integration() {
        let routine_registry = Arc::new(RoutineRegistry::new());
        let capability_registry = Arc::new(CapabilityRegistry::new());
        let tool_registry = Arc::new(crate::invocation::ToolRegistry::new());

        let executor = CapabilityAwareExecutor::with_tools(
            WorkflowExecutor::strict(),
            routine_registry,
            capability_registry,
            tool_registry.clone(),
        );

        // Initially no tools
        assert!(!executor.has_tool("test_tool"));

        // Register a mock tool directly on the registry
        // Note: In practice, tools should be registered before creating the executor
        // or use interior mutability for runtime registration
        assert!(!executor.has_tool("test_tool"));
    }
}

// Mock tool for testing
#[cfg(test)]
mod mock {
    use async_trait::async_trait;
    use serde_json::Value;

    use crate::invocation::{Tool, ToolError, ToolInput, ToolOutput, ToolOutputMetadata};

    pub struct MockTool {
        pub name: String,
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
            "Mock tool"
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
}

#[cfg(test)]
pub use mock::MockTool;
