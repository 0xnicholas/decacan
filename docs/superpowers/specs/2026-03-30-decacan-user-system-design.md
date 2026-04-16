# Decacan 用户系统设计文档

> **架构更新（2026-04-16）**：项目已全面迁移至 TypeScript/Node.js，后端核心位于 `packages/orchestrator`。本文档中的 Rust/crates 相关实现细节为历史记录，当前技术栈为 Hono + Drizzle ORM + Zod。


Date: 2026-03-30
Status: Draft
Related: 2026-03-30-decacan-playbook-workflow-refactor.md

## 1. 执行摘要

**目标：** 实现 Notion-like 的协作式用户系统，支持个人和团队使用

**核心特性：**
- 邮箱 + 社交登录（Google/GitHub）
- Workspace 资源完全隔离
- 细粒度权限（Owner/Admin/Editor/Viewer）
- 混合持久化（SQLite/PostgreSQL）

**范围：** 用户认证、Workspace 管理、成员权限、数据隔离

## 2. 背景与动机

### 当前现状
- `User` 实体已定义但无实际使用
- 无登录/注册 API
- 无持久化认证状态
- 资源（Playbook/Task）无归属概念

### 目标用户场景
1. **个人用户**：使用 Personal Workspace 管理自己的 Playbooks
2. **团队用户**：创建 Team Workspace，邀请成员协作
3. **多身份**：同一用户可在不同 Workspace 有不同角色

## 3. 架构设计

### 3.1 实体关系

```rust
// 用户实体（已有，扩展）
pub struct User {
    pub id: String,
    pub email: String,              // 唯一，登录凭证
    pub name: String,
    pub avatar_url: Option<String>,
    pub status: UserStatus,         // Active/Suspended/Deleted
    pub auth_provider: AuthProvider, // Email/Google/GitHub
    pub auth_provider_id: Option<String>, // OAuth 用户ID
    pub password_hash: Option<String>,    // 邮箱登录时必需
    pub email_verified_at: Option<OffsetDateTime>,
    pub created_at: OffsetDateTime,
    pub last_login_at: Option<OffsetDateTime>,
}

// Workspace 实体
pub struct Workspace {
    pub id: String,
    pub name: String,
    pub slug: String,               // URL-friendly 标识
    pub description: Option<String>,
    pub owner_id: String,           // 创建者
    pub workspace_type: WorkspaceType, // Personal/Team
    pub settings: WorkspaceSettings,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
}

// 成员关系（用户-Workspace 关联）
pub struct WorkspaceMembership {
    pub id: String,
    pub workspace_id: String,
    pub user_id: String,
    pub role: WorkspaceRole,        // Owner/Admin/Editor/Viewer
    pub invited_by: Option<String>, // 邀请人
    pub joined_at: OffsetDateTime,
}

// 认证会话
pub struct AuthSession {
    pub id: String,
    pub user_id: String,
    pub access_token: String,       // JWT
    pub refresh_token: String,      // 长期 Token
    pub expires_at: OffsetDateTime,
    pub created_at: OffsetDateTime,
    pub last_used_at: OffsetDateTime,
    pub ip_address: Option<String>,
    pub user_agent: Option<String>,
}

// OAuth 状态（防止 CSRF）
pub struct OAuthState {
    pub state: String,
    pub provider: AuthProvider,
    pub redirect_url: String,
    pub created_at: OffsetDateTime,
}
```

### 3.2 权限模型

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum WorkspaceRole {
    Owner,      // 完全控制，可删除 Workspace
    Admin,      // 管理成员和设置，不能删除
    Editor,     // 创建/编辑 Playbook 和 Task
    Viewer,     // 只读访问
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
    
    pub fn can_delete_workspace(&self) -> bool {
        matches!(self, Self::Owner)
    }
}
```

### 3.3 认证流程

#### 邮箱注册/登录

```
注册：
POST /api/auth/register
{ email, password, name }
→ 创建 User
→ 创建 Personal Workspace
→ 发送验证邮件（异步）
→ 返回 AuthSession

登录：
POST /api/auth/login
{ email, password }
→ 验证密码
→ 创建 AuthSession
→ 返回 tokens

