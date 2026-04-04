pub mod clock;
pub mod config;
pub mod filesystem;
pub mod logging;
pub mod models;
pub mod persistence;
pub mod secrets;
pub mod storage;
pub mod team;

// Team adapter re-exports for public API
pub use team::adapter::{AdapterMode, TeamAdapter, AdapterError};
pub use team::auth::{RequestSigner, SignedRequest, SignatureError};
pub use team::gateway_client::{GatewayClientError, TeamGatewayClient};
pub use team::retry::{RetryConfig, RetryError, RetryableClient};