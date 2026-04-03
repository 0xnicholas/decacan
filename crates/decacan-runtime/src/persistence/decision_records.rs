use crate::assistant::decision::AssistantDecisionRecord;

#[async_trait::async_trait]
pub trait AssistantDecisionRecordStore: Send + Sync {
    type Error;

    async fn list_for_session(
        &self,
        assistant_session_id: &str,
    ) -> Result<Vec<AssistantDecisionRecord>, Self::Error>;

    async fn save(&self, record: AssistantDecisionRecord) -> Result<(), Self::Error>;
}