Token 刷新：
POST /api/auth/refresh
{ refresh_token }
→ 验证 refresh_token
→ 发放新 access_token
→ 可选：轮换 refresh_token
```

#### OAuth 流程

**Step 1: 生成 State 并存储**
```
GET /api/auth/oauth/google/authorize?redirect_url=...
→ 生成随机 state 字符串 (32 bytes, base64url encoded)
→ 创建 OAuthState 记录：
   {
     state: "<random_string>",
     provider: Google,
     redirect_url: "<frontend_callback_url>",
     created_at: now()
   }
→ 存储到内存缓存 (10分钟过期) 或临时数据库表
→ 构建 OAuth URL 包含 state 参数
→ 返回 { auth_url, state }
```

**Step 2: 验证 State 并完成认证**
```
GET /api/auth/oauth/google/callback?code=...&state=...
→ 从请求中提取 state 参数
→ 从缓存/数据库查找 OAuthState 记录
→ 验证：
   - state 是否存在
   - state 是否过期 (创建时间 < 10分钟)
   - provider 是否匹配
→ 验证通过后删除 state 记录（一次性使用）
→ 用 code 换取 access_token
→ 获取用户信息
→ 查找或创建 User
→ 创建 AuthSession
→ 重定向回前端（带 token）
```

**State 存储方案：**
- **Phase 1**: 使用内存缓存 (DashMap) + TTL 10分钟
- **Phase 2**: 可选 Redis 或数据库表存储（支持多实例部署）

**安全要求：**
- State 值必须随机、不可预测
- State 必须一次性使用（验证后立即删除）
- 必须验证过期时间（防止重放攻击）
- 可选：绑定用户 IP 或 session

## 4. 存储设计

### 4.1 存储抽象层

```rust
#[async_trait]
pub trait UserStorage: Send + Sync {
    // 用户管理
    async fn create_user(&self, user: &User) -> Result<(), StorageError>;
    async fn find_user_by_id(&self, id: &str) -> Result<Option<User>, StorageError>;
    async fn find_user_by_email(&self, email: &str) -> Result<Option<User>, StorageError>;
    async fn find_user_by_oauth(&self, provider: AuthProvider, provider_id: &str) 
        -> Result<Option<User>, StorageError>;
    async fn update_user(&self, user: &User) -> Result<(), StorageError>;
    async fn update_last_login(&self, id: &str) -> Result<(), StorageError>;
    
    // Workspace 管理
    async fn create_workspace(&self, workspace: &Workspace) -> Result<(), StorageError>;
    async fn find_workspace_by_id(&self, id: &str) -> Result<Option<Workspace>, StorageError>;
    async fn find_workspace_by_slug(&self, slug: &str) -> Result<Option<Workspace>, StorageError>;
    async fn list_user_workspaces(&self, user_id: &str) -> Result<Vec<Workspace>, StorageError>;
    async fn update_workspace(&self, workspace: &Workspace) -> Result<(), StorageError>;
    async fn delete_workspace(&self, id: &str) -> Result<(), StorageError>;
    
    // 成员管理
    async fn create_membership(&self, membership: &WorkspaceMembership) -> Result<(), StorageError>;
    async fn find_membership(&self, workspace_id: &str, user_id: &str) 
        -> Result<Option<WorkspaceMembership>, StorageError>;
    async fn list_workspace_members(&self, workspace_id: &str) 
        -> Result<Vec<(User, WorkspaceMembership)>, StorageError>;
    async fn update_membership_role(&self, id: &str, role: WorkspaceRole) -> Result<(), StorageError>;
    async fn delete_membership(&self, id: &str) -> Result<(), StorageError>;
    
    // 会话管理
    async fn create_session(&self, session: &AuthSession) -> Result<(), StorageError>;
    async fn find_session_by_refresh_token(&self, token: &str) -> Result<Option<AuthSession>, StorageError>;
    async fn revoke_session(&self, id: &str) -> Result<(), StorageError>;
    async fn revoke_all_user_sessions(&self, user_id: &str) -> Result<(), StorageError>;
    
