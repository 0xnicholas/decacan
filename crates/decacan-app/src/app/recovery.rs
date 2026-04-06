use std::collections::HashMap;
use decacan_runtime::assistant::session::{AssistantSession, AssistantDelegationBinding};
use decacan_runtime::persistence::assistant_delegations::AssistantDelegationBindingStore;

pub struct RecoveryService<Store: AssistantDelegationBindingStore> {
    delegation_store: Store,
}

pub struct RecoveryReport {
    pub sessions_recovered: usize,
    pub errors: Vec<String>,
}

impl<Store: AssistantDelegationBindingStore> RecoveryService<Store> {
    pub fn new(delegation_store: Store) -> Self {
        Self { delegation_store }
    }

    pub async fn recover_sessions(
        &self,
        sessions: &mut HashMap<String, AssistantSession>,
    ) -> Result<RecoveryReport, Store::Error> {
        let active_delegations = self.delegation_store.list_active().await?;
        let mut errors = Vec::new();
        let mut sessions_recovered = 0;

        for binding in active_delegations {
            let assistant_session_id = binding.assistant_session_id.clone();
            
            let session = AssistantSession {
                assistant_session_id: assistant_session_id.clone(),
                active_delegation: Some(binding),
            };

            if sessions.contains_key(&assistant_session_id) {
                errors.push(format!("Duplicate assistant session ID: {}", assistant_session_id));
            } else {
                sessions.insert(assistant_session_id, session);
                sessions_recovered += 1;
            }
        }

        Ok(RecoveryReport {
            sessions_recovered,
            errors,
        })
    }
}
