# Decacan 用户系统实施计划（更新版 - 方案 B）

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现用户认证系统（decacan-auth）并重构 Workspace 系统（decacan-runtime）以支持用户-Workspace 关系

**架构（方案 B）：**
- **decacan-auth**: 基础设施层 - 用户认证（JWT/密码/OAuth）
- **decacan-runtime**: 业务层 - Workspace 管理（保留，重构为基于 user_id）
- **接口**: auth 暴露 Authorization trait，runtime 调用进行权限检查

**技术栈:** Rust, Axum, SQLx, Argon2, jsonwebtoken

---

## 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                    decacan-auth                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  职责: 用户认证与授权基础设施                         │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  • User 实体（认证相关）                              │   │
│  │  • AuthSession / OAuthState                          │   │
│  │  • JWT Token 生成/验证                                │   │
│  │  • 密码哈希（Argon2）                                 │   │
│  │  • Authorization trait（供 runtime 调用）             │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ Authorization trait
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                  decacan-runtime                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  职责: 业务逻辑（Workspace/Playbook/Task）           │   │
│  ├──────────────────────────────────────────────────────┤   │
│  │  • Workspace 实体（重构: tenant_id → owner_id）      │   │
│  │  • WorkspaceMembership（关联 User 和 Workspace）     │   │
│  │  • 权限检查（调用 auth trait）                       │   │
│  │  • Playbook/Task（归属到 Workspace）                 │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

---

## 项目结构

```
crates/
├── decacan-auth/              # 新建: 认证基础设施
│   ├── src/
│   │   ├── lib.rs
│   │   ├── entities.rs        # User, AuthSession, OAuthState
│   │   ├── error.rs           # AuthError
│   │   ├── storage/
│   │   │   ├── mod.rs         # UserStorage trait
│   │   │   └── sqlite.rs      # SQLite 实现
│   │   ├── service/
│   │   │   └── auth.rs        # 认证服务
│   │   └── authz.rs           # Authorization trait
│   └── migrations/
│       └── 001_auth.sql
│
├── decacan-runtime/           # 修改: 业务层
│   └── src/
│       ├── workspace/         # 重构现有模块
│       │   ├── entity/
│       │   │   ├── workspace.rs      # 修改: tenant_id → owner_id
│       │   │   └── membership.rs     # 修改: 关联 User
│       │   └── service/
│       │       └── workspace_service.rs  # 修改: 调用 auth trait
│       └── ...
│
└── decacan-app/               # 修改: API 层
    └── src/
        ├── api/
        │   ├── auth.rs        # 新增: 认证端点
        │   └── workspaces.rs  # 修改: 使用新的 auth
        └── middleware/
            └── auth.rs        # 新增: JWT 验证中间件
```

---

## Phase 1: decacan-auth 基础设施 (Week 1)

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

# Storage
sqlx = { version = "0.7", features = ["runtime-tokio", "sqlite", "time", "uuid"] }

[dev-dependencies]
tokio-test = "0.4"
```

- [ ] **Step 2: 定义错误类型**

Create `crates/decacan-auth/src/error.rs`:

```rust
use thiserror::Error;

#[derive(Debug, Error, Clone)]
pub enum AuthError {
    #[error("invalid credentials")]
    InvalidCredentials,
    #[error("email already exists")]
    EmailAlreadyExists,
    #[error("user not found")]
    UserNotFound,
    #[error("invalid token")]
    InvalidToken,
    #[error("token expired")]
    TokenExpired,
    #[error("insufficient permissions")]
    InsufficientPermissions,
    #[error("validation error: {0}")]
    Validation(String),
    #[error("storage error: {0}")]
    Storage(String),
}

