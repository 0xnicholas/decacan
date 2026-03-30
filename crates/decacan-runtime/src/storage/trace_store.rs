use rusqlite::{params, Connection, OptionalExtension};
use serde_json;
use std::sync::Arc;
use tokio::sync::Mutex;

use crate::trace::entities::TaskExecutionTrace;

pub struct TraceStore {
    conn: Arc<Mutex<Connection>>,
}

impl TraceStore {
    pub async fn new_in_memory() -> Result<Self, rusqlite::Error> {
        let conn = Connection::open_in_memory()?;
        let store = Self {
            conn: Arc::new(Mutex::new(conn)),
        };
        store.run_migrations().await?;
        Ok(store)
    }

    pub async fn new_with_path<P: AsRef<std::path::Path>>(
        path: P,
    ) -> Result<Self, rusqlite::Error> {
        let conn = Connection::open(path)?;
        let store = Self {
            conn: Arc::new(Mutex::new(conn)),
        };
        store.run_migrations().await?;
        Ok(store)
    }

    async fn run_migrations(&self) -> Result<(), rusqlite::Error> {
        let sql = include_str!("migrations/trace_001.sql");
        let conn = self.conn.lock().await;
        conn.execute_batch(sql)?;
        Ok(())
    }

    pub async fn save_trace(&self, trace: &TaskExecutionTrace) -> Result<(), rusqlite::Error> {
        let conn = self.conn.lock().await;
        let trace_json = serde_json::to_string(trace).unwrap();

        conn.execute(
            "INSERT INTO task_traces 
             (task_id, playbook_version_id, workspace_id, status, 
              started_at, completed_at, total_duration_ms, step_count,
              failed_step_index, trace_data)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10)
             ON CONFLICT(task_id) DO UPDATE SET
             status = excluded.status,
             completed_at = excluded.completed_at,
             total_duration_ms = excluded.total_duration_ms,
             trace_data = excluded.trace_data",
            params![
                trace.task_id,
                trace.playbook_version_id.to_string(),
                trace.workspace_id,
                format!("{:?}", trace.overall_status),
                trace.created_at.unix_timestamp(),
                trace.completed_at.map(|dt| dt.unix_timestamp()),
                trace.total_duration_ms as i64,
                trace.step_count as i64,
                trace.failed_step_index.map(|i| i as i64),
                trace_json,
            ],
        )?;

        Ok(())
    }

    pub async fn get_trace(
        &self,
        task_id: &str,
    ) -> Result<Option<TaskExecutionTrace>, rusqlite::Error> {
        let conn = self.conn.lock().await;

        let trace_json: Option<String> = conn
            .query_row(
                "SELECT trace_data FROM task_traces WHERE task_id = ?1",
                params![task_id],
                |row| row.get(0),
            )
            .optional()?;

        match trace_json {
            Some(json) => {
                let trace: TaskExecutionTrace = serde_json::from_str(&json).map_err(|e| {
                    rusqlite::Error::InvalidParameterName(e.to_string())
                })?;
                Ok(Some(trace))
            }
            None => Ok(None),
        }
    }
}
