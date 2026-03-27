use decacan_runtime::ports::storage::StoragePort;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SqliteStorage {
    connection_string: String,
}

impl SqliteStorage {
    pub fn new(connection_string: impl Into<String>) -> Self {
        Self {
            connection_string: connection_string.into(),
        }
    }

    pub fn connection_string(&self) -> &str {
        &self.connection_string
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SqliteStorageError {
    NotConfigured,
}

impl std::fmt::Display for SqliteStorageError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::NotConfigured => f.write_str("SQLite storage is not configured"),
        }
    }
}

impl std::error::Error for SqliteStorageError {}

impl StoragePort for SqliteStorage {
    type Error = SqliteStorageError;

    fn put(&self, _key: &str, _value: &str) -> Result<(), Self::Error> {
        Err(SqliteStorageError::NotConfigured)
    }

    fn get(&self, _key: &str) -> Result<Option<String>, Self::Error> {
        Err(SqliteStorageError::NotConfigured)
    }
}