pub type AuthResult<T> = Result<T, AuthError>;
```

- [ ] **Step 3: 定义实体（仅认证相关）**

Create `crates/decacan-auth/src/entities.rs`:

```rust
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use uuid::Uuid;

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
```

- [ ] **Step 4: 创建 lib.rs**

Create `crates/decacan-auth/src/lib.rs`:

```rust
pub mod entities;
pub mod error;
pub mod storage;
pub mod service;
pub mod authz;

pub use entities::*;
pub use error::{AuthError, AuthResult};
pub use authz::Authorization;
```

- [ ] **Step 5: 编译检查**

Run: `cargo check -p decacan-auth`
Expected: SUCCESS

- [ ] **Step 6: 提交**

```bash
git add crates/decacan-auth/
git commit -m "feat(auth): create decacan-auth crate with user entities"
```

---

### Task 2: 创建存储层和认证服务

**Files:**
- Create: `crates/decacan-auth/src/storage/mod.rs`
- Create: `crates/decacan-auth/src/storage/sqlite.rs`
- Create: `crates/decacan-auth/src/service/mod.rs`
- Create: `crates/decacan-auth/src/service/auth.rs`
- Create: `crates/decacan-auth/migrations/001_auth.sql`

- [ ] **Step 1: 定义存储 trait**

Create `crates/decacan-auth/src/storage/mod.rs`:

```rust
use async_trait::async_trait;

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
    async fn create_oauth_state(&self, state: &OAuthState) -> AuthResult<()>;
    async fn find_oauth_state(&self, state: &str) -> AuthResult<Option<OAuthState>>;
    async fn delete_oauth_state(&self, state: &str) -> AuthResult<()>;
}

pub mod sqlite;
pub use sqlite::SqliteUserStorage;
```

- [ ] **Step 2: 实现 SQLite 存储**

Create `crates/decacan-auth/src/storage/sqlite.rs`:

```rust
use async_trait::async_trait;
use sqlx::sqlite::SqlitePool;
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
        // 用户表
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
        
        // Session 表
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
        
        // OAuth State 表
        sqlx::query(
            r#"
            CREATE TABLE IF NOT EXISTS oauth_states (
                state TEXT PRIMARY KEY,
                provider TEXT NOT NULL,
                redirect_url TEXT NOT NULL,
                created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
                expires_at TIMESTAMP NOT NULL
            )
            "#
        )
        .execute(pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        // 索引
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)")
            .execute(pool).await.ok();
        sqlx::query("CREATE INDEX IF NOT EXISTS idx_sessions_user ON auth_sessions(user_id)")
            .execute(pool).await.ok();
        
        Ok(())
    }
    
    fn parse_status(s: &str) -> UserStatus {
        match s {
            "suspended" => UserStatus::Suspended,
            "deleted" => UserStatus::Deleted,
            _ => UserStatus::Active,
        }
    }
    
    fn parse_provider(s: &str) -> AuthProvider {
        match s {
            "google" => AuthProvider::Google,
            "github" => AuthProvider::GitHub,
            _ => AuthProvider::Email,
        }
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
        let row = sqlx::query_as::<_, UserRow>(
            "SELECT * FROM users WHERE id = ?1"
        )
        .bind(id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(row.map(|r| r.into()))
    }
    
    async fn find_user_by_email(&self, email: &str) -> AuthResult<Option<User>> {
        let row = sqlx::query_as::<_, UserRow>(
            "SELECT * FROM users WHERE email = ?1"
        )
        .bind(email)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(row.map(|r| r.into()))
    }
    
    async fn find_user_by_oauth(
        &self,
        provider: AuthProvider,
        provider_id: &str,
    ) -> AuthResult<Option<User>> {
        let row = sqlx::query_as::<_, UserRow>(
            "SELECT * FROM users WHERE auth_provider = ?1 AND auth_provider_id = ?2"
        )
        .bind(format!("{:?}", provider).to_lowercase())
        .bind(provider_id)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(row.map(|r| r.into()))
    }
    
    async fn update_last_login(&self, id: &str) -> AuthResult<()> {
        sqlx::query("UPDATE users SET last_login_at = ?2 WHERE id = ?1")
            .bind(id)
            .bind(OffsetDateTime::now_utc())
            .execute(&self.pool)
            .await
            .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(())
    }
    
    async fn update_user(&self, user: &User) -> AuthResult<()> {
        sqlx::query(
            r#"
            UPDATE users
            SET email = ?2, name = ?3, avatar_url = ?4, status = ?5,
                password_hash = ?6, last_login_at = ?7
            WHERE id = ?1
            "#
        )
        .bind(&user.id)
        .bind(&user.email)
        .bind(&user.name)
        .bind(&user.avatar_url)
        .bind(format!("{:?}", user.status).to_lowercase())
        .bind(&user.password_hash)
        .bind(user.last_login_at)
        .execute(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(())
    }
    
    // Session 方法
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
        &self, token: &str
    ) -> AuthResult<Option<AuthSession>> {
        let row = sqlx::query_as::<_, SessionRow>(
            "SELECT * FROM auth_sessions WHERE refresh_token = ?1"
        )
        .bind(token)
        .fetch_optional(&self.pool)
        .await
        .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(row.map(|r| r.into()))
    }
    
    async fn revoke_session(&self, id: &str) -> AuthResult<()> {
        sqlx::query("DELETE FROM auth_sessions WHERE id = ?1")
            .bind(id)
            .execute(&self.pool)
            .await
            .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(())
    }
    
    async fn revoke_all_user_sessions(&self, user_id: &str) -> AuthResult<()> {
        sqlx::query("DELETE FROM auth_sessions WHERE user_id = ?1")
            .bind(user_id)
            .execute(&self.pool)
            .await
            .map_err(|e| AuthError::Storage(e.to_string()))?;
        
        Ok(())
    }
    
    // OAuth State（Phase 1 使用内存缓存）
    async fn create_oauth_state(&self, _state: &OAuthState) -> AuthResult<()> {
        Ok(())
    }
    
    async fn find_oauth_state(&self, _state: &str) -> AuthResult<Option<OAuthState>> {
        Ok(None)
    }
    
    async fn delete_oauth_state(&self, _state: &str) -> AuthResult<()> {
        Ok(())
    }
}

