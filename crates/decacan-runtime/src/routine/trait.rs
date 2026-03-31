use std::collections::HashMap;
use std::sync::{Arc, RwLock};

use crate::playbook::spec::entities::RoutineRef;

use super::contract::{Contract, ValidationError};
use super::context::RoutineContext;
use super::error::RoutineError;
use serde_json::Value;

/// Routine capability trait - the core abstraction for executable routines
#[async_trait::async_trait]
pub trait Routine: Send + Sync {
    /// Returns the routine type identifier
    fn routine_type(&self) -> RoutineType;

    /// Returns the input contract for validation
    fn input_contract(&self) -> &Contract;

    /// Returns the output contract for validation
    fn output_contract(&self) -> &Contract;

    /// Validates input against the input contract
    fn validate_input(&self, input: &Value) -> Result<(), Vec<ValidationError>> {
        self.input_contract().validate(input)
    }

    /// Executes the routine with the given context and input
    async fn execute(
        &self,
        ctx: &mut RoutineContext,
        input: Value,
    ) -> Result<Value, RoutineError>;
}

/// Unique identifier for a routine
#[derive(Debug, Clone, PartialEq, Eq, Hash)]
pub struct RoutineType {
    pub capability_class: String,
    pub name: String,
    pub version: String,
}

impl RoutineType {
    pub fn new(class: impl Into<String>, name: impl Into<String>, version: impl Into<String>) -> Self {
        Self {
            capability_class: class.into(),
            name: name.into(),
            version: version.into(),
        }
    }

    /// Creates a RoutineType from a RoutineRef
    pub fn from_ref(routine_ref: &RoutineRef) -> Self {
        Self {
            capability_class: routine_ref.capability_class.clone(),
            name: routine_ref.name.clone(),
            version: routine_ref.version.clone(),
        }
    }
}

impl std::fmt::Display for RoutineType {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "{}:{}@{}", self.capability_class, self.name, self.version)
    }
}

/// Dynamic registry for routines
pub struct RoutineRegistry {
    routines: RwLock<HashMap<RoutineType, Arc<dyn Routine>>>,
}

impl RoutineRegistry {
    pub fn new() -> Self {
        Self {
            routines: RwLock::new(HashMap::new()),
        }
    }

    /// Register a routine implementation
    pub fn register(&self, routine: Arc<dyn Routine>) {
        let routine_type = routine.routine_type();
        let mut routines = self.routines.write().unwrap();
        routines.insert(routine_type, routine);
    }

    /// Get a routine by its type
    pub fn get(&self, routine_type: &RoutineType) -> Option<Arc<dyn Routine>> {
        let routines = self.routines.read().unwrap();
        routines.get(routine_type).cloned()
    }

    /// Get a routine by RoutineRef
    pub fn get_by_ref(&self, routine_ref: &RoutineRef) -> Option<Arc<dyn Routine>> {
        let routine_type = RoutineType::from_ref(routine_ref);
        self.get(&routine_type)
    }

    /// List all available routine types
    pub fn list_available(&self) -> Vec<RoutineType> {
        let routines = self.routines.read().unwrap();
        routines.keys().cloned().collect()
    }

    /// Check if a routine exists
    pub fn contains(&self, routine_type: &RoutineType) -> bool {
        let routines = self.routines.read().unwrap();
        routines.contains_key(routine_type)
    }
}

impl Default for RoutineRegistry {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use once_cell::sync::Lazy;
    use serde_json::json;

    struct TestRoutine;

    #[async_trait::async_trait]
    impl Routine for TestRoutine {
        fn routine_type(&self) -> RoutineType {
            RoutineType::new("test", "noop", "1.0.0")
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
            Ok(json!({"status": "ok"}))
        }
    }

    #[test]
    fn test_registry_register_and_get() {
        let registry = RoutineRegistry::new();
        let routine = Arc::new(TestRoutine);
        
        registry.register(routine.clone());
        
        let routine_type = RoutineType::new("test", "noop", "1.0.0");
        let retrieved = registry.get(&routine_type);
        
        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().routine_type(), routine_type);
    }

    #[test]
    fn test_registry_get_by_ref() {
        let registry = RoutineRegistry::new();
        let routine = Arc::new(TestRoutine);
        
        registry.register(routine);
        
        let routine_ref = RoutineRef {
            capability_class: "test".to_string(),
            name: "noop".to_string(),
            version: "1.0.0".to_string(),
        };
        
        let retrieved = registry.get_by_ref(&routine_ref);
        assert!(retrieved.is_some());
    }

    #[test]
    fn test_registry_list_available() {
        let registry = RoutineRegistry::new();
        let routine = Arc::new(TestRoutine);
        
        registry.register(routine);
        
        let available = registry.list_available();
        assert_eq!(available.len(), 1);
        assert_eq!(available[0].name, "noop");
    }

    #[test]
    fn test_registry_contains() {
        let registry = RoutineRegistry::new();
        let routine = Arc::new(TestRoutine);
        
        registry.register(routine);
        
        let existing = RoutineType::new("test", "noop", "1.0.0");
        let missing = RoutineType::new("test", "missing", "1.0.0");
        
        assert!(registry.contains(&existing));
        assert!(!registry.contains(&missing));
    }

    #[test]
    fn test_routine_type_display() {
        let rt = RoutineType::new("builtin", "scan_markdown", "1.0.0");
        assert_eq!(rt.to_string(), "builtin:scan_markdown@1.0.0");
    }
}
