use super::{env::EnvSecretsSource, SecretsError, SecretsPort};
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

pub struct SecretsManager {
    sources: Vec<Box<dyn SecretsPort<Error = SecretsError>>>,
    cache: Arc<RwLock<HashMap<String, String>>>,
}

impl SecretsManager {
    pub fn new() -> Self {
        let mut sources: Vec<Box<dyn SecretsPort<Error = SecretsError>>> = Vec::new();
        sources.push(Box::new(EnvSecretsSource::new()));

        Self {
            sources,
            cache: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub fn with_prefix(prefix: impl Into<String>) -> Self {
        let mut sources: Vec<Box<dyn SecretsPort<Error = SecretsError>>> = Vec::new();
        sources.push(Box::new(EnvSecretsSource::with_prefix(prefix)));

        Self {
            sources,
            cache: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub fn add_source(&mut self, source: Box<dyn SecretsPort<Error = SecretsError>>) {
        self.sources.push(source);
    }

    async fn get_from_sources(&self, key: &str) -> Result<Option<String>, SecretsError> {
        // 1. 首先检查缓存
        {
            let cache = self.cache.read().await;
            if let Some(value) = cache.get(key) {
                return Ok(Some(value.clone()));
            }
        }

        // 2. 按顺序查询所有来源
        for source in &self.sources {
            if let Some(value) = source.get(key).await? {
                // 写入缓存
                let mut cache = self.cache.write().await;
                cache.insert(key.to_string(), value.clone());
                return Ok(Some(value));
            }
        }

        Ok(None)
    }
}

impl Default for SecretsManager {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl SecretsPort for SecretsManager {
    type Error = SecretsError;

    async fn get(&self, key: &str) -> Result<Option<String>, Self::Error> {
        self.get_from_sources(key).await
    }

    async fn get_required(&self, key: &str) -> Result<String, Self::Error> {
        match self.get_from_sources(key).await? {
            Some(value) => Ok(value),
            None => Err(SecretsError::NotFound(key.to_string())),
        }
    }
}
