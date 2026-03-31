//! Capability abstraction layer
//!
//! This module provides the Capability abstraction layer, which is the core of Phase 2.
//! Capabilities abstract over specific implementations (Routine, Tool, Skill),
//! allowing the system to choose the best implementation based on context.
//!
//! # Key Components
//!
//! - [`Capability`](entities::Capability): Represents something the system can do
//! - [`CapabilityRef`](entities::CapabilityRef): Reference to a capability
//! - [`ImplementationRef`](entities::ImplementationRef): Reference to a specific implementation
//! - [`CapabilityRegistry`](registry::CapabilityRegistry): Registry for managing capabilities
//! - [`CapabilityResolver`](resolver::CapabilityResolver): Trait for resolving capabilities to implementations
//!
//! # Architecture
//!
//! ```text
//! StepDefinition → CapabilityRef
//!                        ↓
//!              CapabilityResolver.resolve()
//!                        ↓//!              ResolutionResult
//!              ├── ImplementationRef (primary)
//!              └── Vec<ImplementationRef> (fallbacks)
//! ```

pub mod entities;
pub mod registry;
pub mod resolver;

// Phase 3: Runtime execution integration
pub mod execution;

pub use entities::{Capability, CapabilityRef, ImplementationRef};
pub use registry::CapabilityRegistry;
pub use resolver::{CapabilityResolver, ResolutionContext, ResolutionResult, ResolveError, SimpleResolver};

// Phase 3 exports
pub use execution::CapabilityAwareExecutor;
