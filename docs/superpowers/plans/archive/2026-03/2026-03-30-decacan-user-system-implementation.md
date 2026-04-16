# Decacan 用户系统实施计划

> **历史备注（2026-04-16）**：本文档为归档计划。项目已全面迁移至 TypeScript/Node.js，后端核心位于 `packages/orchestrator`。文中的 Rust/crates 实现细节反映的是迁移前的技术选型。


> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现完整的用户认证、Workspace 管理和权限系统

**架构：** 使用 trait-based 存储抽象层支持 SQLite/PostgreSQL，JWT 认证，细粒度 Workspace 权限

**技术栈：** Rust, Axum, SQLx, Argon2, jsonwebtoken

---

## 项目结构

```
crates/
├── decacan-auth/          # 新建: 用户系统核心 crate
│   ├── src/
│   │   ├── lib.rs
│   │   ├── entities.rs    # User, Workspace, Membership, AuthSession
│   │   ├── storage/
│   │   │   ├── mod.rs     # UserStorage trait
│   │   │   ├── sqlite.rs  # SQLite 实现
│   │   │   └── postgres.rs # PostgreSQL 实现
│   │   ├── service/
│   │   │   ├── mod.rs
│   │   │   ├── auth.rs    # 注册/登录/Token 管理
│   │   │   └── workspace.rs # Workspace CRUD
│   │   └── error.rs       # AuthError 定义
│   └── migrations/
│       ├── 001_initial.sql
│       └── README.md
└── decacan-app/
    └── src/
        └── api/
            └── auth.rs    # HTTP API 端点
```

---

## Phase 1: 基础设施 (Week 1)

### Task 1: 创建 decacan-auth crate 结构

**Files:**
- Create: `crates/decacan-auth/Cargo.toml`
- Create: `crates/decacan-auth/src/lib.rs`
- Create: `crates/decacan-auth/src/entities.rs`
- Create: `crates/decacan-auth/src/error.rs`

- [ ] **Step 1: 创建 Cargo.toml**

```toml
[package]
name = "decacan-auth"
version = "0.1.0"
edition = "2021"

[dependencies]
tokio = { version = "1", features = ["macros", "rt-multi-thread", "sync", "time"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
time = { version = "0.3", features = ["serde", "formatting", "parsing"] }
uuid = { version = "1", features = ["serde", "v4"] }
async-trait = "0.1"
thiserror = "1"
argon2 = "0.5"
jsonwebtoken = "9"
rand = "0.8"
validator = { version = "0.18", features = ["derive"] }

# Storage
sqlx = { version = "0.7", features = ["runtime-tokio", "sqlite", "postgres", "time", "uuid"], optional = true }

[features]
default = ["sqlite"]
sqlite = ["sqlx"]
postgres = ["sqlx"]

[dev-dependencies]
tokio-test = "0.4"
```

- [ ] **Step 2: 定义错误类型**

Create `crates/decacan-auth/src/error.rs`:

```rust
use thiserror::Error;

#[derive(Debug, Error)]
pub enum AuthError {
    #[error("invalid credentials")]
    InvalidCredentials,
    #[error("email already exists")]
    EmailAlreadyExists,
    #[error("workspace slug already exists")]
    WorkspaceSlugExists,
    #[error("user not found")]
    UserNotFound,
    #[error("workspace not found")]
    WorkspaceNotFound,
    #[error("insufficient permissions")]
    InsufficientPermissions,
    #[error("user already in workspace")]
    UserAlreadyInWorkspace,
    #[error("cannot remove owner")]
    CannotRemoveOwner,
    #[error("invalid token")]
    InvalidToken,
    #[error("token expired")]
    TokenExpired,
    #[error("validation error: {0}")]
    Validation(String),
    #[error("storage error: {0}")]
    Storage(String),
}

pub type AuthResult<T> = Result<T, AuthError>;
```

- [ ] **Step 3: 定义实体**

Create `crates/decacan-auth/src/entities.rs`:

```rust
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
```

- [ ] **Step 4: 创建 lib.rs**

Create `crates/decacan-auth/src/lib.rs`:

```rust
pub mod entities;
pub mod error;
pub mod storage;

pub use entities::*;
pub use error::{AuthError, AuthResult};
```

- [ ] **Step 5: 编译检查**

Run: `cargo check -p decacan-auth`
Expected: SUCCESS (no errors)

- [ ] **Step 6: 提交**

```bash
git add crates/decacan-auth/
git commit -m "feat(auth): create decacan-auth crate with entities"
```

---

### Task 2: 创建存储抽象层和 SQLite 实现

**Files:**
- Create: `crates/decacan-auth/src/storage/mod.rs`
- Create: `crates/decacan-auth/src/storage/sqlite.rs`
- Create: `crates/decacan-auth/migrations/001_initial.sql`

- [ ] **Step 1: 定义存储 trait**

Create `crates/decacan-auth/src/storage/mod.rs`:

```rust
use async_trait::async_trait;
use time::OffsetDateTime;

use crate::entities::*;
use crate::error::AuthResult;

#[async_trait]
pub trait UserStorage: Send + Sync {
    // User 管理
    async fn create_user(&self, user: &User) -> AuthResult<()>;
    async fn find_user_by_id(&self, id: &str) -> AuthResult<Option<User>>;
    async fn find_user_by_email(&self, email: &str) -> AuthResult<Option<User>>;
    async fn find_user_by_oauth(
        &self,
        provider: AuthProvider,
        provider_id: &str,
    ) -> AuthResult<Option<User>>;
    async fn update_user(&self, user: &User) -> AuthResult<()>;
    async fn update_last_login(&self, id: &str) -> AuthResult<()>;
    
    // Workspace 管理
    async fn create_workspace(&self, workspace: &Workspace) -> AuthResult<()>;
    async fn find_workspace_by_id(&self, id: &str) -> AuthResult<Option<Workspace>>;
    async fn find_workspace_by_slug(&self, slug: &str) -> AuthResult<Option<Workspace>>;
    async fn list_user_workspaces(&self, user_id: &str) -> AuthResult<Vec<Workspace>>;
    async fn update_workspace(&self, workspace: &Workspace) -> AuthResult<()>;
    async fn delete_workspace(&self, id: &str) -> AuthResult<()>;
    
    // Membership 管理
    async fn create_membership(&self, membership: &WorkspaceMembership) -> AuthResult<()>;
    async fn find_membership(
        &self,
        workspace_id: &str,
        user_id: &str,
    ) -> AuthResult<Option<WorkspaceMembership>>;
    async fn list_workspace_members(
        &self,
        workspace_id: &str,
    ) -> AuthResult<Vec<(User, WorkspaceMembership)>>;
    async fn update_membership_role(
        &self,
        id: &str,
        role: WorkspaceRole,
    ) -> AuthResult<()>;
    async fn delete_membership(&self, id: &str) -> AuthResult<()>;
    
    // Session 管理
    async fn create_session(&self, session: &AuthSession) -> AuthResult<()>;
    async fn find_session_by_refresh_token(
        &self,
        token: &str,
    ) -> AuthResult<Option<AuthSession>>;
    async fn revoke_session(&self, id: &str) -> AuthResult<()>;
    async fn revoke_all_user_sessions(
        &self,
        user_id: &str,
    ) -> AuthResult<()>;
    
    // OAuth State 管理
    async fn create_oauth_state(&self,
        state: &OAuthState) -> AuthResult<()>;
    async fn find_oauth_state(
        &self,
        state: &str) -> AuthResult<Option<OAuthState>>;
    async fn delete_oauth_state(&self,
        state: &str) -> AuthResult<()>;
}

#[cfg(feature = "sqlite")]
pub mod sqlite;

#[cfg(feature = "sqlite")]
pub use sqlite::SqliteUserStorage;
```

