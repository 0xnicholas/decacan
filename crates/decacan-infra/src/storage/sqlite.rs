use async_trait::async_trait;
use decacan_runtime::ports::storage::StoragePort;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SqliteStoragePlaceholder {
    reason: String,
}

impl SqliteStoragePlaceholder {
    pub fn new(reason: impl Into<String>) -> Self {
        Self {
            reason: reason.into(),
        }
    }

    pub fn reason(&self) -> &str {
        &self.reason
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SqliteStoragePlaceholderError {
    Placeholder(String),
}

impl std::fmt::Display for SqliteStoragePlaceholderError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Placeholder(reason) => {
                write!(f, "SQLite adapter placeholder cannot be used yet: {reason}")
            }
        }
    }
}

impl std::error::Error for SqliteStoragePlaceholderError {}

#[async_trait]
impl StoragePort for SqliteStoragePlaceholder {
    type Error = SqliteStoragePlaceholderError;

    async fn put(&self, _key: &str, _value: &str) -> Result<(), Self::Error> {
        Err(SqliteStoragePlaceholderError::Placeholder(
            self.reason.clone(),
        ))
    }

    async fn get(&self, _key: &str) -> Result<Option<String>, Self::Error> {
        Err(SqliteStoragePlaceholderError::Placeholder(
            self.reason.clone(),
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::SqliteStoragePlaceholder;
    use super::SqliteStoragePlaceholderError;
    use decacan_runtime::ports::storage::StoragePort;

    #[tokio::test]
    async fn placeholder_storage_returns_explicit_placeholder_error() {
        let storage = SqliteStoragePlaceholder::new("placeholder only");

        assert_eq!(
            storage.put("key", "value").await,
            Err(SqliteStoragePlaceholderError::Placeholder(
                "placeholder only".to_string()
            ))
        );
    }
}
