use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use uuid::Uuid;

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

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Workspace {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub owner_id: String,
    pub workspace_type: WorkspaceType,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkspaceType {
    Personal,
    Team,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkspaceMembership {
    pub id: String,
    pub workspace_id: String,
    pub user_id: String,
    pub role: WorkspaceRole,
    pub invited_by: Option<String>,
    pub joined_at: OffsetDateTime,
}

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

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct OAuthState {
    pub state: String,
    pub provider: AuthProvider,
    pub redirect_url: String,
    pub created_at: OffsetDateTime,
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

impl Workspace {
    pub fn new(
        id: impl Into<String>,
        name: impl Into<String>,
        slug: impl Into<String>,
        owner_id: impl Into<String>,
    ) -> Self {
        let now = OffsetDateTime::now_utc();
        Self {
            id: id.into(),
            name: name.into(),
            slug: slug.into(),
            description: None,
            owner_id: owner_id.into(),
            workspace_type: WorkspaceType::Personal,
            created_at: now,
            updated_at: now,
        }
    }
}

impl WorkspaceMembership {
    pub fn new(
        workspace_id: impl Into<String>,
        user_id: impl Into<String>,
        role: WorkspaceRole,
    ) -> Self {
        Self {
            id: Uuid::new_v4().to_string(),
            workspace_id: workspace_id.into(),
            user_id: user_id.into(),
            role,
            invited_by: None,
            joined_at: OffsetDateTime::now_utc(),
        }
    }
}