- [ ] **Step 2: 创建数据库迁移脚本**

Create `crates/decacan-auth/migrations/001_initial.sql`:

```sql
-- 用户表
CREATE TABLE users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    avatar_url TEXT,
    status TEXT NOT NULL DEFAULT 'active',
    auth_provider TEXT NOT NULL,
    auth_provider_id TEXT,
    password_hash TEXT,
    email_verified_at TIMESTAMP,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP,
    
    UNIQUE(email),
    UNIQUE(auth_provider, auth_provider_id)
);

-- Workspace 表
CREATE TABLE workspaces (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    description TEXT,
    owner_id TEXT NOT NULL REFERENCES users(id),
    workspace_type TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 成员关系表
CREATE TABLE workspace_memberships (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    invited_by TEXT REFERENCES users(id),
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(workspace_id, user_id)
);

-- 认证会话表
CREATE TABLE auth_sessions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    access_token TEXT UNIQUE NOT NULL,
    refresh_token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    last_used_at TIMESTAMP,
    ip_address TEXT,
    user_agent TEXT
);

-- OAuth State 表
CREATE TABLE oauth_states (
    state TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    redirect_url TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL
);

-- 索引
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_oauth ON users(auth_provider, auth_provider_id);
CREATE INDEX idx_workspaces_owner ON workspaces(owner_id);
CREATE INDEX idx_workspaces_slug ON workspaces(slug);
CREATE INDEX idx_memberships_workspace ON workspace_memberships(workspace_id);
CREATE INDEX idx_memberships_user ON workspace_memberships(user_id);
CREATE INDEX idx_sessions_user ON auth_sessions(user_id);
CREATE INDEX idx_sessions_refresh ON auth_sessions(refresh_token);
CREATE INDEX idx_oauth_states_expires ON oauth_states(expires_at);
```

- [ ] **Step 3: 实现 SQLite 存储**

Create `crates/decacan-auth/src/storage/sqlite.rs`:

