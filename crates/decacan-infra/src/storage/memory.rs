use std::collections::HashMap;
use std::convert::Infallible;
use std::sync::{Arc, RwLock};

use async_trait::async_trait;
use decacan_runtime::ports::storage::StoragePort;

#[derive(Debug, Clone, Default)]
pub struct MemoryStorage {
    values: Arc<RwLock<HashMap<String, String>>>,
}

impl MemoryStorage {
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait]
impl StoragePort for MemoryStorage {
    type Error = Infallible;

    async fn put(&self, key: &str, value: &str) -> Result<(), Self::Error> {
        let mut values = self
            .values
            .write()
            .unwrap_or_else(|e| e.into_inner());
        values.insert(key.to_string(), value.to_string());
        Ok(())
    }

    async fn get(&self, key: &str) -> Result<Option<String>, Self::Error> {
        let values = self
            .values
            .read()
            .unwrap_or_else(|e| e.into_inner());
        Ok(values.get(key).cloned())
    }
}
