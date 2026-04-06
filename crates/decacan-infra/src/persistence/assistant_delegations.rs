use decacan_runtime::assistant::session::{AssistantDelegationBinding, AssistantDelegationStatus};
use decacan_runtime::persistence::assistant_delegations::AssistantDelegationBindingStore;
use std::collections::HashMap;
use std::convert::Infallible;
use std::sync::{Arc, RwLock};

#[derive(Debug, Clone, Default)]
pub struct InMemoryAssistantDelegationBindingStore {
    bindings: Arc<RwLock<HashMap<String, AssistantDelegationBinding>>>,
}

impl InMemoryAssistantDelegationBindingStore {
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait::async_trait]
impl AssistantDelegationBindingStore for InMemoryAssistantDelegationBindingStore {
    type Error = Infallible;

    async fn load_active_for_session(
        &self,
        assistant_session_id: &str,
    ) -> Result<Option<AssistantDelegationBinding>, Self::Error> {
        let bindings = self.bindings.read().unwrap_or_else(|e| e.into_inner());
        Ok(bindings.get(assistant_session_id).cloned())
    }

    async fn save(&self, binding: AssistantDelegationBinding) -> Result<(), Self::Error> {
        let mut bindings = self.bindings.write().unwrap_or_else(|e| e.into_inner());
        bindings.insert(binding.assistant_session_id.clone(), binding);
        Ok(())
    }

    async fn list_active(&self) -> Result<Vec<AssistantDelegationBinding>, Self::Error> {
        let bindings = self.bindings.read().unwrap_or_else(|e| e.into_inner());
        Ok(bindings
            .values()
            .filter(|b| b.status == AssistantDelegationStatus::Active)
            .cloned()
            .collect())
    }
}
