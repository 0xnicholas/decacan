//! Capability Registry
//!
//! Thread-safe registry for managing capabilities.

use std::collections::HashMap;
use std::sync::{Arc, RwLock};

use super::entities::{Capability, CapabilityRef};

/// Thread-safe registry for managing capabilities
///
/// # Example
///
/// ```rust,ignore
/// let registry = CapabilityRegistry::new();
/// let cap = Arc::new(Capability::new("filesystem.read", ...));
/// registry.register(cap);
///
/// let cap_ref = CapabilityRef::new("filesystem.read");
/// let found = registry.get(&cap_ref);
/// ```
pub struct CapabilityRegistry {
    capabilities: RwLock<HashMap<String, Arc<Capability>>>,
}

impl CapabilityRegistry {
    /// Create a new empty registry
    pub fn new() -> Self {
        Self {
            capabilities: RwLock::new(HashMap::new()),
        }
    }

    /// Register a capability
    ///
    /// If a capability with the same ID already exists, it will be replaced.
    pub fn register(&self, capability: Arc<Capability>) {
        let mut caps = self.capabilities.write().unwrap();
        caps.insert(capability.id.clone(), capability);
    }

    /// Get a capability by reference
    ///
    /// Returns `None` if the capability is not found.
    pub fn get(&self, cap_ref: &CapabilityRef) -> Option<Arc<Capability>> {
        let caps = self.capabilities.read().unwrap();
        caps.get(&cap_ref.id).cloned()
    }

    /// Check if a capability exists
    pub fn contains(&self, cap_ref: &CapabilityRef) -> bool {
        let caps = self.capabilities.read().unwrap();
        caps.contains_key(&cap_ref.id)
    }

    /// List all registered capability IDs
    pub fn list_capabilities(&self) -> Vec<String> {
        let caps = self.capabilities.read().unwrap();
        caps.keys().cloned().collect()
    }

    /// Get the number of registered capabilities
    pub fn len(&self) -> usize {
        let caps = self.capabilities.read().unwrap();
        caps.len()
    }

    /// Check if the registry is empty
    pub fn is_empty(&self) -> bool {
        self.len() == 0
    }
}

impl Default for CapabilityRegistry {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::routine::contract::Contract;

    fn create_test_capability(id: &str) -> Capability {
        Capability::new(
            id,
            "Test",
            "Test capability",
            Contract::object().build(),
            Contract::object().build(),
        )
    }

    #[test]
    fn test_new_registry_is_empty() {
        let registry = CapabilityRegistry::new();
        assert!(registry.is_empty());
        assert_eq!(registry.len(), 0);
    }

    #[test]
    fn test_register_and_get() {
        let registry = CapabilityRegistry::new();
        let cap = Arc::new(create_test_capability("test.cap"));

        registry.register(cap.clone());

        let cap_ref = CapabilityRef::new("test.cap");
        let retrieved = registry.get(&cap_ref);

        assert!(retrieved.is_some());
        assert_eq!(retrieved.unwrap().id, "test.cap");
        assert_eq!(registry.len(), 1);
    }

    #[test]
    fn test_contains() {
        let registry = CapabilityRegistry::new();
        let cap = Arc::new(create_test_capability("test.cap"));

        registry.register(cap);

        assert!(registry.contains(&CapabilityRef::new("test.cap")));
        assert!(!registry.contains(&CapabilityRef::new("missing")));
    }

    #[test]
    fn test_list_capabilities() {
        let registry = CapabilityRegistry::new();

        registry.register(Arc::new(create_test_capability("cap1")));
        registry.register(Arc::new(create_test_capability("cap2")));

        let caps = registry.list_capabilities();
        assert_eq!(caps.len(), 2);
        assert!(caps.contains(&"cap1".to_string()));
        assert!(caps.contains(&"cap2".to_string()));
    }

    #[test]
    fn test_register_overwrites() {
        let registry = CapabilityRegistry::new();

        let cap1 = Arc::new(create_test_capability("test"));
        let cap2 = Arc::new(Capability::new(
            "test",
            "Updated",
            "Updated description",
            Contract::object().build(),
            Contract::object().build(),
        ));

        registry.register(cap1);
        registry.register(cap2.clone());

        let retrieved = registry.get(&CapabilityRef::new("test")).unwrap();
        assert_eq!(retrieved.name, "Updated");
    }
}
