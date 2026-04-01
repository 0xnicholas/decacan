use crate::config::PostgresConfig;
use async_trait::async_trait;
use decacan_runtime::ports::storage::StoragePort;
use sqlx::{Pool, Postgres, Row};
use std::error::Error;
use std::fmt;

pub struct PostgresStorage {
    pool: Pool<Postgres>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PostgresStorageError {
    ConnectionError(String),
    MigrationError(String),
    QueryError(String),
}

impl fmt::Display for PostgresStorageError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            PostgresStorageError::ConnectionError(msg) => {
                write!(f, "Database connection error: {}", msg)
            }
            PostgresStorageError::MigrationError(msg) => {
                write!(f, "Migration error: {}", msg)
            }
            PostgresStorageError::QueryError(msg) => {
                write!(f, "Query error: {}", msg)
            }
        }
    }
}

impl Error for PostgresStorageError {}

impl From<sqlx::Error> for PostgresStorageError {
    fn from(err: sqlx::Error) -> Self {
        PostgresStorageError::QueryError(err.to_string())
    }
}

impl PostgresStorage {
    pub async fn new(config: &PostgresConfig) -> Result<Self, PostgresStorageError> {
        // 创建连接池
        let pool = Pool::connect(&config.url)
            .await
            .map_err(|e| PostgresStorageError::ConnectionError(e.to_string()))?;

        let storage = Self { pool };

        // 开发模式：自动运行迁移
        if config.auto_migrate {
            storage.run_migrations().await?;
        }

        Ok(storage)
    }

    async fn run_migrations(&self) -> Result<(), PostgresStorageError> {
        // 手动运行迁移（不使用 sqlx migrate）
        let migration_sql = include_str!("../../migrations/001_init.sql");

        sqlx::query(migration_sql)
            .execute(&self.pool)
            .await
            .map_err(|e| PostgresStorageError::MigrationError(e.to_string()))?;

        Ok(())
    }

    /// 删除键（主要用于测试清理）
    pub async fn delete(&self, key: &str) -> Result<(), PostgresStorageError> {
        sqlx::query("DELETE FROM storage_kv WHERE key = $1")
            .bind(key)
            .execute(&self.pool)
            .await?;

        Ok(())
    }
}

#[async_trait]
impl StoragePort for PostgresStorage {
    type Error = PostgresStorageError;

    async fn put(&self, key: &str, value: &str) -> Result<(), Self::Error> {
        sqlx::query(
            r#"
            INSERT INTO storage_kv (key, value, updated_at)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (key)
            DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP
            "#,
        )
        .bind(key)
        .bind(value)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    async fn get(&self, key: &str) -> Result<Option<String>, Self::Error> {
        let row = sqlx::query("SELECT value FROM storage_kv WHERE key = $1")
            .bind(key)
            .fetch_optional(&self.pool)
            .await?;

        match row {
            Some(row) => {
                let value: String = row.try_get("value")?;
                Ok(Some(value))
            }
            None => Ok(None),
        }
    }
}
