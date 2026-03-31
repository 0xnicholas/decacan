//! Contract validation system
//!
//! This module provides runtime validation of data against contracts.
//! Supports two validation modes:
//!
//! - **Strict**: All rules enforced, extra fields rejected
//! - **Lenient**: Allows extra fields, more permissive
//!
//! # Example
//!
//! ```rust,ignore
//! let validator = ContractValidator::strict();
//! validator.validate_input(&contract, &value)?;
//! ```

pub mod validator;

pub use validator::{ContractValidator, ValidationMode};