// 数据库行映射结构
#[derive(sqlx::FromRow)]
struct UserRow {
    id: String,
    email: String,
    name: String,
    avatar_url: Option<String>,
    status: String,
    auth_provider: String,
    auth_provider_id: Option<String>,
    password_hash: Option<String>,
    email_verified_at: Option<OffsetDateTime>,
    created_at: OffsetDateTime,
    last_login_at: Option<OffsetDateTime>,
}

impl From<UserRow> for User {
    fn from(row: UserRow) -> Self {
        Self {
            id: row.id,
            email: row.email,
            name: row.name,
            avatar_url: row.avatar_url,
            status: parse_status(&row.status),
            auth_provider: parse_provider(&row.auth_provider),
            auth_provider_id: row.auth_provider_id,
            password_hash: row.password_hash,
            email_verified_at: row.email_verified_at,
            created_at: row.created_at,
            last_login_at: row.last_login_at,
        }
    }
}

#[derive(sqlx::FromRow)]
struct SessionRow {
    id: String,
    user_id: String,
    access_token: String,
    refresh_token: String,
    expires_at: OffsetDateTime,
    created_at: OffsetDateTime,
    last_used_at: Option<OffsetDateTime>,
    ip_address: Option<String>,
    user_agent: Option<String>,
}

impl From<SessionRow> for AuthSession {
    fn from(row: SessionRow) -> Self {
        Self {
            id: row.id,
            user_id: row.user_id,
            access_token: row.access_token,
            refresh_token: row.refresh_token,
            expires_at: row.expires_at,
            created_at: row.created_at,
            last_used_at: row.last_used_at,
            ip_address: row.ip_address,
            user_agent: row.user_agent,
        }
    }
}