```rust
use async_trait::async_trait;
use sqlx::{sqlite::SqlitePool, Row};
use time::OffsetDateTime;

use crate::entities::*;
use crate::error::{AuthError, AuthResult};

use super::UserStorage;

pub struct SqliteUserStorage {
    pool: SqlitePool,
}

impl SqliteUserStorage {
    pub async fn new(database_url: &str) -> AuthResult<Self> {
        let pool = SqlitePool::connect(database_url)
            .await
            .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Self::migrate(&pool).await?;
        
        Ok(Self { pool })
    }
    
    async fn migrate(pool: &SqlitePool) -> AuthResult<()> {
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                name TEXT NOT NULL,
                avatar_url TEXT,
                status TEXT NOT NULL DEFAULT 'active',
                auth_provider TEXT NOT NULL,
                auth_provider_id TEXT,
                password_hash TEXT,
                email_verified_at TIMESTAMP,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                last_login_at TIMESTAMP
            )
            "#
        )
        .execute(pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        // 创建其他表...
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS workspaces (
                id TEXT PRIMARY KEY,
                name TEXT NOT NULL,
                slug TEXT UNIQUE NOT NULL,
                description TEXT,
                owner_id TEXT NOT NULL REFERENCES users(id),
                workspace_type TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
            )
            "#
        )
        .execute(pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS workspace_memberships (
                id TEXT PRIMARY KEY,
                workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                role TEXT NOT NULL,
                invited_by TEXT REFERENCES users(id),
                joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(workspace_id, user_id)
            )
            "#
        )
        .execute(pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS auth_sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                access_token TEXT UNIQUE NOT NULL,
                refresh_token TEXT UNIQUE NOT NULL,
                expires_at TIMESTAMP NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                last_used_at TIMESTAMP,
                ip_address TEXT,
                user_agent TEXT
            )
            "#
        )
        .execute(pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(())
    }
}

#[async_trait]
impl UserStorage for SqliteUserStorage {
    async fn create_user(&self, user: &User) -> AuthResult<()> {
        sqlx::query(
            r#"
            INSERT INTO users (id, email, name, avatar_url, status, auth_provider,
                               auth_provider_id, password_hash, email_verified_at,
                               created_at, last_login_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9, ?10, ?11)
            "#
        )
        .bind(&user.id)
        .bind(&user.email)
        .bind(&user.name)
        .bind(&user.avatar_url)
        .bind(format!("{:?}", user.status).to_lowercase())
        .bind(format!("{:?}", user.auth_provider).to_lowercase())
        .bind(&user.auth_provider_id)
        .bind(&user.password_hash)
        .bind(user.email_verified_at)
        .bind(user.created_at)
        .bind(user.last_login_at)
        .execute(&self.pool)
        .await
        .map_err(|e| {
            if e.to_string().contains("UNIQUE constraint failed") {
                AuthError::EmailAlreadyExists
            } else {
                AuthError::Storage(e.to_string())
            }
        })?;
        
        Ok(())
    }
    
    async fn find_user_by_id(&self, id: &str) -> AuthResult<Option<User>> {
        let row = sqlx::query(
            r#"
            SELECT id, email, name, avatar_url, status, auth_provider,
                   auth_provider_id, password_hash, email_verified_at,
                   created_at, last_login_at
            FROM users
            WHERE id = ?1
            "#
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(row.map(|r| self.row_to_user(r)))
    }
    
    async fn find_user_by_email(&self, email: &str) -> AuthResult<Option<User>> {
        let row = sqlx::query(
            r#"
            SELECT id, email, name, avatar_url, status, auth_provider,
                   auth_provider_id, password_hash, email_verified_at,
                   created_at, last_login_at
            FROM users
            WHERE email = ?1
            "#
        )
        .bind(email)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(row.map(|r| self.row_to_user(r)))
    }
    
    async fn find_user_by_oauth(
        &self,
        provider: AuthProvider,
        provider_id: &str,
    ) -> AuthResult<Option<User>> {
        let row = sqlx::query(
            r#"
            SELECT id, email, name, avatar_url, status, auth_provider,
                   auth_provider_id, password_hash, email_verified_at,
                   created_at, last_login_at
            FROM users
            WHERE auth_provider = ?1 AND auth_provider_id = ?2
            "#
        )
        .bind(format!("{:?}", provider).to_lowercase())
        .bind(provider_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(row.map(|r| self.row_to_user(r)))
    }
    
    async fn update_user(&self, user: &User) -> AuthResult<()> {
        sqlx::query(
            r#"
            UPDATE users
            SET email = ?2, name = ?3, avatar_url = ?4, status = ?5,
                auth_provider = ?6, auth_provider_id = ?7, password_hash = ?8,
                email_verified_at = ?9, last_login_at = ?10
            WHERE id = ?1
            "#
        )
        .bind(&user.id)
        .bind(&user.email)
        .bind(&user.name)
        .bind(&user.avatar_url)
        .bind(format!("{:?}", user.status).to_lowercase())
        .bind(format!("{:?}", user.auth_provider).to_lowercase())
        .bind(&user.auth_provider_id)
        .bind(&user.password_hash)
        .bind(user.email_verified_at)
        .bind(user.last_login_at)
        .execute(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(())
    }
    
    async fn update_last_login(&self, id: &str) -> AuthResult<()> {
        sqlx::query(
            "UPDATE users SET last_login_at = ?2 WHERE id = ?1"
        )
        .bind(id)
        .bind(OffsetDateTime::now_utc())
        .execute(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(())
    }
    
    // Workspace 方法（简化实现）
    async fn create_workspace(&self, workspace: &Workspace) -> AuthResult<()> {
        sqlx::query(
            r#"
            INSERT INTO workspaces (id, name, slug, description, owner_id,
                                    workspace_type, created_at, updated_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
            "#
        )
        .bind(&workspace.id)
        .bind(&workspace.name)
        .bind(&workspace.slug)
        .bind(&workspace.description)
        .bind(&workspace.owner_id)
        .bind(format!("{:?}", workspace.workspace_type).to_lowercase())
        .bind(workspace.created_at)
        .bind(workspace.updated_at)
        .execute(&self.pool)
        .await
        .map_err(|e| {
            if e.to_string().contains("UNIQUE constraint failed: workspaces.slug") {
                AuthError::WorkspaceSlugExists
            } else {
                AuthError::Storage(e.to_string())
            }
        })?;
        
        Ok(())
    }
    
    async fn find_workspace_by_id(&self, id: &str) -> AuthResult<Option<Workspace>> {
        let row = sqlx::query(
            r#"
            SELECT id, name, slug, description, owner_id, workspace_type,
                   created_at, updated_at
            FROM workspaces
            WHERE id = ?1
            "#
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(row.map(|r| self.row_to_workspace(r)))
    }
    
    async fn find_workspace_by_slug(&self, slug: &str) -> AuthResult<Option<Workspace>> {
        let row = sqlx::query(
            r#"
            SELECT id, name, slug, description, owner_id, workspace_type,
                   created_at, updated_at
            FROM workspaces
            WHERE slug = ?1
            "#
        )
        .bind(slug)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(row.map(|r| self.row_to_workspace(r)))
    }
    
    async fn list_user_workspaces(
        &self,
        user_id: &str,
    ) -> AuthResult<Vec<Workspace>> {
        let rows = sqlx::query(
            r#"
            SELECT w.id, w.name, w.slug, w.description, w.owner_id,
                   w.workspace_type, w.created_at, w.updated_at
            FROM workspaces w
            JOIN workspace_memberships m ON w.id = m.workspace_id
            WHERE m.user_id = ?1
            ORDER BY w.created_at DESC
            "#
        )
        .bind(user_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(rows.into_iter().map(|r| self.row_to_workspace(r)).collect())
    }
    
    async fn update_workspace(&self, workspace: &Workspace) -> AuthResult<()> {
        sqlx::query(
            r#"
            UPDATE workspaces
            SET name = ?2, description = ?3, updated_at = ?4
            WHERE id = ?1
            "#
        )
        .bind(&workspace.id)
        .bind(&workspace.name)
        .bind(&workspace.description)
        .bind(OffsetDateTime::now_utc())
        .execute(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(())
    }
    
    async fn delete_workspace(&self, id: &str) -> AuthResult<()> {
        sqlx::query("DELETE FROM workspaces WHERE id = ?1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(())
    }
    
    // Membership 方法（简化实现）
    async fn create_membership(
        &self,
        membership: &WorkspaceMembership,
    ) -> AuthResult<()> {
        sqlx::query(
            r#"
            INSERT INTO workspace_memberships
                (id, workspace_id, user_id, role, invited_by, joined_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6)
            "#
        )
        .bind(&membership.id)
        .bind(&membership.workspace_id)
        .bind(&membership.user_id)
        .bind(format!("{:?}", membership.role).to_lowercase())
        .bind(&membership.invited_by)
        .bind(membership.joined_at)
        .execute(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(())
    }
    
    async fn find_membership(
        &self,
        workspace_id: &str,
        user_id: &str,
    ) -> AuthResult<Option<WorkspaceMembership>> {
        let row = sqlx::query(
            r#"
            SELECT id, workspace_id, user_id, role, invited_by, joined_at
            FROM workspace_memberships
            WHERE workspace_id = ?1 AND user_id = ?2
            "#
        )
        .bind(workspace_id)
        .bind(user_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(row.map(|r| self.row_to_membership(r)))
    }
    
    async fn list_workspace_members(
        &self,
        workspace_id: &str,
    ) -> AuthResult<Vec<(User, WorkspaceMembership)>> {
        // 简化实现 - 实际需要 JOIN
        Ok(vec![])
    }
    
    async fn update_membership_role(
        &self,
        id: &str,
        role: WorkspaceRole,
    ) -> AuthResult<()> {
        sqlx::query(
            "UPDATE workspace_memberships SET role = ?2 WHERE id = ?1"
        )
        .bind(id)
        .bind(format!("{:?}", role).to_lowercase())
        .execute(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(())
    }
    
    async fn delete_membership(&self, id: &str) -> AuthResult<()> {
        sqlx::query("DELETE FROM workspace_memberships WHERE id = ?1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(())
    }
    
    // Session 方法（简化）
    async fn create_session(&self, session: &AuthSession) -> AuthResult<()> {
        sqlx::query(
            r#"
            INSERT INTO auth_sessions
                (id, user_id, access_token, refresh_token, expires_at,
                 created_at, last_used_at, ip_address, user_agent)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
            "#
        )
        .bind(&session.id)
        .bind(&session.user_id)
        .bind(&session.access_token)
        .bind(&session.refresh_token)
        .bind(session.expires_at)
        .bind(session.created_at)
        .bind(session.last_used_at)
        .bind(&session.ip_address)
        .bind(&session.user_agent)
        .execute(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(())
    }
    
    async fn find_session_by_refresh_token(
        &self,
        token: &str,
    ) -> AuthResult<Option<AuthSession>> {
        let row = sqlx::query(
            r#"
            SELECT id, user_id, access_token, refresh_token, expires_at,
                   created_at, last_used_at, ip_address, user_agent
            FROM auth_sessions
            WHERE refresh_token = ?1
            "#
        )
        .bind(token)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(row.map(|r| self.row_to_session(r)))
    }
    
    async fn revoke_session(&self, id: &str) -> AuthResult<()> {
        sqlx::query("DELETE FROM auth_sessions WHERE id = ?1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(())
    }
    
    async fn revoke_all_user_sessions(
        &self,
        user_id: &str,
    ) -> AuthResult<()> {
        sqlx::query("DELETE FROM auth_sessions WHERE user_id = ?1")
            .bind(user_id)
            .execute(&self.pool)
            .await
            .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(())
    }
    
    // OAuth State 方法（简化，使用内存缓存）
    async fn create_oauth_state(
        &self,
        _state: &OAuthState) -> AuthResult<()> {
        // Phase 1: 使用内存缓存，Phase 2 可替换为数据库
        Ok(())
    }
    
    async fn find_oauth_state(
        &self,
        _state: &str) -> AuthResult<Option<OAuthState>> {
        Ok(None)
    }
    
    async fn delete_oauth_state(
        &self,
        _state: &str) -> AuthResult<()> {
        Ok(())
    }
}

impl SqliteUserStorage {
    fn row_to_user(&self, row: sqlx::sqlite::SqliteRow) -> User {
        User {
            id: row.get("id"),
            email: row.get("email"),
            name: row.get("name"),
            avatar_url: row.get("avatar_url"),
            status: match row.get::<String, _>("status").as_str() {
                "active" => UserStatus::Active,
                "suspended" => UserStatus::Suspended,
                _ => UserStatus::Deleted,
            },
            auth_provider: match row.get::<String, _>("auth_provider").as_str() {
                "google" => AuthProvider::Google,
                "github" => AuthProvider::GitHub,
                _ => AuthProvider::Email,
            },
            auth_provider_id: row.get("auth_provider_id"),
            password_hash: row.get("password_hash"),
            email_verified_at: row.get("email_verified_at"),
            created_at: row.get("created_at"),
            last_login_at: row.get("last_login_at"),
        }
    }
    
    fn row_to_workspace(
        &self, row: sqlx::sqlite::SqliteRow) -> Workspace {
        Workspace {
            id: row.get("id"),
            name: row.get("name"),
            slug: row.get("slug"),
            description: row.get("description"),
            owner_id: row.get("owner_id"),
            workspace_type: match row.get::<String, _>("workspace_type").as_str() {
                "team" => WorkspaceType::Team,
                _ => WorkspaceType::Personal,
            },
            created_at: row.get("created_at"),
            updated_at: row.get("updated_at"),
        }
    }
    
    fn row_to_membership(
        &self, row: sqlx::sqlite::SqliteRow) -> WorkspaceMembership {
        WorkspaceMembership {
            id: row.get("id"),
            workspace_id: row.get("workspace_id"),
            user_id: row.get("user_id"),
            role: match row.get::<String, _>("role").as_str() {
                "owner" => WorkspaceRole::Owner,
                "admin" => WorkspaceRole::Admin,
                "editor" => WorkspaceRole::Editor,
                _ => WorkspaceRole::Viewer,
            },
            invited_by: row.get("invited_by"),
            joined_at: row.get("joined_at"),
        }
    }
    
    fn row_to_session(&self, row: sqlx::sqlite::SqliteRow) -> AuthSession {
        AuthSession {
            id: row.get("id"),
            user_id: row.get("user_id"),
            access_token: row.get("access_token"),
            refresh_token: row.get("refresh_token"),
            expires_at: row.get("expires_at"),
            created_at: row.get("created_at"),
            last_used_at: row.get("last_used_at"),
            ip_address: row.get("ip_address"),
            user_agent: row.get("user_agent"),
        }
    }
}
```

