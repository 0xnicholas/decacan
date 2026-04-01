use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite};
use std::sync::Arc;

use crate::trace::entities::TaskExecutionTrace;

#[derive(Debug, thiserror::Error)]
pub enum TraceStoreError {
    #[error("database error: {0}")]
    Database(#[from] sqlx::Error),
    #[error("serialization error: {0}")]
    Serialization(String),
}

pub type Result<T> = std::result::Result<T, TraceStoreError>;

pub struct TraceStore {
    pool: Pool<Sqlite>,
}

impl TraceStore {
    pub async fn new_in_memory() -> Result<Self> {
        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect("sqlite::memory:")
            .await?;

        let store = Self { pool };
        store.run_migrations().await?;
        Ok(store)
    }

    pub async fn new_with_path<P: AsRef<std::path::Path>>(path: P) -> Result<Self> {
        let url = format!("sqlite:{}", path.as_ref().display());
        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect(&url)
            .await?;

        let store = Self { pool };
        store.run_migrations().await?;
        Ok(store)
    }

    async fn run_migrations(&self) -> Result<()> {
        let sql = include_str!("migrations/trace_001.sql");
        sqlx::query(sql).execute(&self.pool).await?;
        Ok(())
    }

    pub async fn save_trace(&self, trace: &TaskExecutionTrace) -> Result<()> {
        let trace_json = serde_json::to_string(trace)
            .map_err(|e| TraceStoreError::Serialization(e.to_string()))?;

        sqlx::query(
            r#"INSERT INTO task_traces 
             (task_id, playbook_version_id, workspace_id, status, 
              started_at, completed_at, total_duration_ms, step_count,
              failed_step_index, trace_data)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT(task_id) DO UPDATE SET
             status = excluded.status,
             completed_at = excluded.completed_at,
             total_duration_ms = excluded.total_duration_ms,
             trace_data = excluded.trace_data"#,
        )
        .bind(&trace.task_id)
        .bind(trace.playbook_version_id.to_string())
        .bind(&trace.workspace_id)
        .bind(format!("{:?}", trace.overall_status))
        .bind(trace.created_at.unix_timestamp())
        .bind(trace.completed_at.map(|dt| dt.unix_timestamp()))
        .bind(trace.total_duration_ms as i64)
        .bind(trace.step_count as i64)
        .bind(trace.failed_step_index.map(|i| i as i64))
        .bind(trace_json)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    pub async fn get_trace(&self, task_id: &str) -> Result<Option<TaskExecutionTrace>> {
        let row: Option<(String,)> =
            sqlx::query_as("SELECT trace_data FROM task_traces WHERE task_id = $1")
                .bind(task_id)
                .fetch_optional(&self.pool)
                .await?;

        match row {
            Some((json,)) => {
                let trace: TaskExecutionTrace = serde_json::from_str(&json)
                    .map_err(|e| TraceStoreError::Serialization(e.to_string()))?;
                Ok(Some(trace))
            }
            None => Ok(None),
        }
    }
}
