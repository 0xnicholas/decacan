use crate::authority::grant::DelegatedAuthorityGrant;

#[async_trait::async_trait]
pub trait DelegatedAuthorityGrantStore: Send + Sync {
    type Error;

    async fn load_for_user(
        &self,
        workspace_id: &str,
        user_id: &str,
    ) -> Result<Option<DelegatedAuthorityGrant>, Self::Error>;

    async fn save(&self, grant: DelegatedAuthorityGrant) -> Result<(), Self::Error>;
}