- [ ] **Step 4: 更新 lib.rs**

Modify `crates/decacan-auth/src/lib.rs`:

```rust
pub mod entities;
pub mod error;
pub mod storage;

pub use entities::*;
pub use error::{AuthError, AuthResult};
pub use storage::{UserStorage};

#[cfg(feature = "sqlite")]
pub use storage::SqliteUserStorage;
```

- [ ] **Step 5: 编译检查**

Run: `cargo check -p decacan-auth`
Expected: SUCCESS (可能有一些未使用警告，正常)

- [ ] **Step 6: 提交**

```bash
git add crates/decacan-auth/
git commit -m "feat(auth): add storage trait and SQLite implementation"
```

---

## Phase 2: 认证服务 (Week 2)

### Task 3: 实现密码哈希和 JWT

**Files:**
- Create: `crates/decacan-auth/src/service/mod.rs`
- Create: `crates/decacan-auth/src/service/auth.rs`

- [ ] **Step 1: 实现认证服务**

Create `crates/decacan-auth/src/service/mod.rs`:

```rust
pub mod auth;

pub use auth::AuthService;
```

Create `crates/decacan-auth/src/service/auth.rs`:

```rust
use std::sync::Arc;

use argon2::{
    password_hash::{rand_core::OsRng, PasswordHash, PasswordHasher, PasswordVerifier, SaltString},
    Argon2,
};
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use time::{Duration, OffsetDateTime};
use uuid::Uuid;

use crate::entities::*;
use crate::error::{AuthError, AuthResult};
use crate::storage::UserStorage;

#[derive(Debug, Clone)]
pub struct AuthService<S: UserStorage> {
    storage: Arc<S>,
    jwt_secret: String,
    access_token_expiry: Duration,
    refresh_token_expiry: Duration,
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,    // user_id
    exp: i64,       // expiration time
    iat: i64,       // issued at
    typ: String,    // "access" or "refresh"
}

pub struct AuthTokens {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_in: i64,
}

impl<S: UserStorage> AuthService<S> {
    pub fn new(
        storage: Arc<S>,
        jwt_secret: impl Into<String>,
    ) -> Self {
        Self {
            storage,
            jwt_secret: jwt_secret.into(),
            access_token_expiry: Duration::minutes(15),
            refresh_token_expiry: Duration::days(7),
        }
    }
    
    pub async fn register(
        &self,
        email: &str,
        password: &str,
        name: &str,
    ) -> AuthResult<(User, AuthTokens)> {
        // 验证输入
        if email.is_empty() || password.len() < 8 || name.is_empty() {
            return Err(AuthError::Validation(
                "Invalid input".to_string()));
        }
        
        // 检查邮箱是否已存在
        if self.storage.find_user_by_email(email).await?.is_some() {
            return Err(AuthError::EmailAlreadyExists);
        }
        
        // 哈希密码
        let password_hash = hash_password(password)?;
        
        // 创建用户
        let user = User {
            id: Uuid::new_v4().to_string(),
            email: email.to_string(),
            name: name.to_string(),
            avatar_url: None,
            status: UserStatus::Active,
            auth_provider: AuthProvider::Email,
            auth_provider_id: None,
            password_hash: Some(password_hash),
            email_verified_at: None, // Phase 1 跳过验证
            created_at: OffsetDateTime::now_utc(),
            last_login_at: Some(OffsetDateTime::now_utc()),
        };
        
        self.storage.create_user(&user).await?;
        
        // 创建 Personal Workspace
        let workspace = Workspace::new(
            Uuid::new_v4().to_string(),
            format!("{}'s Workspace", name),
            format!("personal-{}", user.id),
            &user.id,
        );
        self.storage.create_workspace(&workspace).await?;
        
        // 创建 Owner membership
        let membership = WorkspaceMembership::new(
            &workspace.id,
            &user.id,
            WorkspaceRole::Owner,
        );
        self.storage.create_membership(&membership).await?;
        
        // 生成 tokens
        let tokens = self.generate_tokens(&user.id).await?;
        
        Ok((user, tokens))
    }
    
    pub async fn login(
        &self,
        email: &str,
        password: &str,
    ) -> AuthResult<(User, AuthTokens)> {
        let user = self.storage
            .find_user_by_email(email)
            .await?
            .ok_or(AuthError::InvalidCredentials)?;
        
        // 验证密码
        let password_hash = user.password_hash.as_ref()
            .ok_or(AuthError::InvalidCredentials)?;
        
        if !verify_password(password, password_hash)? {
            return Err(AuthError::InvalidCredentials);
        }
        
        // 更新最后登录时间
        self.storage.update_last_login(&user.id).await?;
        
        // 生成 tokens
        let tokens = self.generate_tokens(&user.id).await?;
        
        Ok((user, tokens))
    }
    
    pub async fn refresh_token(
        &self,
        refresh_token: &str,
    ) -> AuthResult<AuthTokens> {
        // 验证 refresh token
        let claims = self.verify_token(refresh_token, "refresh")?;
        
        // 检查数据库中是否存在
        let session = self.storage
            .find_session_by_refresh_token(refresh_token)
            .await?
            .ok_or(AuthError::InvalidToken)?;
        
        // 检查是否过期
        if session.expires_at < OffsetDateTime::now_utc() {
            return Err(AuthError::TokenExpired);
        }
        
        // 撤销旧 session
        self.storage.revoke_session(&session.id).await?;
        
        // 生成新 tokens
        let tokens = self.generate_tokens(&claims.sub).await?;
        
        Ok(tokens)
    }
    
    pub async fn logout(
        &self,
        user_id: &str,
        refresh_token: &str,
    ) -> AuthResult<()> {
        let session = self.storage
            .find_session_by_refresh_token(refresh_token)
            .await?;
        
        if let Some(session) = session {
            if session.user_id == user_id {
                self.storage.revoke_session(&session.id).await?;
            }
        }
        
        Ok(())
    }
    
    pub async fn verify_access_token(
        &self,
        token: &str,
    ) -> AuthResult<String> {
        let claims = self.verify_token(token, "access")?;
        Ok(claims.sub)
    }
    
    async fn generate_tokens(
        &self,
        user_id: &str,
    ) -> AuthResult<AuthTokens> {
        let now = OffsetDateTime::now_utc();
        
        // Access token
        let access_claims = Claims {
            sub: user_id.to_string(),
            exp: (now + self.access_token_expiry).unix_timestamp(),
            iat: now.unix_timestamp(),
            typ: "access".to_string(),
        };
        
        let access_token = encode(
            &Header::default(),
            &access_claims,
            &EncodingKey::from_secret(self.jwt_secret.as_bytes()),
        ).map_err(|e| AuthError::Storage(e.to_string()))?;
        
        // Refresh token
        let refresh_claims = Claims {
            sub: user_id.to_string(),
            exp: (now + self.refresh_token_expiry).unix_timestamp(),
            iat: now.unix_timestamp(),
            typ: "refresh".to_string(),
        };
        
        let refresh_token = encode(
            &Header::default(),
            &refresh_claims,
            &EncodingKey::from_secret(self.jwt_secret.as_bytes()),
        ).map_err(|e| AuthError::Storage(e.to_string()))?;
        
        // 保存 session
        let session = AuthSession {
            id: Uuid::new_v4().to_string(),
            user_id: user_id.to_string(),
            access_token: access_token.clone(),
            refresh_token: refresh_token.clone(),
            expires_at: now + self.refresh_token_expiry,
            created_at: now,
            last_used_at: None,
            ip_address: None,
            user_agent: None,
        };
        
        self.storage.create_session(&session).await?;
        
        Ok(AuthTokens {
            access_token,
            refresh_token,
            expires_in: self.access_token_expiry.whole_seconds(),
        })
    }
    
    fn verify_token(
        &self,
        token: &str,
        expected_type: &str,
    ) -> AuthResult<Claims> {
        let validation = Validation::default();
        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(self.jwt_secret.as_bytes()),
            &validation,
        ).map_err(|e| match e.kind() {
            jsonwebtoken::errors::ErrorKind::ExpiredSignature => AuthError::TokenExpired,
            _ => AuthError::InvalidToken,
        })?;
        
        if token_data.claims.typ != expected_type {
            return Err(AuthError::InvalidToken);
        }
        
        Ok(token_data.claims)
    }
}

fn hash_password(password: &str) -> AuthResult<String> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    
    let password_hash = argon2
        .hash_password(password.as_bytes(), &salt)
        .map_err(|e| AuthError::Storage(e.to_string()))?
        .to_string();
    
    Ok(password_hash)
}

fn verify_password(password: &str, hash: &str) -> AuthResult<bool> {
    let parsed_hash = PasswordHash::new(hash)
        .map_err(|e| AuthError::Storage(e.to_string()))?;
    
    let argon2 = Argon2::default();
    
    Ok(argon2.verify_password(password.as_bytes(), &parsed_hash).is_ok())
}
```