fn parse_status(s: &str) -> crate::entities::UserStatus {
    match s {
        "suspended" => crate::entities::UserStatus::Suspended,
        "deleted" => crate::entities::UserStatus::Deleted,
        _ => crate::entities::UserStatus::Active,
    }
}

fn parse_provider(s: &str) -> crate::entities::AuthProvider {
    match s {
        "google" => crate::entities::AuthProvider::Google,
        "github" => crate::entities::AuthProvider::GitHub,
        _ => crate::entities::AuthProvider::Email,
    }
}
```

- [ ] **Step 3: 创建认证服务**

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
}

#[derive(Debug, Serialize, Deserialize)]
struct Claims {
    sub: String,
    exp: i64,
    iat: i64,
    typ: String,
}

pub struct AuthTokens {
    pub access_token: String,
    pub refresh_token: String,
    pub expires_in: i64,
}

impl<S: UserStorage> AuthService<S> {
    pub fn new(storage: Arc<S>, jwt_secret: impl Into<String>) -> Self {
        Self {
            storage,
            jwt_secret: jwt_secret.into(),
        }
    }
    
    pub async fn register(
        &self,
        email: &str,
        password: &str,
        name: &str,
    ) -> AuthResult<(User, AuthTokens)> {
        if password.len() < 8 {
            return Err(AuthError::Validation(
                "Password must be at least 8 characters".to_string()
            ));
        }
        
        if self.storage.find_user_by_email(email).await?.is_some() {
            return Err(AuthError::EmailAlreadyExists);
        }
        
        let password_hash = hash_password(password)?;
        
        let user = User {
            id: Uuid::new_v4().to_string(),
            email: email.to_string(),
            name: name.to_string(),
            avatar_url: None,
            status: UserStatus::Active,
            auth_provider: AuthProvider::Email,
            auth_provider_id: None,
            password_hash: Some(password_hash),
            email_verified_at: None,
            created_at: OffsetDateTime::now_utc(),
            last_login_at: Some(OffsetDateTime::now_utc()),
        };
        
        self.storage.create_user(&user).await?;
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
        
        let hash = user.password_hash.as_ref()
            .ok_or(AuthError::InvalidCredentials)?;
        
        if !verify_password(password, hash)? {
            return Err(AuthError::InvalidCredentials);
        }
        
        self.storage.update_last_login(&user.id).await?;
        let tokens = self.generate_tokens(&user.id).await?;
        
        Ok((user, tokens))
    }
    
    pub async fn verify_token(&self,
        token: &str,
    ) -> AuthResult<String> {
        let validation = Validation::default();
        let token_data = decode::<Claims>(
            token,
            &DecodingKey::from_secret(self.jwt_secret.as_bytes()),
            &validation,
        ).map_err(|e| match e.kind() {
            jsonwebtoken::errors::ErrorKind::ExpiredSignature => AuthError::TokenExpired,
            _ => AuthError::InvalidToken,
        })?;
        
        Ok(token_data.claims.sub)
    }
    
    async fn generate_tokens(
        &self,
        user_id: &str,
    ) -> AuthResult<AuthTokens> {
        let now = OffsetDateTime::now_utc();
        let access_expiry = Duration::minutes(15);
        let refresh_expiry = Duration::days(7);
        
        let access_token = encode(
            &Header::default(),
            &Claims {
                sub: user_id.to_string(),
                exp: (now + access_expiry).unix_timestamp(),
                iat: now.unix_timestamp(),
                typ: "access".to_string(),
            },
            &EncodingKey::from_secret(self.jwt_secret.as_bytes()),
        ).map_err(|e| AuthError::Storage(e.to_string()))?;
        
        let refresh_token = encode(
            &Header::default(),
            &Claims {
                sub: user_id.to_string(),
                exp: (now + refresh_expiry).unix_timestamp(),
                iat: now.unix_timestamp(),
                typ: "refresh".to_string(),
            },
            &EncodingKey::from_secret(self.jwt_secret.as_bytes()),
        ).map_err(|e| AuthError::Storage(e.to_string()))?;
        
        let session = AuthSession {
            id: Uuid::new_v4().to_string(),
            user_id: user_id.to_string(),
            access_token: access_token.clone(),
            refresh_token: refresh_token.clone(),
            expires_at: now + refresh_expiry,
            created_at: now,
            last_used_at: None,
            ip_address: None,
            user_agent: None,
        };
        
        self.storage.create_session(&session).await?;
        
        Ok(AuthTokens {
            access_token,
            refresh_token,
            expires_in: access_expiry.whole_seconds(),
        })
    }
}

fn hash_password(password: &str) -> AuthResult<String> {
    let salt = SaltString::generate(&mut OsRng);
    let argon2 = Argon2::default();
    
    argon2.hash_password(password.as_bytes(), &salt)
        .map_err(|e| AuthError::Storage(e.to_string()))
        .map(|h| h.to_string())
}

fn verify_password(password: &str, hash: &str) -> AuthResult<bool> {
    let parsed_hash = PasswordHash::new(hash)
        .map_err(|e| AuthError::Storage(e.to_string()))?;
    
    let argon2 = Argon2::default();
    Ok(argon2.verify_password(password.as_bytes(), &parsed_hash).is_ok())
}
```