    // OAuth State 管理（Phase 1 可使用内存缓存实现）
    async fn create_oauth_state(&self, state: &OAuthState) -> Result<(), StorageError>;
    async fn find_oauth_state(&self, state: &str) -> Result<Option<OAuthState>, StorageError>;
    async fn delete_oauth_state(&self, state: &str) -> Result<(), StorageError>;
    async fn cleanup_expired_oauth_states(&self, before: OffsetDateTime) -> Result<u64, StorageError>;
}
```

### 4.2 SQLite 实现

```rust
pub struct SqliteUserStorage {
    pool: SqlitePool,
}

impl SqliteUserStorage {
    pub async fn new(database_url: &str) -> Result<Self, StorageError> {
        let pool = SqlitePool::connect(database_url).await?;
        Self::migrate(&pool).await?;
        Ok(Self { pool })
    }
    
    async fn migrate(pool: &SqlitePool) -> Result<(), StorageError> {
        sqlx::migrate!("./migrations").run(pool).await?;
        Ok(())
    }
}

#[async_trait]
impl UserStorage for SqliteUserStorage {
    async fn create_user(&self, user: &User) -> Result<(), StorageError> {
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
        .bind(&user.status)
        .bind(&user.auth_provider)
        .bind(&user.auth_provider_id)
        .bind(&user.password_hash)
        .bind(&user.email_verified_at)
        .bind(&user.created_at)
        .bind(&user.last_login_at)
        .execute(&self.pool)
        .await?;
        
        Ok(())
    }
    
    async fn find_user_by_email(&self, email: &str) -> Result<Option<User>, StorageError> {
        let user = sqlx::query_as::<_, User>(
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
        .await?;
        
        Ok(user)
    }
    
    async fn find_user_by_oauth(
        &self,
        provider: AuthProvider,
        provider_id: &str,
    ) -> Result<Option<User>, StorageError> {
        let user = sqlx::query_as::<_, User>(
            r#"
            SELECT id, email, name, avatar_url, status, auth_provider,
                   auth_provider_id, password_hash, email_verified_at,
                   created_at, last_login_at
            FROM users
            WHERE auth_provider = ?1 AND auth_provider_id = ?2
            "#
        )
        .bind(provider)
        .bind(provider_id)
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(user)
    }
    
    async fn create_workspace(&self, workspace: &Workspace) -> Result<(), StorageError> {
        sqlx::query(
            r#"
            INSERT INTO workspaces (id, name, slug, description, owner_id,
                                    workspace_type, settings, created_at, updated_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
            "#
        )
        .bind(&workspace.id)
        .bind(&workspace.name)
        .bind(&workspace.slug)
        .bind(&workspace.description)
        .bind(&workspace.owner_id)
        .bind(&workspace.workspace_type)
        .bind(&workspace.settings)
        .bind(&workspace.created_at)
        .bind(&workspace.updated_at)
        .execute(&self.pool)
        .await?;
        
        Ok(())
    }
    
    async fn find_workspace_by_slug(&self, slug: &str) -> Result<Option<Workspace>, StorageError> {
        let workspace = sqlx::query_as::<_, Workspace>(
            r#"
            SELECT id, name, slug, description, owner_id, workspace_type,
                   settings, created_at, updated_at
            FROM workspaces
            WHERE slug = ?1
            "#
        )
        .bind(slug)
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(workspace)
    }
    
    async fn create_session(&self, session: &AuthSession) -> Result<(), StorageError> {
        sqlx::query(
            r#"
            INSERT INTO auth_sessions (id, user_id, access_token, refresh_token,
                                       expires_at, created_at, last_used_at, ip_address, user_agent)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8, ?9)
            "#
        )
        .bind(&session.id)
        .bind(&session.user_id)
        .bind(&session.access_token)
        .bind(&session.refresh_token)
        .bind(&session.expires_at)
        .bind(&session.created_at)
        .bind(&session.last_used_at)
        .bind(&session.ip_address)
        .bind(&session.user_agent)
        .execute(&self.pool)
        .await?;
        
        Ok(())
    }
    
    async fn find_session_by_refresh_token(&self, token: &str) -> Result<Option<AuthSession>, StorageError> {
        let session = sqlx::query_as::<_, AuthSession>(
            r#"
            SELECT id, user_id, access_token, refresh_token, expires_at,
                   created_at, last_used_at, ip_address, user_agent
            FROM auth_sessions
            WHERE refresh_token = ?1
            "#
        )
        .bind(token)
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(session)
    }
}
```

### 4.3 PostgreSQL 实现

PostgreSQL 实现与 SQLite 实现结构相同，主要区别在于：

1. **连接池类型**：使用 `sqlx::PgPool` 替代 `SqlitePool`
2. **SQL 语法差异**：使用 `$1, $2` 占位符替代 `?1, ?2`
3. **类型映射**：某些类型的序列化方式略有不同

```rust
pub struct PostgresUserStorage {
    pool: PgPool,
}

impl PostgresUserStorage {
    pub async fn new(database_url: &str) -> Result<Self, StorageError> {
        let pool = PgPool::connect(database_url).await?;
        Self::migrate(&pool).await?;
        Ok(Self { pool })
    }
    
