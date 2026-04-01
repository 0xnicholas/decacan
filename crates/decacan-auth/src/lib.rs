pub mod entities;
pub mod error;
pub mod rate_limit;
pub mod storage;
pub mod service;
pub mod authz;

// Re-export WorkspaceRole from runtime (unified type definition)
pub use decacan_runtime::workspace::rbac::WorkspaceRole;

// Local entity exports (WorkspaceRole not included)
pub use entities::{AuthProvider, AuthSession, OAuthState, User, UserStatus};
pub use error::{AuthError, AuthResult};
pub use rate_limit::RateLimiter;
pub use authz::Authorization;
pub use service::{AuthService, AuthTokens};
pub use storage::SqliteUserStorage;
