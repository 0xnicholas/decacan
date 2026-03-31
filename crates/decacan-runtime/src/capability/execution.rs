//! Phase 3: Capability-aware execution integration
//!
//! This module provides integration between the capability system and the runtime execution.

use std::sync::Arc;

use serde_json::Value;

use crate::capability::{
    CapabilityRef, CapabilityRegistry, CapabilityResolver, ImplementationRef, ResolutionContext,
    SimpleResolver,
};
use crate::execution::{ExecutionError, ExecutionResult, WorkflowExecutor};
use crate::ports::clock::ClockPort;
use crate::ports::filesystem::FilesystemPort;
use crate::ports::storage::StoragePort;
use crate::routine::r#trait::{Routine, RoutineRegistry, RoutineType};
use crate::workflow::entity::CompiledWorkflow;

/// Executor that handles runtime capability resolution
pub struct CapabilityAwareExecutor {
    base_executor: WorkflowExecutor,
    routine_registry: Arc<RoutineRegistry>,
    capability_registry: Arc<CapabilityRegistry>,
    resolver: Arc<dyn CapabilityResolver>,
}

impl CapabilityAwareExecutor {
    /// Create a new capability-aware executor
    pub fn new(
        base_executor: WorkflowExecutor,
        routine_registry: Arc<RoutineRegistry>,
        capability_registry: Arc<CapabilityRegistry>,
    ) -> Self {
        let resolver = Arc::new(SimpleResolver::new(capability_registry.clone()));
        
        Self {
            base_executor,
            routine_registry,
            capability_registry,
            resolver,
        }
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
                let resolved_routine_type = implementation_to_routine_type(implementation);
                
                self.routine_registry
                    .get(&resolved_routine_type)
                    .ok_or_else(|| ExecutionError::RoutineNotFound(resolved_routine_type))
            }
            "tool" => {
                Err(ExecutionError::ToolNotSupported {
                    step_id: step_id.to_string(),
                    tool_name: routine_type.name.clone(),
                })
            }
            _ => {
                self.routine_registry
                    .get(routine_type)
                    .ok_or_else(|| ExecutionError::RoutineNotFound(routine_type.clone()))
            }
        }
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
