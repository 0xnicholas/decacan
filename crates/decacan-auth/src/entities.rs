use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

/// 用户实体（仅认证相关字段）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub email: String,
    pub name: String,
    pub avatar_url: Option<String>,
    pub status: UserStatus,
    pub auth_provider: AuthProvider,
    pub auth_provider_id: Option<String>,
    pub password_hash: Option<String>,
    pub email_verified_at: Option<OffsetDateTime>,
    pub created_at: OffsetDateTime,
    pub last_login_at: Option<OffsetDateTime>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum UserStatus {
    Active,
    Suspended,
    Deleted,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum AuthProvider {
    Email,
    Google,
    GitHub,
}

/// JWT 认证会话
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AuthSession {
    pub id: String,
    pub user_id: String,
    pub access_token: String,
    pub refresh_token: String,
    pub expires_at: OffsetDateTime,
    pub created_at: OffsetDateTime,
    pub last_used_at: Option<OffsetDateTime>,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
}

/// OAuth State（防止 CSRF）
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct OAuthState {
    pub state: String,
    pub provider: AuthProvider,
    pub redirect_url: String,
    pub created_at: OffsetDateTime,
}

/// Workspace 角色（供 runtime 使用）
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkspaceRole {
    Owner,
    Admin,
    Editor,
    Viewer,
}

impl WorkspaceRole {
    pub fn can_manage_members(&self) -> bool {
        matches!(self, Self::Owner | Self::Admin)
    }

    pub fn can_edit_playbooks(&self) -> bool {
        matches!(self, Self::Owner | Self::Admin | Self::Editor)
    }

    pub fn can_run_tasks(&self) -> bool {
        matches!(self, Self::Owner | Self::Admin | Self::Editor)
    }
}

impl User {
    pub fn new(id: impl Into<String>, email: impl Into<String>, name: impl Into<String>) -> Self {
        let now = OffsetDateTime::now_utc();
        Self {
            id: id.into(),
            email: email.into(),
            name: name.into(),
            avatar_url: None,
            status: UserStatus::Active,
            auth_provider: AuthProvider::Email,
            auth_provider_id: None,
            password_hash: None,
            email_verified_at: None,
            created_at: now,
            last_login_at: None,
        }
    }
}