    async fn migrate(pool: &PgPool) -> Result<(), StorageError> {
        sqlx::migrate!("./migrations").run(pool).await?;
        Ok(())
    }
}

#[async_trait]
impl UserStorage for PostgresUserStorage {
    async fn create_user(&self, user: &User) -> Result<(), StorageError> {
        sqlx::query(
            r#"
            INSERT INTO users (id, email, name, avatar_url, status, auth_provider, 
                               auth_provider_id, password_hash, email_verified_at, 
                               created_at, last_login_at)
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
            ON CONFLICT (email) DO NOTHING
            "#
        )
        .bind(&user.id)
        .bind(&user.email)
        .bind(&user.name)
        .bind(&user.avatar_url)
        .bind(&user.status)
        .bind(&user.auth_provider)
        .bind(&user.auth_provider_id)
        .bind(&user.password_hash)
        .bind(&user.email_verified_at)
        .bind(&user.created_at)
        .bind(&user.last_login_at)
        .execute(&self.pool)
        .await?;
        
        Ok(())
    }
    
    // 其他方法与 SQLite 实现类似，仅占位符语法不同
    async fn find_user_by_email(&self, email: &str) -> Result<Option<User>, StorageError> {
        let user = sqlx::query_as::<_, User>(
            r#"
            SELECT id, email, name, avatar_url, status, auth_provider,
                   auth_provider_id, password_hash, email_verified_at,
                   created_at, last_login_at
            FROM users
            WHERE email = $1
            "#
        )
        .bind(email)
        .fetch_optional(&self.pool)
        .await?;
        
        Ok(user)
    }
    
    // ... 其他方法实现（与 SQLite 类似，使用 $n 占位符）
}
```

### 4.4 数据库 Schema

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
    settings TEXT NOT NULL DEFAULT '{}', -- JSON
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

-- OAuth State 表（Phase 1 可选，可使用内存缓存）
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

## 5. API 设计

### 5.1 认证相关

```rust
// POST /api/auth/register
#[derive(Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub password: String,
    pub name: String,
}

#[derive(Serialize)]
pub struct AuthResponse {
    pub user: UserDto,
    pub access_token: String,
    pub refresh_token: String,
    pub expires_in: i64,  // seconds
}

// POST /api/auth/login
#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

// POST /api/auth/oauth/google/authorize
#[derive(Deserialize)]
pub struct OAuthAuthorizeRequest {
    pub redirect_url: String,
}

#[derive(Serialize)]
pub struct OAuthAuthorizeResponse {
    pub auth_url: String,
    pub state: String,
}

// GET /api/auth/oauth/google/callback
// Query params: code, state
// Response: 302 Redirect to frontend with token in URL fragment/hash

// POST /api/auth/refresh
#[derive(Deserialize)]
pub struct RefreshRequest {
    pub refresh_token: String,
}

// DELETE /api/auth/logout
// Headers: Authorization: Bearer {access_token}
// Response: 204 No Content
```

### 5.2 用户相关

```rust
// GET /api/me
#[derive(Serialize)]
pub struct MeResponse {
    pub user: UserDto,
    pub workspaces: Vec<WorkspaceSummaryDto>,
}

