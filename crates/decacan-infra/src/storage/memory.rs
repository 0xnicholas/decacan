use std::collections::HashMap;
use std::convert::Infallible;
use std::sync::{Arc, RwLock};

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

impl StoragePort for MemoryStorage {
    type Error = Infallible;

    fn put(&self, key: &str, value: &str) -> Result<(), Self::Error> {
        let mut values = self
            .values
            .write()
            .expect("memory storage lock should not be poisoned");
        values.insert(key.to_string(), value.to_string());
        Ok(())
    }

    fn get(&self, key: &str) -> Result<Option<String>, Self::Error> {
        let values = self
            .values
            .read()
            .expect("memory storage lock should not be poisoned");
        Ok(values.get(key).cloned())
    }
}
