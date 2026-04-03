use crate::assistant::session::AssistantSession;

#[async_trait::async_trait]
pub trait AssistantSessionStore: Send + Sync {
    type Error;

    async fn load(
        &self,
        assistant_session_id: &str,
    ) -> Result<Option<AssistantSession>, Self::Error>;

    async fn save(&self, session: AssistantSession) -> Result<(), Self::Error>;
}
