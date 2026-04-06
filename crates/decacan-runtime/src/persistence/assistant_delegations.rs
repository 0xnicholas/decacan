use crate::assistant::session::AssistantDelegationBinding;

#[async_trait::async_trait]
pub trait AssistantDelegationBindingStore: Send + Sync {
    type Error;

    async fn load_active_for_session(
        &self,
        assistant_session_id: &str,
    ) -> Result<Option<AssistantDelegationBinding>, Self::Error>;

    async fn save(&self, binding: AssistantDelegationBinding) -> Result<(), Self::Error>;

    async fn list_active(&self) -> Result<Vec<AssistantDelegationBinding>, Self::Error>;
}