// PUT /api/me
#[derive(Deserialize)]
pub struct UpdateProfileRequest {
    pub name: Option<String>,
    pub avatar_url: Option<String>,
}
```

### 5.3 Workspace 相关

```rust
// GET /api/workspaces
#[derive(Serialize)]
pub struct ListWorkspacesResponse {
    pub workspaces: Vec<WorkspaceDto>,
}

// POST /api/workspaces
#[derive(Deserialize)]
pub struct CreateWorkspaceRequest {
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
}

#[derive(Serialize)]
pub struct WorkspaceDto {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub description: Option<String>,
    pub owner_id: String,
    pub workspace_type: String,
    pub my_role: String,
    pub member_count: i32,
    pub created_at: String,
}

// GET /api/workspaces/:id
// Response: WorkspaceDto

// PUT /api/workspaces/:id
#[derive(Deserialize)]
pub struct UpdateWorkspaceRequest {
    pub name: Option<String>,
    pub description: Option<String>,
}

// DELETE /api/workspaces/:id
// 仅 Owner 可删除

// GET /api/workspaces/:id/members
#[derive(Serialize)]
pub struct ListMembersResponse {
    pub members: Vec<MemberDto>,
}

#[derive(Serialize)]
pub struct MemberDto {
    pub user: UserDto,
    pub role: String,
    pub joined_at: String,
}

// POST /api/workspaces/:id/members
#[derive(Deserialize)]
pub struct InviteMemberRequest {
    pub email: String,
    pub role: WorkspaceRole,
}

// PUT /api/workspaces/:id/members/:user_id/role
#[derive(Deserialize)]
pub struct UpdateRoleRequest {
    pub role: WorkspaceRole,
}

