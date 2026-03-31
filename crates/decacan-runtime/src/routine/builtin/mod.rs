use async_trait::async_trait;
use once_cell::sync::Lazy;
use serde_json::{json, Value};

use crate::capability::entities::CapabilityRef;
use crate::routine::contract::Contract;
use crate::routine::context::RoutineContext;
use crate::routine::error::RoutineError;
use crate::routine::r#trait::{Routine, RoutineType};

/// A no-op routine that does nothing and returns an empty object
pub struct NoopRoutine;

#[async_trait]
impl Routine for NoopRoutine {
    fn routine_type(&self) -> RoutineType {
        RoutineType::new("builtin", "noop", "1.0.0")
    }

    fn input_contract(&self) -> &Contract {
        static CONTRACT: Lazy<Contract> = Lazy::new(|| Contract::object().build());
        &CONTRACT
    }

    fn output_contract(&self) -> &Contract {
        static CONTRACT: Lazy<Contract> = Lazy::new(|| Contract::object().build());
        &CONTRACT
    }

    async fn execute(
        &self,
        _ctx: &mut RoutineContext,
        _input: Value,
    ) -> Result<Value, RoutineError> {
        Ok(json!({}))
    }

    fn provides_capability(&self) -> Option<CapabilityRef> {
        Some(CapabilityRef::new("builtin.noop"))
    }
}

/// A routine that echoes back the input
pub struct EchoRoutine;

#[async_trait]
impl Routine for EchoRoutine {
    fn routine_type(&self) -> RoutineType {
        RoutineType::new("builtin", "echo", "1.0.0")
    }

    fn input_contract(&self) -> &Contract {
        static CONTRACT: Lazy<Contract> = Lazy::new(|| {
            Contract::object()
                .field("message", Contract::string())
                .build()
        });
        &CONTRACT
    }

    fn output_contract(&self) -> &Contract {
        static CONTRACT: Lazy<Contract> = Lazy::new(|| {
            Contract::object()
                .field("echo", Contract::string())
                .build()
        });
        &CONTRACT
    }

    async fn execute(
        &self,
        _ctx: &mut RoutineContext,
        input: Value,
    ) -> Result<Value, RoutineError> {
        let message = input
            .get("message")
            .and_then(|v| v.as_str())
            .unwrap_or("");
        
        Ok(json!({"echo": message}))
    }

    fn provides_capability(&self) -> Option<CapabilityRef> {
        Some(CapabilityRef::new("builtin.echo"))
    }
}

/// Create a registry with all builtin routines registered
pub fn create_builtin_registry() -> super::RoutineRegistry {
    use std::sync::Arc;
    
    let registry = super::RoutineRegistry::new();
    
    registry.register(Arc::new(NoopRoutine));
    registry.register(Arc::new(EchoRoutine));
    
    registry
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::routine::context::RoutineContext;
    
    #[tokio::test]
    async fn test_noop_routine() {
        let routine = NoopRoutine;
        let mut ctx = RoutineContext::new("/tmp", "step1", "run1", "task1");
        
        let result = routine.execute(&mut ctx, json!({})).await;
        
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), json!({}));
    }

    #[tokio::test]
    async fn test_echo_routine() {
        let routine = EchoRoutine;
        let mut ctx = RoutineContext::new("/tmp", "step1", "run1", "task1");
        
        let result = routine.execute(
            &mut ctx,
            json!({"message": "hello world"}),
        ).await;
        
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), json!({"echo": "hello world"}));
    }

    #[test]
    fn test_builtin_registry() {
        let registry = create_builtin_registry();

        let noop_type = RoutineType::new("builtin", "noop", "1.0.0");
        let echo_type = RoutineType::new("builtin", "echo", "1.0.0");

        assert!(registry.contains(&noop_type));
        assert!(registry.contains(&echo_type));

        let available = registry.list_available();
        assert_eq!(available.len(), 2);
    }

    #[test]
    fn test_noop_provides_capability() {
        let routine = NoopRoutine;
        let cap = routine.provides_capability();

        assert!(cap.is_some());
        assert_eq!(cap.unwrap().id, "builtin.noop");
    }

    #[test]
    fn test_echo_provides_capability() {
        let routine = EchoRoutine;
        let cap = routine.provides_capability();

        assert!(cap.is_some());
        assert_eq!(cap.unwrap().id, "builtin.echo");
    }
}
