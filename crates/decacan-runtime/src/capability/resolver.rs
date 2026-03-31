//! Capability Resolver
//!
//! This module defines the capability resolution trait and implementations.
//! Resolvers map CapabilityRefs to specific ImplementationRefs.

use super::entities::{CapabilityRef, ImplementationRef};
use super::registry::CapabilityRegistry;
use std::sync::Arc;
use thiserror::Error;

/// Result of capability resolution
#[derive(Debug, Clone)]
pub struct ResolutionResult {
    /// Primary implementation to use
    pub implementation: ImplementationRef,

    /// Fallback implementations (in order of preference)
    pub fallbacks: Vec<ImplementationRef>,
}

/// Errors during capability resolution
#[derive(Debug, Error)]
pub enum ResolveError {
    #[error("capability not found: {0}")]
    CapabilityNotFound(String),

    #[error("no suitable implementation for capability: {0}")]
    NoSuitableImplementation(String),

    #[error("resolution failed: {0}")]
    ResolutionFailed(String),
}

/// Trait for capability resolution
///
/// Implementations determine how CapabilityRefs are mapped to ImplementationRefs.
/// This is the core abstraction that enables:
/// - Multiple implementations per capability
/// - Context-based selection
/// - Pluggable resolution strategies
///
/// # Example
///
/// ```rust,ignore
/// let resolver = SimpleResolver::new(registry);
/// let result = resolver.resolve(
///     &CapabilityRef::new("filesystem.read"),
///     &ResolutionContext::default(),
/// )?;
///
/// match result.implementation {
///     ImplementationRef::Routine { name, .. } => println!("Using routine: {}", name),
///     ImplementationRef::Tool { name, .. } => println!("Using tool: {}", name),
///     _ => {}
/// }
/// ```
pub trait CapabilityResolver: Send + Sync {
    /// Resolve a capability to an implementation
    ///
    /// # Arguments
    ///
    /// * `capability` - Reference to the capability to resolve
    /// * `context` - Resolution context (hints, workflow input, etc.)
    ///
    /// # Returns
    ///
    /// `ResolutionResult` containing the primary implementation and fallbacks,
    /// or a `ResolveError` if resolution fails.
    fn resolve(
        &self,
        capability: &CapabilityRef,
        context: &ResolutionContext,
    ) -> Result<ResolutionResult, ResolveError>;
}

/// Context for capability resolution
///
/// Provides hints and context to help the resolver make intelligent decisions.
#[derive(Debug, Clone, Default)]
pub struct ResolutionContext {
    /// Global workflow input
    pub workflow_input: serde_json::Value,

    /// Execution hints (e.g., "prefer_local", "cost_optimized")
    pub hints: Vec<String>,
}

impl ResolutionContext {
    /// Create a new resolution context
    pub fn new() -> Self {
        Self::default()
    }

    /// Create a context with workflow input
    pub fn with_input(mut self, input: serde_json::Value) -> Self {
        self.workflow_input = input;
        self
    }

    /// Add a hint
    pub fn with_hint(mut self, hint: impl Into<String>) -> Self {
        self.hints.push(hint.into());
        self
    }

    /// Check if a hint is present
    pub fn has_hint(&self, hint: &str) -> bool {
        self.hints.iter().any(|h| h == hint)
    }
}

/// Simple resolver that looks up capabilities in a registry
///
/// This is the default resolver that simply returns the first available
/// implementation from the registry. It has O(1) lookup performance.
pub struct SimpleResolver {
    registry: Arc<CapabilityRegistry>,
}

impl SimpleResolver {
    /// Create a new simple resolver
    ///
    /// # Example
    ///
    /// ```rust,ignore
    /// let registry = Arc::new(CapabilityRegistry::new());
    /// let resolver = SimpleResolver::new(registry);
    /// ```
    pub fn new(registry: Arc<CapabilityRegistry>) -> Self {
        Self { registry }
    }
}

impl CapabilityResolver for SimpleResolver {
    fn resolve(
        &self,
        capability: &CapabilityRef,
        _context: &ResolutionContext,
    ) -> Result<ResolutionResult, ResolveError> {
        // Get capability from registry
        let cap = self
            .registry
            .get(capability)
            .ok_or_else(|| ResolveError::CapabilityNotFound(capability.id.clone()))?;

        // Check if there are any implementations
        if cap.implementations.is_empty() {
            return Err(ResolveError::NoSuitableImplementation(
                capability.id.clone(),
            ));
        }

        // Return first as primary, rest as fallbacks
        let primary = cap.implementations[0].clone();
        let fallbacks = cap.implementations.iter().skip(1).cloned().collect();

        Ok(ResolutionResult {
            implementation: primary,
            fallbacks,
        })
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::capability::entities::Capability;
    use crate::routine::contract::Contract;

    fn create_test_capability(id: &str, impls: Vec<ImplementationRef>) -> Capability {
        Capability {
            id: id.to_string(),
            name: "Test".to_string(),
            description: "Test".to_string(),
            input_contract: Contract::object().build(),
            output_contract: Contract::object().build(),
            implementations: impls,
        }
    }

    #[test]
    fn test_resolution_context() {
        let ctx = ResolutionContext::new()
            .with_input(serde_json::json!({"key": "value"}))
            .with_hint("prefer_local");

        assert!(ctx.has_hint("prefer_local"));
        assert!(!ctx.has_hint("missing"));
    }

    #[test]
    fn test_simple_resolver_success() {
        let registry = Arc::new(CapabilityRegistry::new());
        let resolver = SimpleResolver::new(registry.clone());

        // Create and register capability
        let cap = create_test_capability(
            "test.cap",
            vec![
                ImplementationRef::routine("builtin", "test", "1.0.0"),
                ImplementationRef::tool("api", "1.0.0"),
            ],
        );
        registry.register(Arc::new(cap));

        // Resolve
        let result = resolver.resolve(
            &CapabilityRef::new("test.cap"),
            &ResolutionContext::default(),
        );

        assert!(result.is_ok());
        let resolved = result.unwrap();

        match resolved.implementation {
            ImplementationRef::Routine { name, .. } => {
                assert_eq!(name, "test");
            }
            _ => panic!("Expected Routine"),
        }

        assert_eq!(resolved.fallbacks.len(), 1);
    }

    #[test]
    fn test_simple_resolver_capability_not_found() {
        let registry = Arc::new(CapabilityRegistry::new());
        let resolver = SimpleResolver::new(registry);

        let result = resolver.resolve(
            &CapabilityRef::new("missing"),
            &ResolutionContext::default(),
        );

        assert!(result.is_err());
        match result.unwrap_err() {
            ResolveError::CapabilityNotFound(id) => {
                assert_eq!(id, "missing");
            }
            _ => panic!("Expected CapabilityNotFound"),
        }
    }

    #[test]
    fn test_simple_resolver_no_implementations() {
        let registry = Arc::new(CapabilityRegistry::new());
        let resolver = SimpleResolver::new(registry.clone());

        let cap = create_test_capability("empty.cap", vec![]);
        registry.register(Arc::new(cap));

        let result = resolver.resolve(
            &CapabilityRef::new("empty.cap"),
            &ResolutionContext::default(),
        );

        assert!(result.is_err());
        match result.unwrap_err() {
            ResolveError::NoSuitableImplementation(id) => {
                assert_eq!(id, "empty.cap");
            }
            _ => panic!("Expected NoSuitableImplementation"),
        }
    }
}
