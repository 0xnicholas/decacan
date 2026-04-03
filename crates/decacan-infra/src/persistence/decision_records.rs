use decacan_runtime::assistant::decision::AssistantDecisionRecord;
use decacan_runtime::persistence::decision_records::AssistantDecisionRecordStore;
use std::collections::HashMap;
use std::convert::Infallible;
use std::sync::{Arc, RwLock};

#[derive(Debug, Clone, Default)]
pub struct InMemoryAssistantDecisionRecordStore {
    records: Arc<RwLock<HashMap<String, Vec<AssistantDecisionRecord>>>>,
}

impl InMemoryAssistantDecisionRecordStore {
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait::async_trait]
impl AssistantDecisionRecordStore for InMemoryAssistantDecisionRecordStore {
    type Error = Infallible;

    async fn list_for_session(
        &self,
        assistant_session_id: &str,
    ) -> Result<Vec<AssistantDecisionRecord>, Self::Error> {
        let records = self.records.read().unwrap_or_else(|e| e.into_inner());
        Ok(records
            .get(assistant_session_id)
            .cloned()
            .unwrap_or_default())
    }

    async fn save(&self, record: AssistantDecisionRecord) -> Result<(), Self::Error> {
        let mut records = self.records.write().unwrap_or_else(|e| e.into_inner());
        records
            .entry(record.assistant_session_id.clone())
            .or_default()
            .push(record);
        Ok(())
    }
}
