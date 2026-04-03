use crate::team_session::snapshot::TeamSessionSnapshot;

#[async_trait::async_trait]
pub trait TeamSessionSnapshotStore: Send + Sync {
    type Error;

    async fn load(&self, session_id: &str) -> Result<Option<TeamSessionSnapshot>, Self::Error>;

    async fn save(&self, snapshot: TeamSessionSnapshot) -> Result<(), Self::Error>;
}
