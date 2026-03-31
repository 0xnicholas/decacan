pub mod sqlite;
pub use sqlite::SqliteUserStorage;

use async_trait::async_trait;
use crate::entities::*;
use crate::error::AuthResult;

#[async_trait]
pub trait UserStorage: Send + Sync {
    async fn create_user(&self, user: &User) -> AuthResult<()>;
    async fn find_user_by_id(&self, id: &str) -> AuthResult<Option<User>>;
    async fn find_user_by_email(&self, email: &str) -> AuthResult<Option<User>>;
    async fn update_last_login(&self, id: &str) -> AuthResult<()>;
    
    async fn create_session(&self, session: &AuthSession) -> AuthResult<()>;
    async fn find_session_by_refresh_token(
        &self, token: &str
    ) -> AuthResult<Option<AuthSession>>;
    async fn revoke_session(&self, id: &str) -> AuthResult<()>;
    async fn revoke_all_user_sessions(&self, user_id: &str) -> AuthResult<()>;
    async fn cleanup_expired_sessions(&self) -> AuthResult<u64>;
    
    async fn create_oauth_state(&self, state: &OAuthState) -> AuthResult<()>;
    async fn find_oauth_state(&self, state: &str) -> AuthResult<Option<OAuthState>>;
    async fn delete_oauth_state(&self, state: &str) -> AuthResult<()>;
}
