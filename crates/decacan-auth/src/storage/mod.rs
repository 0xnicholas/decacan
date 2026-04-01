pub mod sqlite;
pub use sqlite::SqliteUserStorage;

use crate::entities::*;
use crate::error::AuthResult;
use async_trait::async_trait;
use decacan_runtime::workspace::entity::WorkspaceMembership;
use decacan_runtime::workspace::rbac::WorkspaceRole;

#[async_trait]
pub trait UserStorage: Send + Sync {
    async fn create_user(&self, user: &User) -> AuthResult<()>;
    async fn find_user_by_id(&self, id: &str) -> AuthResult<Option<User>>;
    async fn find_user_by_email(&self, email: &str) -> AuthResult<Option<User>>;
    async fn update_last_login(&self, id: &str) -> AuthResult<()>;

    async fn create_session(&self, session: &AuthSession) -> AuthResult<()>;
    async fn find_session_by_refresh_token(&self, token: &str) -> AuthResult<Option<AuthSession>>;
    async fn revoke_session(&self, id: &str) -> AuthResult<()>;
    async fn revoke_all_user_sessions(&self, user_id: &str) -> AuthResult<()>;
    async fn cleanup_expired_sessions(&self) -> AuthResult<u64>;

    async fn create_oauth_state(&self, state: &OAuthState) -> AuthResult<()>;
    async fn find_oauth_state(&self, state: &str) -> AuthResult<Option<OAuthState>>;
    async fn delete_oauth_state(&self, state: &str) -> AuthResult<()>;

    /// Create membership relationship
    async fn create_membership(&self, membership: &WorkspaceMembership) -> AuthResult<()>;

    /// Find membership by workspace_id and user_id
    async fn find_membership(
        &self,
        workspace_id: &str,
        user_id: &str,
    ) -> AuthResult<Option<WorkspaceMembership>>;

    /// List all members of a workspace (including user info)
    async fn list_workspace_members(
        &self,
        workspace_id: &str,
    ) -> AuthResult<Vec<(WorkspaceMembership, User)>>;

    /// Update member role
    async fn update_membership_role(
        &self,
        membership_id: &str,
        role: WorkspaceRole,
    ) -> AuthResult<()>;

    /// Delete membership
    async fn delete_membership(&self, membership_id: &str) -> AuthResult<()>;
}
