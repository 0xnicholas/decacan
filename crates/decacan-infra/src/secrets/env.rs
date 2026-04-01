use super::{SecretsError, SecretsPort};
use async_trait::async_trait;
use std::env;
use std::path::Path;

pub struct EnvSecretsSource {
    prefix: Option<String>,
}

impl EnvSecretsSource {
    pub fn new() -> Self {
        Self { prefix: None }
    }

    pub fn with_prefix(prefix: impl Into<String>) -> Self {
        Self {
            prefix: Some(prefix.into()),
        }
    }

    pub fn load_dotenv() -> Result<(), SecretsError> {
        Self::load_dotenv_at(None)
    }

    pub fn load_dotenv_at(path: Option<&Path>) -> Result<(), SecretsError> {
        match path {
            Some(p) => dotenvy::from_path(p).map_err(|e| SecretsError::LoadError(e.to_string())),
            None => dotenvy::dotenv()
                .map(|_| ())
                .map_err(|e| SecretsError::LoadError(e.to_string())),
        }
    }

    fn full_key(&self, key: &str) -> String {
        match &self.prefix {
            Some(prefix) => format!("{}_{}", prefix, key),
            None => key.to_string(),
        }
    }
}

impl Default for EnvSecretsSource {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl SecretsPort for EnvSecretsSource {
    type Error = SecretsError;

    async fn get(&self, key: &str) -> Result<Option<String>, Self::Error> {
        let full_key = self.full_key(key);
        Ok(env::var(&full_key).ok())
    }

    async fn get_required(&self, key: &str) -> Result<String, Self::Error> {
        match self.get(key).await? {
            Some(value) => Ok(value),
            None => Err(SecretsError::NotFound(key.to_string())),
        }
    }
}

// 导出方便使用的函数
pub fn load_dotenv(path: Option<&Path>) -> Result<(), SecretsError> {
    EnvSecretsSource::load_dotenv_at(path)
}
