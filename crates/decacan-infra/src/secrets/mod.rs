pub mod env;
pub mod manager;
pub mod vault;

use async_trait::async_trait;
use std::fmt;

pub use env::EnvSecretsSource;
pub use manager::SecretsManager;
pub use vault::VaultSecretsSource;

#[async_trait]
pub trait SecretsPort: Send + Sync {
    type Error: std::error::Error + Send + Sync;

    async fn get(&self, key: &str) -> Result<Option<String>, Self::Error>;

    async fn get_required(&self, key: &str) -> Result<String, Self::Error>;
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SecretsError {
    NotFound(String),
    LoadError(String),
    VaultError(String),
}

impl fmt::Display for SecretsError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SecretsError::NotFound(key) => write!(f, "Secret not found: {}", key),
            SecretsError::LoadError(msg) => write!(f, "Failed to load secrets: {}", msg),
            SecretsError::VaultError(msg) => write!(f, "Vault error: {}", msg),
        }
    }
}

impl std::error::Error for SecretsError {}
