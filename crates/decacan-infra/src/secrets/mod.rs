use async_trait::async_trait;
use std::fmt;

#[async_trait]
pub trait SecretsPort: Send + Sync {
    type Error: std::error::Error + Send + Sync;

    async fn get(&self, key: &str) -> Result<Option<String>, Self::Error>;

    async fn get_required(&self, key: &str) -> Result<String, Self::Error> {
        match self.get(key).await? {
            Some(value) => Ok(value),
            None => Err(Self::Error::from(SecretsError::NotFound(key.to_string()))),
        }
    }
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

impl From<SecretsError> for SecretsError {
    fn from(err: SecretsError) -> Self {
        err
    }
}