- [ ] **Step 4: 创建 service/mod.rs**

Create `crates/decacan-auth/src/service/mod.rs`:

```rust
pub mod auth;
pub use auth::{AuthService, AuthTokens};
```

- [ ] **Step 5: 编译检查**

Run: `cargo check -p decacan-auth`
Expected: SUCCESS

- [ ] **Step 6: 提交**

```bash
git add crates/decacan-auth/
git commit -m "feat(auth): add storage layer and auth service"
```

---

### Task 3: 创建 Authorization trait（auth 与 runtime 的接口）

**Files:**
- Create: `crates/decacan-auth/src/authz.rs`

- [ ] **Step 1: 定义 Authorization trait**

Create `crates/decacan-auth/src/authz.rs`:

```rust
use async_trait::async_trait;

use crate::entities::WorkspaceRole;
use crate::error::AuthResult;

/// 授权服务 trait - 供 decacan-runtime 调用
#[async_trait]
pub trait Authorization: Send + Sync {
    /// 验证 JWT token，返回 user_id
    async fn authenticate(&self,
        token: &str,
    ) -> AuthResult<String>;
    
    /// 检查用户在 Workspace 中的角色
    async fn check_workspace_role(
        &self,
        user_id: &str,
        workspace_id: &str,
    ) -> AuthResult<Option<WorkspaceRole>>;
    
    /// 检查用户是否有权限执行特定操作
    async fn check_permission(
        &self,
        user_id: &str,
        workspace_id: &str,
        permission: Permission,
    ) -> AuthResult<bool>;
}

/// 权限操作枚举
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Permission {
    ViewWorkspace,
    EditWorkspace,
    DeleteWorkspace,
    ManageMembers,
    CreatePlaybook,
    EditPlaybook,
    RunTask,
}

impl Permission {
    /// 返回执行此操作所需的最小角色
    pub fn required_role(&self) -> WorkspaceRole {
        match self {
            Self::ViewWorkspace => WorkspaceRole::Viewer,
            Self::CreatePlaybook |
            Self::EditPlaybook |
            Self::RunTask => WorkspaceRole::Editor,
            Self::EditWorkspace |
            Self::ManageMembers => WorkspaceRole::Admin,
            Self::DeleteWorkspace => WorkspaceRole::Owner,
        }
    }
}

/// Authorization 实现（供 runtime 使用）
pub struct AuthzService<S> {
    storage: std::sync::Arc<S>,
}

impl<S> AuthzService<S> {
    pub fn new(storage: std::sync::Arc<S>) -> Self {
        Self { storage }
    }
}
```