// DELETE /api/workspaces/:id/members/:user_id
```

## 6. 安全考虑

### 6.1 密码安全
- 使用 bcrypt/argon2 哈希密码
- 最小密码强度要求（8位，包含大小写和数字）
- 密码重置 Token 15分钟过期

### 6.2 JWT 安全
- Access Token：15分钟过期
- Refresh Token：7天过期，可撤销
- 使用 HS256 或 RS256 签名
- Token 绑定 IP/User-Agent（可选）

### 6.3 OAuth 安全
- State 参数防止 CSRF
- PKCE 流程（移动端必需）
- 仅接受预配置的 redirect URLs

### 6.4 速率限制
- 登录/注册：每 IP 每分钟 5 次
- 密码重置：每邮箱每天 3 次

## 7. 错误处理

```rust
#[derive(Debug, thiserror::Error)]
pub enum AuthError {
    #[error("invalid credentials")]
    InvalidCredentials,
    #[error("email already exists")]
    EmailAlreadyExists,
    #[error("email not verified")]
    EmailNotVerified,
    #[error("invalid token")]
    InvalidToken,
    #[error("token expired")]
    TokenExpired,
    #[error("workspace not found")]
    WorkspaceNotFound,
    #[error("workspace slug already exists")]
    WorkspaceSlugExists,
    #[error("insufficient permissions")]
    InsufficientPermissions,
    #[error("user already in workspace")]
    UserAlreadyInWorkspace,
    #[error("cannot remove owner")]
    CannotRemoveOwner,
    #[error(transparent)]
    Storage(#[from] StorageError),
}

impl IntoResponse for AuthError {
    fn into_response(self) -> Response {
        let (status, error_code) = match &self {
            Self::InvalidCredentials => (StatusCode::UNAUTHORIZED, "invalid_credentials"),
            Self::EmailAlreadyExists => (StatusCode::CONFLICT, "email_already_exists"),
            Self::WorkspaceSlugExists => (StatusCode::CONFLICT, "workspace_slug_exists"),
            Self::InsufficientPermissions => (StatusCode::FORBIDDEN, "insufficient_permissions"),
            _ => (StatusCode::BAD_REQUEST, "auth_error"),
        };
        
        let body = json!({
            "error": error_code,
            "message": self.to_string()
        });
        
        (status, body).into_response()
    }
}
```

## 8. 中间件

### 8.1 认证中间件

```rust
pub async fn auth_middleware<B>(
    State(state): State<AppState>,
    mut request: Request<B>,
    next: Next<B>,
) -> Result<Response, AuthError> {
    let token = extract_bearer_token(&request)?;
    let claims = verify_jwt(&token)?;
    let user = state.storage.find_user_by_id(&claims.sub).await?
        .ok_or(AuthError::InvalidToken)?;
    
    request.extensions_mut().insert(user);
    Ok(next.run(request).await)
}

pub async fn require_workspace_access<B>(
    State(state): State<AppState>,
    Path(workspace_id): Path<String>,
    Extension(user): Extension<User>,
    mut request: Request<B>,
    next: Next<B>,
) -> Result<Response, AuthError> {
    let membership = state.storage
        .find_membership(&workspace_id, &user.id)
        .await?
        .ok_or(AuthError::InsufficientPermissions)?;
    
    request.extensions_mut().insert(membership);
    Ok(next.run(request).await)
}
```

## 9. 依赖

```toml
[dependencies]
# 基础
axum = { version = "0.7", features = ["json", "http1", "tokio"] }
tokio = { version = "1", features = ["macros", "rt-multi-thread", "sync", "time"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
time = { version = "0.3", features = ["serde", "formatting", "parsing"] }

# 认证
jsonwebtoken = "9"
argon2 = "0.5"
rand = "0.8"

# OAuth
reqwest = { version = "0.12", features = ["json"] }

# 存储
sqlx = { version = "0.7", features = ["runtime-tokio", "sqlite", "postgres", "time", "uuid"] }

# 验证
validator = { version = "0.18", features = ["derive"] }

# 错误处理
thiserror = "1"
```

## 10. 实施计划

### Phase 1: 基础设施（Week 1）
- [ ] 创建 `decacan-auth` crate
- [ ] 实现存储抽象层
- [ ] SQLite 存储实现
- [ ] 数据库迁移脚本

### Phase 2: 认证系统（Week 2）
- [ ] 用户注册/登录 API
- [ ] JWT 生成/验证
- [ ] 密码哈希
- [ ] OAuth Google 集成

### Phase 3: Workspace 系统（Week 3）
- [ ] Workspace CRUD API
- [ ] 成员管理 API
- [ ] 权限检查
- [ ] 中间件

### Phase 4: 集成与测试（Week 4）
- [ ] 与现有系统集成（资源归属）
- [ ] 前端适配
- [ ] 测试覆盖
- [ ] 文档

## 11. 与现有系统集成

### 11.1 Playbook/Task 归属

```rust
// 修改现有实体
pub struct Playbook {
    pub id: String,
    pub workspace_id: String,  // 新增
    pub created_by: String,     // 新增
    // ... 其他字段
}

pub struct Task {
    pub id: String,
    pub workspace_id: String,  // 已有，确保关联正确
    pub created_by: String,     // 新增
    // ... 其他字段
}
```

### 11.2 API 权限检查

```rust
// 在创建 Task 时检查权限
pub async fn create_task(
    State(state): State<AppState>,
    Extension(user): Extension<User>,
    Extension(membership): Extension<WorkspaceMembership>,
    Json(request): Json<CreateTaskRequest>,
) -> Result<impl IntoResponse, AuthError> {
    if !membership.role.can_run_tasks() {
        return Err(AuthError::InsufficientPermissions);
    }
    // ... 创建逻辑
}
```

## 12. 非目标

- 邮件发送服务（Phase 1 跳过邮箱验证，后续添加）
- GitHub OAuth（先做 Google，后续添加）
- 高级安全特性（2FA、SSO 等后续添加）
- 审计日志（后续添加）

## 13. 成功标准

- [ ] 用户可以注册/登录/登出
- [ ] 用户可以创建多个 Workspace
- [ ] 用户可以邀请其他用户加入 Workspace
- [ ] 权限控制正常工作
- [ ] 资源按 Workspace 隔离
- [ ] 所有现有功能不受影响

---

**文档状态：** ✅ Draft Complete  
**下一步：** Review & Approval → Implementation Planning
