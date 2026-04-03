use decacan_runtime::assistant::session::AssistantSession;
use decacan_runtime::persistence::assistant_sessions::AssistantSessionStore;
use std::collections::HashMap;
use std::convert::Infallible;
use std::sync::{Arc, RwLock};

#[derive(Debug, Clone, Default)]
pub struct InMemoryAssistantSessionStore {
    sessions: Arc<RwLock<HashMap<String, AssistantSession>>>,
}

impl InMemoryAssistantSessionStore {
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait::async_trait]
impl AssistantSessionStore for InMemoryAssistantSessionStore {
    type Error = Infallible;

    async fn load(
        &self,
        assistant_session_id: &str,
    ) -> Result<Option<AssistantSession>, Self::Error> {
        let sessions = self.sessions.read().unwrap_or_else(|e| e.into_inner());
        Ok(sessions.get(assistant_session_id).cloned())
    }

    async fn save(&self, session: AssistantSession) -> Result<(), Self::Error> {
        let mut sessions = self.sessions.write().unwrap_or_else(|e| e.into_inner());
        sessions.insert(session.assistant_session_id.clone(), session);
        Ok(())
    }
}