- [ ] **Step 2: 提交**

```bash
git add crates/decacan-auth/
git commit -m "feat(auth): add Authorization trait for runtime integration"
```

---

## Phase 2: 重构 decacan-runtime (Week 2-3)

### Task 4: 重构 Workspace 实体（tenant_id → owner_id）

**Files:**
- Modify: `crates/decacan-runtime/src/workspace/entity/workspace.rs`
- Modify: `crates/decacan-runtime/src/workspace/entity/membership.rs`

- [ ] **Step 1: 更新 Workspace 实体**

Read current file, then modify:

```rust
// 修改前：使用 tenant_id
pub struct Workspace {
    pub id: String,
    pub tenant_id: String,  // ❌ 需要移除
    pub slug: String,
    pub name: String,
    // ...
}

// 修改后：使用 owner_id + 成员系统
pub struct Workspace {
    pub id: String,
    pub owner_id: String,   // ✅ Workspace 所有者（User ID）
    pub slug: String,
    pub name: String,
    pub description: Option<String>,
    pub status: WorkspaceStatus,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
}
```

- [ ] **Step 2: 更新 Membership 实体**

Modify to link User ID:

```rust
pub struct WorkspaceMembership {
    pub id: String,
    pub workspace_id: String,
    pub user_id: String,           // 关联到 auth.User
    pub role: WorkspaceRole,       // Owner/Admin/Editor/Viewer
    pub invited_by: Option<String>,
    pub joined_at: OffsetDateTime,
}
```

- [ ] **Step 3: 编译检查**

Run: `cargo check -p decacan-runtime`
Fix any compilation errors

- [ ] **Step 4: 提交**

```bash
git add crates/decacan-runtime/
git commit -m "refactor(runtime): change workspace from tenant_id to owner_id model"
```

---

### Task 5: 重构 WorkspaceService 使用 Authorization trait

**Files:**
- Modify: `crates/decacan-runtime/src/workspace/service/workspace_service.rs`

- [ ] **Step 1: 注入 Authorization 依赖**

```rust
use decacan_auth::{Authorization, Permission};

pub struct WorkspaceService<A: Authorization> {
    storage: Arc<Mutex<HashMap<String, Workspace>>>,
    authz: Arc<A>,
}

impl<A: Authorization> WorkspaceService<A> {
    pub fn new(authz: Arc<A>) -> Self {
        Self {
            storage: Arc::new(Mutex::new(HashMap::new())),
            authz,
        }
    }
    
    pub async fn create_workspace(
        &self,
        user_id: &str,
        input: CreateWorkspaceInput,
    ) -> Result<Workspace, WorkspaceServiceError> {
        // 验证用户已认证
        // 创建 Workspace，设置 owner_id = user_id
        // 自动创建 Owner membership
    }
    
    pub async fn update_workspace(
        &self,
        user_id: &str,
        workspace_id: &str,
        updates: WorkspaceUpdates,
    ) -> Result<Workspace, WorkspaceServiceError> {
        // 调用 authz.check_permission 验证权限
        let has_permission = self.authz
            .check_permission(user_id, workspace_id, Permission::EditWorkspace)
            .await
            .map_err(|_| WorkspaceServiceError::Unauthorized)?;
        
        if !has_permission {
            return Err(WorkspaceServiceError::Unauthorized);
        }
        
        // 执行更新
    }
}
```

- [ ] **Step 2: 更新所有方法添加权限检查**

- [ ] **Step 3: 编译检查**

- [ ] **Step 4: 提交**

```bash
git commit -m "refactor(runtime): integrate Authorization trait into WorkspaceService"
```

---

## Phase 3: API 层集成 (Week 4)

