use decacan_runtime::team_session::snapshot::TeamSessionSnapshot;
use std::collections::HashMap;
use std::sync::{Arc, RwLock};

#[derive(Debug, Clone, Default)]
pub struct InMemoryTeamSessionStore {
    snapshots: Arc<RwLock<HashMap<String, TeamSessionSnapshot>>>,
}

impl InMemoryTeamSessionStore {
    pub fn new() -> Self {
        Self::default()
    }

    pub fn load(&self, session_id: &str) -> Option<TeamSessionSnapshot> {
        let snapshots = self.snapshots.read().unwrap_or_else(|e| e.into_inner());
        snapshots.get(session_id).cloned()
    }

    pub fn save(&self, snapshot: TeamSessionSnapshot) {
        let mut snapshots = self.snapshots.write().unwrap_or_else(|e| e.into_inner());
        snapshots.insert(snapshot.session_id.clone(), snapshot);
    }
}
