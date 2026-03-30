//! Storage abstraction layer for workspace file operations
//!
//! This module provides a secure, sandboxed storage interface that prevents
//! path traversal attacks by validating all paths and restricting operations
//! to a defined root directory.

pub mod local;
pub mod provider;

pub use local::LocalStorageProvider;
pub use provider::{DirectoryEntry, StorageError, StorageProvider};