### Task 6: 创建 HTTP API 端点和中间件

**Files:**
- Create: `crates/decacan-app/src/api/auth.rs`
- Create: `crates/decacan-app/src/middleware/auth.rs`
- Modify: `crates/decacan-app/src/app/wiring.rs`

- [ ] **Step 1: 创建认证中间件**

Create `crates/decacan-app/src/middleware/auth.rs`:

```rust
use axum::{
    extract::{Request, State},
    middleware::Next,
    response::IntoResponse,
    http::StatusCode,
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
    let auth_header = request
        .headers()
        .get("authorization")
        .and_then(|v| v.to_str().ok())
        .ok_or(StatusCode::UNAUTHORIZED)?;
    
    let token = auth_header
        .strip_prefix("Bearer ")
        .ok_or(StatusCode::UNAUTHORIZED)?;
    
    let user_id = state.auth_service
        .verify_token(token)
        .await
        .map_err(|_| StatusCode::UNAUTHORIZED)?;
    
    request.extensions_mut().insert(CurrentUser { user_id });
    Ok(next.run(request).await)
}
```

- [ ] **Step 2: 创建认证 API 端点**

Create `crates/decacan-app/src/api/auth.rs`:

```rust
use axum::{
    extract::State,
    routing::post,
    Json, Router,
};
use serde::{Deserialize, Serialize};

use crate::app::state::AppState;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/auth/register", post(register))
        .route("/auth/login", post(login))
}

#[derive(Deserialize)]
struct RegisterRequest {
    email: String,
    password: String,
    name: String,
}

#[derive(Serialize)]
struct AuthResponse {
    user_id: String,
    access_token: String,
}

async fn register(
    State(state): State<AppState>,
    Json(req): Json<RegisterRequest>,
) -> Result<Json<AuthResponse>, StatusCode> {
    let (user, tokens) = state.auth_service
        .register(&req.email, &req.password, &req.name)
        .await
        .map_err(|_| StatusCode::BAD_REQUEST)?;
    
    Ok(Json(AuthResponse {
        user_id: user.id,
        access_token: tokens.access_token,
    }))
}

async fn login(
    State(state): State<AppState>,
    Json(req): Json<LoginRequest>,
) -> Result<Json<AuthResponse>, StatusCode> {
    let (user, tokens) = state.auth_service
        .login(&req.email, &req.password)
        .await
        .map_err(|_| StatusCode::UNAUTHORIZED)?;
    
    Ok(Json(AuthResponse {
        user_id: user.id,
        access_token: tokens.access_token,
    }))
}
```

- [ ] **Step 3: 更新 AppState 和 wiring**

- [ ] **Step 4: 集成测试**

```bash
cargo test -p decacan-app
```

- [ ] **Step 5: 提交**

```bash
git commit -m "feat(api): add auth endpoints and middleware"
```

---

## 依赖检查

**decacan-auth/Cargo.toml:**
- [x] tokio
- [x] serde
- [x] time
- [x] uuid
- [x] async-trait
- [x] thiserror
- [x] argon2
- [x] jsonwebtoken
- [x] sqlx

**decacan-runtime/Cargo.toml:**
- [ ] decacan-auth (新增依赖)

**decacan-app/Cargo.toml:**
- [ ] decacan-auth (新增依赖)

---

## 成功标准

- [ ] decacan-auth crate 编译通过
- [ ] 用户注册/登录/Token 验证功能完整
- [ ] Authorization trait 正确定义
- [ ] Workspace 实体重构完成（tenant_id → owner_id）
- [ ] WorkspaceService 集成权限检查
- [ ] HTTP API 端点工作正常
- [ ] 中间件能正确验证 JWT
- [ ] 所有测试通过

---

**Plan Status:** Ready for execution (Updated for Architecture B)
**Estimated Time:** 3-4 weeks
**Architecture:** Workspace stays in runtime, auth is infrastructure layer
