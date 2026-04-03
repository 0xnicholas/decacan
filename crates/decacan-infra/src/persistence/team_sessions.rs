use decacan_runtime::persistence::team_sessions::TeamSessionSnapshotStore;
use decacan_runtime::team_session::snapshot::TeamSessionSnapshot;
use std::collections::HashMap;
use std::convert::Infallible;
use std::sync::{Arc, RwLock};

#[derive(Debug, Clone, Default)]
pub struct InMemoryTeamSessionSnapshotStore {
    snapshots: Arc<RwLock<HashMap<String, TeamSessionSnapshot>>>,
}

impl InMemoryTeamSessionSnapshotStore {
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait::async_trait]
impl TeamSessionSnapshotStore for InMemoryTeamSessionSnapshotStore {
    type Error = Infallible;

    async fn load(&self, session_id: &str) -> Result<Option<TeamSessionSnapshot>, Self::Error> {
        let snapshots = self.snapshots.read().unwrap_or_else(|e| e.into_inner());
        Ok(snapshots.get(session_id).cloned())
    }

    async fn save(&self, snapshot: TeamSessionSnapshot) -> Result<(), Self::Error> {
        let mut snapshots = self.snapshots.write().unwrap_or_else(|e| e.into_inner());
        snapshots.insert(snapshot.session_id.clone(), snapshot);
        Ok(())
    }
}
