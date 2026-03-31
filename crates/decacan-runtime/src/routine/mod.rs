pub mod adapter;
pub mod contract;
pub mod context;
pub mod entity;
pub mod error;
pub mod executor;
pub mod registry;

// New trait-based routine system
pub mod builtin;
pub mod r#trait;

// Re-exports for convenience
pub use adapter::{RoutineAdapter, RoutineAdapterFactory};
pub use contract::{Contract, ContractBuilder, ValidationError};
pub use context::{RoutineContext, RoutineState};
pub use error::{RoutineError, RoutineResult};
pub use r#trait::{Routine, RoutineRegistry, RoutineType};
