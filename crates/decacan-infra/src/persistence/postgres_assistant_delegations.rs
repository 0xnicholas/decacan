use decacan_runtime::assistant::session::{AssistantDelegationBinding, AssistantDelegationStatus};
use decacan_runtime::persistence::assistant_delegations::AssistantDelegationBindingStore;
use sqlx::{PgPool, Row};

use crate::storage::postgres::PostgresStorageError;

pub struct PostgresAssistantDelegationBindingStore {
    pool: PgPool,
}

impl PostgresAssistantDelegationBindingStore {
    pub fn new(pool: PgPool) -> Self {
        Self { pool }
    }
}

#[async_trait::async_trait]
impl AssistantDelegationBindingStore for PostgresAssistantDelegationBindingStore {
    type Error = PostgresStorageError;

    async fn load_active_for_session(
        &self,
        assistant_session_id: &str,
    ) -> Result<Option<AssistantDelegationBinding>, Self::Error> {
        let row = sqlx::query(
            r#"
            SELECT assistant_session_id, team_session_id, task_id, run_id, status
            FROM assistant_delegations
            WHERE assistant_session_id = $1
            "#,
        )
        .bind(assistant_session_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(PostgresStorageError::from)?;

        Ok(row.map(|r| AssistantDelegationBinding {
            assistant_session_id: r.get("assistant_session_id"),
            team_session_id: r.get("team_session_id"),
            task_id: r.get("task_id"),
            run_id: r.get("run_id"),
            status: r.get::<String, _>("status")
                .parse()
                .unwrap_or(AssistantDelegationStatus::Active),
        }))
    }

    async fn save(&self, binding: AssistantDelegationBinding) -> Result<(), Self::Error> {
        let status_str = match binding.status {
            AssistantDelegationStatus::Active => "active",
            AssistantDelegationStatus::Completed => "completed",
            AssistantDelegationStatus::Cancelled => "cancelled",
        };

        sqlx::query(
            r#"
            INSERT INTO assistant_delegations (assistant_session_id, team_session_id, task_id, run_id, status)
            VALUES ($1, $2, $3, $4, $5)
            ON CONFLICT (assistant_session_id) DO UPDATE
            SET team_session_id = $2, task_id = $3, run_id = $4, status = $5
            "#,
        )
        .bind(&binding.assistant_session_id)
        .bind(&binding.team_session_id)
        .bind(&binding.task_id)
        .bind(&binding.run_id)
        .bind(status_str)
        .execute(&self.pool)
        .await
        .map_err(PostgresStorageError::from)?;

        Ok(())
    }

    async fn list_active(&self) -> Result<Vec<AssistantDelegationBinding>, Self::Error> {
        let rows = sqlx::query(
            r#"
            SELECT assistant_session_id, team_session_id, task_id, run_id, status
            FROM assistant_delegations
            WHERE status = 'active'
            ORDER BY created_at DESC
            "#,
        )
        .fetch_all(&self.pool)
        .await
        .map_err(PostgresStorageError::from)?;

        let bindings = rows
            .into_iter()
            .map(|r| AssistantDelegationBinding {
                assistant_session_id: r.get("assistant_session_id"),
                team_session_id: r.get("team_session_id"),
                task_id: r.get("task_id"),
                run_id: r.get("run_id"),
                status: r.get::<String, _>("status")
                    .parse()
                    .unwrap_or(AssistantDelegationStatus::Active),
            })
            .collect();

        Ok(bindings)
    }
}
