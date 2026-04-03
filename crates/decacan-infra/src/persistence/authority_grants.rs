use decacan_runtime::authority::grant::DelegatedAuthorityGrant;
use decacan_runtime::persistence::authority_grants::DelegatedAuthorityGrantStore;
use std::collections::HashMap;
use std::convert::Infallible;
use std::sync::{Arc, RwLock};

#[derive(Debug, Clone, Default)]
pub struct InMemoryDelegatedAuthorityGrantStore {
    grants: Arc<RwLock<HashMap<(String, String), DelegatedAuthorityGrant>>>,
}

impl InMemoryDelegatedAuthorityGrantStore {
    pub fn new() -> Self {
        Self::default()
    }
}

#[async_trait::async_trait]
impl DelegatedAuthorityGrantStore for InMemoryDelegatedAuthorityGrantStore {
    type Error = Infallible;

    async fn load_for_user(
        &self,
        workspace_id: &str,
        user_id: &str,
    ) -> Result<Option<DelegatedAuthorityGrant>, Self::Error> {
        let grants = self.grants.read().unwrap_or_else(|e| e.into_inner());
        Ok(grants
            .get(&(workspace_id.to_string(), user_id.to_string()))
            .cloned())
    }

    async fn save(&self, grant: DelegatedAuthorityGrant) -> Result<(), Self::Error> {
        let mut grants = self.grants.write().unwrap_or_else(|e| e.into_inner());
        grants.insert((grant.workspace_id.clone(), grant.user_id.clone()), grant);
        Ok(())
    }
}