- [ ] **Step 2: 更新 lib.rs**

Modify `crates/decacan-auth/src/lib.rs`:

```rust
pub mod entities;
pub mod error;
pub mod service;
pub mod storage;

pub use entities::*;
pub use error::{AuthError, AuthResult};
pub use service::AuthService;
pub use storage::UserStorage;

#[cfg(feature = "sqlite")]
pub use storage::SqliteUserStorage;
```

- [ ] **Step 3: 编译检查**

Run: `cargo check -p decacan-auth`
Expected: SUCCESS

- [ ] **Step 4: 创建测试**

Create `crates/decacan-auth/tests/auth_service_test.rs`:

```rust
use std::sync::Arc;

use decacan_auth::{AuthService, SqliteUserStorage};

#[tokio::test]
async fn test_register_and_login() {
    // 创建临时数据库
    let storage = Arc::new(
        SqliteUserStorage::new(":memory:").await.unwrap()
    );
    
    let auth_service = AuthService::new(
        storage,
        "test-secret-key-for-jwt-signing"
    );
    
    // 注册
    let (user, tokens) = auth_service
        .register("test@example.com", "password123", "Test User")
        .await
        .unwrap();
    
    assert_eq!(user.email, "test@example.com");
    assert_eq!(user.name, "Test User");
    assert!(!tokens.access_token.is_empty());
    assert!(!tokens.refresh_token.is_empty());
    
    // 登录
    let (logged_in_user, new_tokens) = auth_service
        .login("test@example.com", "password123")
        .await
        .unwrap();
    
    assert_eq!(logged_in_user.id, user.id);
    
    // 验证错误的密码
    let result = auth_service
        .login("test@example.com", "wrongpassword")
        .await;
    
    assert!(result.is_err());
}

#[tokio::test]
async fn test_duplicate_email() {
    let storage = Arc::new(
        SqliteUserStorage::new(":memory:").await.unwrap()
    );
    
    let auth_service = AuthService::new(storage, "test-secret");
    
    // 第一次注册
    auth_service
        .register("dup@example.com", "password123", "User")
        .await
        .unwrap();
    
    // 重复注册
    let result = auth_service
        .register("dup@example.com", "password456", "Another User")
        .await;
    
    assert!(result.is_err());
}
```

- [ ] **Step 5: 运行测试**

Run: `cargo test -p decacan-auth`
Expected: All tests PASS

- [ ] **Step 6: 提交**

```bash
git add crates/decacan-auth/
git commit -m "feat(auth): add authentication service with JWT and password hashing"
```

---

## Phase 3: Workspace 服务 (Week 3)

### Task 4: 实现 Workspace 管理服务

**Files:**
- Create: `crates/decacan-auth/src/service/workspace.rs`

- [ ] **Step 1: 实现 Workspace 服务**

Create `crates/decacan-auth/src/service/workspace.rs`:

```rust
use std::sync::Arc;

use uuid::Uuid;

use crate::entities::*;
use crate::error::{AuthError, AuthResult};
use crate::storage::UserStorage;

#[derive(Debug, Clone)]
pub struct WorkspaceService<S: UserStorage> {
    storage: Arc<S>,
}

pub struct CreateWorkspaceRequest {
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub workspace_type: WorkspaceType,
}

pub struct UpdateWorkspaceRequest {
    pub name: Option<String>,
    pub description: Option<String>,
}

pub struct InviteMemberRequest {
    pub email: String,
    pub role: WorkspaceRole,
}

impl<S: UserStorage> WorkspaceService<S> {
    pub fn new(storage: Arc<S>) -> Self {
        Self { storage }
    }
    
    pub async fn create_workspace(
        &self,
        user_id: &str,
        request: CreateWorkspaceRequest,
    ) -> AuthResult<Workspace> {
        // 检查 slug 是否已存在
        if self.storage.find_workspace_by_slug(&request.slug).await?.is_some() {
            return Err(AuthError::WorkspaceSlugExists);
        }
        
        let workspace = Workspace {
            id: Uuid::new_v4().to_string(),
            name: request.name,
            slug: request.slug,
            description: request.description,
            owner_id: user_id.to_string(),
            workspace_type: request.workspace_type,
            created_at: time::OffsetDateTime::now_utc(),
            updated_at: time::OffsetDateTime::now_utc(),
        };
        
        self.storage.create_workspace(&workspace).await?;
        
        // 自动添加 owner membership
        let membership = WorkspaceMembership::new(
            &workspace.id,
            user_id,
            WorkspaceRole::Owner,
        );
        self.storage.create_membership(&membership).await?;
        
        Ok(workspace)
    }
    
    pub async fn list_workspaces(
        &self,
        user_id: &str,
    ) -> AuthResult<Vec<Workspace>> {
        self.storage.list_user_workspaces(user_id).await
    }
    
    pub async fn get_workspace(
        &self,
        workspace_id: &str,
    ) -> AuthResult<Option<Workspace>> {
        self.storage.find_workspace_by_id(workspace_id).await
    }
    
    pub async fn update_workspace(
        &self,
        workspace_id: &str,
        user_id: &str,
        request: UpdateWorkspaceRequest,
    ) -> AuthResult<Workspace> {
        // 检查权限
        let membership = self.storage
            .find_membership(workspace_id, user_id)
            .await?
            .ok_or(AuthError::InsufficientPermissions)?;
        
        if !membership.role.can_edit_playbooks() {
            return Err(AuthError::InsufficientPermissions);
        }
        
        let mut workspace = self.storage
            .find_workspace_by_id(workspace_id)
            .await?
            .ok_or(AuthError::WorkspaceNotFound)?;
        
        if let Some(name) = request.name {
            workspace.name = name;
        }
        if let Some(description) = request.description {
            workspace.description = Some(description);
        }
        
        self.storage.update_workspace(&workspace).await?;
        
        Ok(workspace)
    }
    
    pub async fn delete_workspace(
        &self,
        workspace_id: &str,
        user_id: &str,
    ) -> AuthResult<()> {
        // 只有 Owner 可以删除
        let membership = self.storage
            .find_membership(workspace_id, user_id)
            .await?
            .ok_or(AuthError::InsufficientPermissions)?;
        
        if membership.role != WorkspaceRole::Owner {
            return Err(AuthError::InsufficientPermissions);
        }
        
        self.storage.delete_workspace(workspace_id).await
    }
    
    // 成员管理
    pub async fn invite_member(
        &self,
        workspace_id: &str,
        inviter_id: &str,
        request: InviteMemberRequest,
    ) -> AuthResult<WorkspaceMembership> {
        // 检查权限
        let inviter_membership = self.storage
            .find_membership(workspace_id, inviter_id)
            .await?
            .ok_or(AuthError::InsufficientPermissions)?;
        
        if !inviter_membership.role.can_manage_members() {
            return Err(AuthError::InsufficientPermissions);
        }
        
        // 查找被邀请用户
        let invited_user = self.storage
            .find_user_by_email(&request.email)
            .await?
            .ok_or(AuthError::UserNotFound)?;
        
        // 检查是否已在 Workspace 中
        if self.storage
            .find_membership(workspace_id, &invited_user.id)
            .await?
            .is_some()
        {
            return Err(AuthError::UserAlreadyInWorkspace);
        }
        
        // 不能邀请 Owner
        if request.role == WorkspaceRole::Owner {
            return Err(AuthError::InsufficientPermissions);
        }
        
        let membership = WorkspaceMembership {
            id: Uuid::new_v4().to_string(),
            workspace_id: workspace_id.to_string(),
            user_id: invited_user.id,
            role: request.role,
            invited_by: Some(inviter_id.to_string()),
            joined_at: time::OffsetDateTime::now_utc(),
        };
        
        self.storage.create_membership(&membership).await?;
        
        Ok(membership)
    }
    
    pub async fn list_members(
        &self,
        workspace_id: &str,
        user_id: &str,
    ) -> AuthResult<Vec<(User, WorkspaceMembership)>> {
        // 检查是否是成员
        self.storage
            .find_membership(workspace_id, user_id)
            .await?
            .ok_or(AuthError::InsufficientPermissions)?;
        
        self.storage.list_workspace_members(workspace_id).await
    }
    
    pub async fn update_member_role(
        &self,
        workspace_id: &str,
        member_id: &str,
        user_id: &str,
        new_role: WorkspaceRole,
    ) -> AuthResult<()> {
        // 检查权限
        let user_membership = self.storage
            .find_membership(workspace_id, user_id)
            .await?
            .ok_or(AuthError::InsufficientPermissions)?;
        
        if !user_membership.role.can_manage_members() {
            return Err(AuthError::InsufficientPermissions);
        }
        
        // 不能修改 Owner
        let target_membership = self.storage
            .find_membership(workspace_id, member_id)
            .await?
            .ok_or(AuthError::UserNotFound)?;
        
        if target_membership.role == WorkspaceRole::Owner {
            return Err(AuthError::CannotRemoveOwner);
        }
        
        // 不能设置为 Owner
        if new_role == WorkspaceRole::Owner {
            return Err(AuthError::InsufficientPermissions);
        }
        
        self.storage
            .update_membership_role(&target_membership.id, new_role)
            .await
    }
    
    pub async fn remove_member(
        &self,
        workspace_id: &str,
        member_id: &str,
        user_id: &str,
    ) -> AuthResult<()> {
        // 检查权限
        let user_membership = self.storage
            .find_membership(workspace_id, user_id)
            .await?
            .ok_or(AuthError::InsufficientPermissions)?;
        
        if !user_membership.role.can_manage_members() {
            return Err(AuthError::InsufficientPermissions);
        }
        
        // 不能移除 Owner
        let target_membership = self.storage
            .find_membership(workspace_id, member_id)
            .await?
            .ok_or(AuthError::UserNotFound)?;
        
        if target_membership.role == WorkspaceRole::Owner {
            return Err(AuthError::CannotRemoveOwner);
        }
        
        self.storage.delete_membership(&target_membership.id).await
    }
    
    pub async fn check_permission(
        &self,
        workspace_id: &str,
        user_id: &str,
        required_role: WorkspaceRole,
    ) -> AuthResult<bool> {
        let membership = self.storage
            .find_membership(workspace_id, user_id)
            .await?;
        
        Ok(match (membership.map(|m| m.role), required_role) {
            (Some(WorkspaceRole::Owner), _) => true,
            (Some(WorkspaceRole::Admin), WorkspaceRole::Admin | WorkspaceRole::Editor | WorkspaceRole::Viewer) => true,
            (Some(WorkspaceRole::Editor), WorkspaceRole::Editor | WorkspaceRole::Viewer) => true,
            (Some(WorkspaceRole::Viewer), WorkspaceRole::Viewer) => true,
            _ => false,
        })
    }
}
```

- [ ] **Step 2: 更新 service/mod.rs**

Modify `crates/decacan-auth/src/service/mod.rs`:

```rust
pub mod auth;
pub mod workspace;

pub use auth::{AuthService, AuthTokens};
pub use workspace::WorkspaceService;
```

- [ ] **Step 3: 编译检查**

Run: `cargo check -p decacan-auth`
Expected: SUCCESS

- [ ] **Step 4: 添加 Workspace 测试**

Add to `crates/decacan-auth/tests/workspace_service_test.rs`:

```rust
use std::sync::Arc;

use decacan_auth::{
    AuthService, SqliteUserStorage, WorkspaceRole,
    WorkspaceService, WorkspaceType,
};

#[tokio::test]
async fn test_create_and_list_workspaces() {
    let storage = Arc::new(
        SqliteUserStorage::new(":memory:").await.unwrap()
    );
    
    let auth_service = AuthService::new(storage.clone(), "test-secret");
    let workspace_service = WorkspaceService::new(storage);
    
    // 创建用户
    let (user, _) = auth_service
        .register("owner@example.com", "password123", "Owner")
        .await
        .unwrap();
    
    // 创建 Workspace
    let workspace = workspace_service
        .create_workspace(
            &user.id,
            decacan_auth::service::workspace::CreateWorkspaceRequest {
                name: "Test Workspace".to_string(),
                slug: "test-workspace".to_string(),
                description: None,
                workspace_type: WorkspaceType::Team,
            },
        )
        .await
        .unwrap();
    
    assert_eq!(workspace.name, "Test Workspace");
    assert_eq!(workspace.slug, "test-workspace");
    
    // 列出 Workspaces
    let workspaces = workspace_service.list_workspaces(&user.id).await.unwrap();
    assert_eq!(workspaces.len(), 2); // Personal + Team
}

#[tokio::test]
async fn test_workspace_permissions() {
    let storage = Arc::new(
        SqliteUserStorage::new(":memory:").await.unwrap()
    );
    
    let auth_service = AuthService::new(storage.clone(), "test-secret");
    let workspace_service = WorkspaceService::new(storage);
    
    // 创建两个用户
    let (owner, _) = auth_service
        .register("owner@example.com", "password123", "Owner")
        .await
        .unwrap();
    
    let (member, _) = auth_service
        .register("member@example.com", "password123", "Member")
        .await
        .unwrap();
    
    // 创建 Workspace
    let workspace = workspace_service
        .create_workspace(
            &owner.id,
            decacan_auth::service::workspace::CreateWorkspaceRequest {
                name: "Test".to_string(),
                slug: "test".to_string(),
                description: None,
                workspace_type: WorkspaceType::Team,
            },
        )
        .await
        .unwrap();
    
    // 邀请成员
    workspace_service
        .invite_member(
            &workspace.id,
            &owner.id,
            decacan_auth::service::workspace::InviteMemberRequest {
                email: "member@example.com".to_string(),
                role: WorkspaceRole::Editor,
            },
        )
        .await
        .unwrap();
    
    // 成员不能删除 Workspace
    let result = workspace_service
        .delete_workspace(&workspace.id, &member.id)
        .await;
    
    assert!(result.is_err());
}
```

- [ ] **Step 5: 运行所有测试**

Run: `cargo test -p decacan-auth`
Expected: All tests PASS

- [ ] **Step 6: 提交**

```bash
git add crates/decacan-auth/
git commit -m "feat(auth): add workspace service with member management"
```

---

## Phase 4: HTTP API 集成 (Week 4)

### Task 5: 实现 HTTP API 端点

**Files:**
- Create: `crates/decacan-app/src/api/auth.rs`
- Modify: `crates/decacan-app/src/api/mod.rs`
- Modify: `crates/decacan-app/src/app/wiring.rs`
- Modify: `crates/decacan-app/src/app/state.rs`

- [ ] **Step 1: 创建认证 API 模块**

Create `crates/decacan-app/src/api/auth.rs`:

```rust
use std::sync::Arc;

use axum::{
    extract::State,
    http::StatusCode,
    response::IntoResponse,
    routing::{delete, get, post},
    Json, Router,
};
use serde::{Deserialize, Serialize};

use decacan_auth::{
    AuthService, AuthTokens, SqliteUserStorage, User, WorkspaceRole,
    WorkspaceService, WorkspaceType,
};

use crate::app::state::AppState;

// DTOs
#[derive(Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub password: String,
    pub name: String,
}

#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

#[derive(Deserialize)]
pub struct RefreshRequest {
    pub refresh_token: String,
}

#[derive(Serialize)]
pub struct AuthResponse {
    pub user: UserDto,
    pub access_token: String,
    pub refresh_token: String,
    pub expires_in: i64,
}

#[derive(Serialize)]
pub struct UserDto {
    pub id: String,
    pub email: String,
    pub name: String,
    pub avatar_url: Option<String>,
}

impl From<User> for UserDto {
    fn from(user: User) -> Self {
        Self {
            id: user.id,
            email: user.email,
            name: user.name,
            avatar_url: user.avatar_url,
        }
    }
}

// 错误响应
#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
    pub message: String,
}

// 路由
pub fn router() -> Router<AppState> {
    Router::new()
        .route("/auth/register", post(register))
        .route("/auth/login", post(login))
        .route("/auth/refresh", post(refresh_token))
        .route("/auth/logout", delete(logout))
        .route("/me", get(get_current_user))
}

// 处理器
async fn register(
    State(state): State<AppState>,
    Json(request): Json<RegisterRequest>,
) -> Result<impl IntoResponse, AppError> {
    let (user, tokens) = state
        .auth_service
        .register(&request.email, &request.password, &request.name)
        .await
        .map_err(AppError::Auth)?;
    
    Ok((
        StatusCode::CREATED,
        Json(AuthResponse {
            user: user.into(),
            access_token: tokens.access_token,
            refresh_token: tokens.refresh_token,
            expires_in: tokens.expires_in,
        }),
    ))
}

async fn login(
    State(state): State<AppState>,
    Json(request): Json<LoginRequest>,
) -> Result<impl IntoResponse, AppError> {
    let (user, tokens) = state
        .auth_service
        .login(&request.email, &request.password)
        .await
        .map_err(AppError::Auth)?;
    
    Ok(Json(AuthResponse {
        user: user.into(),
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
    }))
}

async fn refresh_token(
    State(state): State<AppState>,
    Json(request): Json<RefreshRequest>,
) -> Result<impl IntoResponse, AppError> {
    let tokens = state
        .auth_service
        .refresh_token(&request.refresh_token)
        .await
        .map_err(AppError::Auth)?;
    
    Ok(Json(AuthResponse {
        user: UserDto {
            id: "".to_string(),
            email: "".to_string(),
            name: "".to_string(),
            avatar_url: None,
        },
        access_token: tokens.access_token,
        refresh_token: tokens.refresh_token,
        expires_in: tokens.expires_in,
    }))
}

async fn logout(
    State(state): State<AppState>,
    // 从 header 提取 token 的逻辑省略
) -> impl IntoResponse {
    // 简化实现
    StatusCode::NO_CONTENT
}

async fn get_current_user(
    State(state): State<AppState>,
    // 从 header 提取 user_id 的逻辑省略
) -> Result<impl IntoResponse, AppError> {
    // 简化实现
    Ok(Json(UserDto {
        id: "".to_string(),
        email: "".to_string(),
        name: "".to_string(),
        avatar_url: None,
    }))
}

// 错误类型
#[derive(Debug)]
pub enum AppError {
    Auth(decacan_auth::AuthError),
}

impl From<decacan_auth::AuthError> for AppError {
    fn from(err: decacan_auth::AuthError) -> Self {
        AppError::Auth(err)
    }
}

impl IntoResponse for AppError {
    fn into_response(self) -> axum::response::Response {
        match self {
            AppError::Auth(auth_err) => {
                let (status, error_code) = match auth_err {
                    decacan_auth::AuthError::InvalidCredentials => {
                        (StatusCode::UNAUTHORIZED, "invalid_credentials")
                    }
                    decacan_auth::AuthError::EmailAlreadyExists => {
                        (StatusCode::CONFLICT, "email_already_exists")
                    }
                    decacan_auth::AuthError::WorkspaceSlugExists => {
                        (StatusCode::CONFLICT, "workspace_slug_exists")
                    }
                    decacan_auth::AuthError::InsufficientPermissions => {
                        (StatusCode::FORBIDDEN, "insufficient_permissions")
                    }
                    _ => (StatusCode::BAD_REQUEST, "auth_error"),
                };
                
                let body = Json(ErrorResponse {
                    error: error_code.to_string(),
                    message: auth_err.to_string(),
                });
                
                (status, body).into_response()
            }
        }
    }
}
```

- [ ] **Step 2: 更新 AppState**

Modify `crates/decacan-app/src/app/state.rs`:

Add fields to `AppStateInner`:

```rust
use std::sync::Arc;
use decacan_auth::{AuthService, SqliteUserStorage, WorkspaceService};

struct AppStateInner {
    // ... 现有字段
    storage: Arc<SqliteUserStorage>,
    auth_service: AuthService<SqliteUserStorage>,
    workspace_service: WorkspaceService<SqliteUserStorage>,
}

pub struct AppState {
    inner: Arc<AppStateInner>,
}

impl AppState {
    pub async fn new_local() -> std::io::Result<Self> {
        // ... 现有代码
        
        // 初始化存储
        let storage = Arc::new(
            SqliteUserStorage::new("sqlite:./decacan.db")
                .await
                .map_err(|e| std::io::Error::new(
                    std::io::ErrorKind::Other, e.to_string()))?
        );
        
        let jwt_secret = std::env::var("JWT_SECRET")
            .unwrap_or_else(|_| "your-secret-key-change-in-production".to_string());
        
        let auth_service = AuthService::new(storage.clone(), jwt_secret);
        let workspace_service = WorkspaceService::new(storage.clone());
        
        Ok(Self {
            inner: Arc::new(AppStateInner {
                // ... 现有字段
                storage,
                auth_service,
                workspace_service,
            }),
        })
    }
}
```

- [ ] **Step 3: 更新 wiring.rs**

Modify `crates/decacan-app/src/app/wiring.rs`:

```rust
use crate::api::{auth, ...};

pub fn router() -> Router<AppState> {
    Router::new()
        .merge(auth::router())
        // ... 其他路由
}
```

- [ ] **Step 4: 更新 Cargo.toml**

Modify `crates/decacan-app/Cargo.toml`:

Add dependency:

```toml
[dependencies]
# ... 现有依赖
decacan-auth = { path = "../decacan-auth" }
```

- [ ] **Step 5: 编译检查**

Run: `cargo check -p decacan-app`
Expected: SUCCESS

- [ ] **Step 6: 提交**

```bash
git add crates/decacan-app/
git commit -m "feat(api): add auth endpoints integration"
```

---

### Task 6: 中间件和权限检查

**Files:**
- Create: `crates/decacan-app/src/middleware/auth.rs`
- Modify: `crates/decacan-app/src/middleware/mod.rs`

- [ ] **Step 1: 创建认证中间件**

Create `crates/decacan-app/src/middleware/auth.rs`:

```rust
use axum::{
    extract::{Request, State},
    http::StatusCode,
    middleware::Next,
    response::IntoResponse,
    Extension,
};

use crate::app::state::AppState;

#[derive(Debug, Clone)]
pub struct CurrentUser {
    pub user_id: String,
}

pub async fn auth_middleware(
    State(state): State<AppState>,
    mut request: Request,
    next: Next,
) -> Result<impl IntoResponse, StatusCode> {
    // 从 Authorization header 提取 token
    let auth_header = request
        .headers()
        .get("authorization")
        .and_then(|value| value.to_str().ok())
        .ok_or(StatusCode::UNAUTHORIZED)?;
    
    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or(StatusCode::UNAUTHORIZED)?;
    
    // 验证 token
    let user_id = state
        .auth_service
        .verify_access_token(token)
        .await
        .map_err(|_| StatusCode::UNAUTHORIZED)?;
    
    // 附加用户信息到请求
    request.extensions_mut().insert(CurrentUser { user_id });
    
    Ok(next.run(request).await)
}
```

- [ ] **Step 2: 应用到路由**

Modify `crates/decacan-app/src/api/auth.rs`:

添加需要认证的 Workspace 路由:

```rust
use axum::middleware;
use crate::middleware::auth::{auth_middleware, CurrentUser};

pub fn protected_router() -> Router<AppState> {
    Router::new()
        .route("/workspaces", get(list_workspaces).post(create_workspace))
        .route("/workspaces/:id", get(get_workspace).put(update_workspace).delete(delete_workspace))
        .route("/workspaces/:id/members", get(list_members).post(invite_member))
        .route("/workspaces/:id/members/:user_id", delete(remove_member))
        .layer(middleware::from_fn(auth_middleware))
}
```

- [ ] **Step 3: 提交**

```bash
git add crates/decacan-app/
git commit -m "feat(api): add auth middleware and protected routes"
```

---

### Task 7: 集成测试和文档

**Files:**
- Create: `crates/decacan-app/tests/auth_integration_test.rs`
- Modify: `README.md`

- [ ] **Step 1: 创建集成测试**

Create `crates/decacan-app/tests/auth_integration_test.rs`:

```rust
use axum::body::Body;
use axum::http::{Request, StatusCode};
use tower::ServiceExt;

use decacan_app::app::wiring::router;
use decacan_app::app::state::AppState;

#[tokio::test]
async fn test_auth_flow() {
    let state = AppState::new_local().await.unwrap();
    let app = router().with_state(state);
    
    // 注册
    let response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/auth/register")
                .header("content-type", "application/json")
                .body(Body::from(r#"{
                    "email": "test@example.com",
                    "password": "password123",
                    "name": "Test User"
                }"#))
                .unwrap(),
        )
        .await
        .unwrap();
    
    assert_eq!(response.status(), StatusCode::CREATED);
    
    // 登录
    let response = app
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/api/auth/login")
                .header("content-type", "application/json")
                .body(Body::from(r#"{
                    "email": "test@example.com",
                    "password": "password123"
                }"#))
                .unwrap(),
        )
        .await
        .unwrap();
    
    assert_eq!(response.status(), StatusCode::OK);
}
```

- [ ] **Step 2: 更新 README**

Add authentication section to README:

```markdown
## Authentication

Decacan supports email/password and OAuth (Google, GitHub) authentication.

### Environment Variables

```bash
JWT_SECRET=your-secret-key-change-in-production
DATABASE_URL=sqlite:./decacan.db
```

### API Endpoints

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh access token
- `DELETE /api/auth/logout` - Logout
- `GET /api/me` - Get current user

### Protected Routes

All routes except `/api/auth/*` require Bearer token in Authorization header:

```
Authorization: Bearer {access_token}
```
```

- [ ] **Step 3: 运行所有测试**

Run: `cargo test`
Expected: All tests PASS

- [ ] **Step 4: 提交**

```bash
git add .
git commit -m "feat: complete user system implementation"
```

---

## 依赖检查

确保所有依赖都已添加到 Cargo.toml：

**decacan-auth/Cargo.toml:**
- [ ] tokio
- [ ] serde
- [ ] time
- [ ] uuid
- [ ] async-trait
- [ ] thiserror
- [ ] argon2
- [ ] jsonwebtoken
- [ ] rand
- [ ] sqlx (with sqlite/postgres features)

**decacan-app/Cargo.toml:**
- [ ] decacan-auth

---

## 成功标准

- [ ] 用户可以注册/登录/登出
- [ ] JWT tokens 正常工作（access + refresh）
- [ ] 密码使用 argon2 哈希
- [ ] 创建 Workspace 时自动创建 Personal Workspace
- [ ] Workspace slug 唯一性检查
- [ ] 权限控制正常工作（Owner/Admin/Editor/Viewer）
- [ ] 成员邀请和管理功能完整
- [ ] 所有 API 端点有正确的错误响应
- [ ] 集成测试通过
- [ ] 不影响现有功能（Playbook/Task 系统）

---

**Plan Status:** Ready for execution  
**Estimated Time:** 4 weeks  
**Team Size:** 1-2 developers
