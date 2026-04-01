# Decacan Crates 问题修复计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 按优先级修复代码库中的关键问题，包括依赖冲突、重复类型定义、panic 风险和缺失的安全功能

**Architecture:** 通过统一 SQLite 版本、消除类型重复、添加速率限制和替换 panic 调用来提高代码质量和安全性

**Tech Stack:** Rust, Cargo, sqlx, rusqlite

---

## Phase 1: 关键依赖修复（阻塞构建）

### Task 1: 统一 SQLite 版本

**Problem:** `rusqlite 0.30` 使用 `libsqlite3-sys 0.27`，而 `sqlx 0.8` 需要 `libsqlite3-sys 0.28`，导致链接冲突

**Solution:** 将 `decacan-runtime` 从 `rusqlite` 迁移到 `sqlx 0.8`，统一整个工作空间的 SQLite 库

**Files:**
- Modify: `crates/decacan-runtime/Cargo.toml`
- Modify: `crates/decacan-auth/Cargo.toml`
- Create: `crates/decacan-runtime/src/storage/sqlite.rs`
- Delete: 旧 rusqlite 相关代码

---

#### Task 1.1: 更新 decacan-runtime 依赖

- [ ] **Step 1: 修改 Cargo.toml**

修改 `crates/decacan-runtime/Cargo.toml`:

```toml
[package]
name = "decacan-runtime"
version = "0.1.0"
edition = "2021"

[dependencies]
serde = { version = "1", features = ["derive"] }
serde_json = "1"
serde_yaml = "0.9"
time = { version = "0.3", features = ["serde", "formatting", "parsing"] }
uuid = { version = "1", features = ["serde", "v4"] }
# 移除 rusqlite，改用 sqlx
sqlx = { version = "0.8", features = ["runtime-tokio", "sqlite", "time", "uuid"] }
tokio = { version = "1", features = ["rt-multi-thread", "sync", "time"] }
thiserror = "1"
async-trait = "0.1"
once_cell = "1"
reqwest = { version = "0.11", features = ["json"] }
chrono = { version = "0.4", features = ["serde"] }

[dev-dependencies]
decacan-infra = { path = "../decacan-infra" }
tokio = { version = "1", features = ["rt-multi-thread", "sync", "macros"] }
tempfile = "3"
```

- [ ] **Step 2: 验证修改**

```bash
cd /Users/nicholasl/Documents/build-whatever/decacan
cargo check -p decacan-runtime 2>&1 | head -50
```

Expected: 依赖错误已解决，可能出现新的编译错误（需要更新源码）

- [ ] **Step 3: Commit**

```bash
git add crates/decacan-runtime/Cargo.toml
git commit -m "fix(deps): migrate runtime from rusqlite to sqlx 0.8

Unify SQLite library across workspace to resolve libsqlite3-sys version conflict"
```

---

#### Task 1.2: 更新 decacan-auth 依赖

- [ ] **Step 1: 修改 Cargo.toml**

修改 `crates/decacan-auth/Cargo.toml`:

```toml
[package]
name = "decacan-auth"
version = "0.1.0"
edition = "2021"

[dependencies]
decacan-runtime = { path = "../decacan-runtime" }
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
# Storage - 升级到 sqlx 0.8
sqlx = { version = "0.8", features = ["runtime-tokio", "sqlite", "time", "uuid"] }

[dev-dependencies]
tokio-test = "0.4"
```

- [ ] **Step 2: 验证修改**

```bash
cargo check -p decacan-auth 2>&1 | head -50
```

- [ ] **Step 3: Commit**

```bash
git add crates/decacan-auth/Cargo.toml
git commit -m "fix(deps): upgrade auth sqlx to 0.8 for workspace consistency"
```

---

#### Task 1.3: 迁移 runtime 存储层到 sqlx

- [ ] **Step 1: 查找需要迁移的 rusqlite 代码**

```bash
grep -r "rusqlite" /Users/nicholasl/Documents/build-whatever/decacan/crates/decacan-runtime/src/ --include="*.rs"
```

Expected: 列出所有使用 rusqlite 的文件

- [ ] **Step 2: 创建新的 SQLite 存储实现**

**Files to create/modify:**
- Create: `crates/decacan-runtime/src/storage/sqlite.rs`
- Modify: `crates/decacan-runtime/src/storage/mod.rs`

示例迁移代码:

```rust
// crates/decacan-runtime/src/storage/sqlite.rs
use sqlx::{sqlite::SqlitePoolOptions, Pool, Sqlite};
use async_trait::async_trait;

pub struct SqliteStorage {
    pool: Pool<Sqlite>,
}

impl SqliteStorage {
    pub async fn new(database_url: &str) -> Result<Self, StorageError> {
        let pool = SqlitePoolOptions::new()
            .max_connections(5)
            .connect(database_url)
            .await
            .map_err(|e| StorageError::Connection(e.to_string()))?;
        
        Ok(Self { pool })
    }
    
    pub async fn migrate(&self) -> Result<(), StorageError> {
        sqlx::migrate!("./migrations")
            .run(&self.pool)
            .await
            .map_err(|e| StorageError::Migration(e.to_string()))?;
        Ok(())
    }
}
```

- [ ] **Step 3: 运行测试**

```bash
cargo test -p decacan-runtime --lib 2>&1 | tail -50
```

Expected: 所有测试通过

- [ ] **Step 4: Commit**

```bash
git add crates/decacan-runtime/src/storage/
git commit -m "refactor(storage): migrate runtime storage from rusqlite to sqlx

Migrate SQLite storage implementation to use sqlx for workspace consistency"
```

---

### Task 2: 消除 WorkspaceRole 重复定义

**Problem:** `WorkspaceRole` 在 `decacan-auth/src/entities.rs` 和 `decacan-runtime/src/workspace/rbac/role.rs` 中重复定义，前者缺少 `Guest` 变体

**Solution:** 从 `decacan-auth` 中移除 `WorkspaceRole` 定义，统一使用 `decacan-runtime` 的版本

**Files:**
- Modify: `crates/decacan-auth/src/entities.rs`
- Modify: `crates/decacan-auth/src/lib.rs`
- Modify: `crates/decacan-auth/src/storage/mod.rs`
- Modify: `crates/decacan-auth/src/storage/sqlite.rs`

---

#### Task 2.1: 从 decacan-auth entities 移除 WorkspaceRole

- [ ] **Step 1: 修改 entities.rs**

修改 `crates/decacan-auth/src/entities.rs`:

```rust
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

// WorkspaceRole 已移除 - 使用 decacan_runtime::workspace::rbac::WorkspaceRole

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

- [ ] **Step 2: 更新 lib.rs 导出**

修改 `crates/decacan-auth/src/lib.rs`:

```rust
pub mod entities;
pub mod error;
pub mod service;
pub mod storage;
pub mod authz;

// 从 runtime 重新导出 WorkspaceRole
pub use decacan_runtime::workspace::rbac::WorkspaceRole;

// 保留本地实体的导出
pub use entities::{AuthProvider, AuthSession, OAuthState, User, UserStatus};
pub use error::{AuthError, AuthResult};
pub use service::auth::AuthService;
pub use storage::UserStorage;
pub use authz::{Authorization, Permission};
```

- [ ] **Step 3: 更新 storage 模块使用 runtime 的 WorkspaceRole**

修改 `crates/decacan-auth/src/storage/mod.rs`:

```rust
use crate::entities::{AuthSession, OAuthState, User};
use crate::error::AuthResult;
// 使用 runtime 的 WorkspaceRole
use decacan_runtime::workspace::rbac::WorkspaceRole;

#[async_trait::async_trait]
pub trait UserStorage: Send + Sync {
    // ... existing methods ...
    
    async fn create_membership(
        &self,
        user_id: &str,
        workspace_id: &str,
        role: WorkspaceRole,
    ) -> AuthResult<()>;
    
    async fn find_membership(
        &self,
        user_id: &str,
        workspace_id: &str,
    ) -> AuthResult<Option<WorkspaceRole>>;
    
    // ... other methods using WorkspaceRole ...
}
```

修改 `crates/decacan-auth/src/storage/sqlite.rs`:

```rust
use crate::entities::{AuthSession, OAuthState, User};
use crate::error::{AuthError, AuthResult};
// 使用 runtime 的 WorkspaceRole
use decacan_runtime::workspace::rbac::WorkspaceRole;

// 解析函数更新
fn parse_workspace_role(role_str: &str) -> Option<WorkspaceRole> {
    match role_str {
        "owner" => Some(WorkspaceRole::Owner),
        "admin" => Some(WorkspaceRole::Admin),
        "editor" => Some(WorkspaceRole::Editor),
        "viewer" => Some(WorkspaceRole::Viewer),
        "guest" => Some(WorkspaceRole::Guest),  // 现在支持 Guest
        _ => None,
    }
}

fn workspace_role_to_string(role: WorkspaceRole) -> &'static str {
    match role {
        WorkspaceRole::Owner => "owner",
        WorkspaceRole::Admin => "admin",
        WorkspaceRole::Editor => "editor",
        WorkspaceRole::Viewer => "viewer",
        WorkspaceRole::Guest => "guest",
    }
}
```

- [ ] **Step 4: 验证编译**

```bash
cargo check -p decacan-auth 2>&1 | head -50
```

Expected: 无错误

- [ ] **Step 5: 运行测试**

```bash
cargo test -p decacan-auth 2>&1 | tail -30
```

Expected: 所有测试通过

- [ ] **Step 6: Commit**

```bash
git add crates/decacan-auth/
git commit -m "refactor(auth): remove duplicate WorkspaceRole definition

Use decacan_runtime::workspace::rbac::WorkspaceRole consistently across auth crate
Fixes type mismatch and adds support for Guest role"
```

---

## Phase 2: 安全性和健壮性修复

### Task 3: 添加登录速率限制

**Problem:** 无速率限制，存在暴力破解风险

**Solution:** 在 AuthService 中添加基于内存的速率限制器

**Files:**
- Create: `crates/decacan-auth/src/rate_limit.rs`
- Modify: `crates/decacan-auth/src/lib.rs`
- Modify: `crates/decacan-auth/src/service/auth.rs`

---

#### Task 3.1: 实现速率限制器

- [ ] **Step 1: 创建 rate_limit.rs**

创建 `crates/decacan-auth/src/rate_limit.rs`:

```rust
//! 速率限制模块 - 防止暴力破解攻击

use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, Instant};

/// 登录尝试记录
#[derive(Debug, Clone)]
struct AttemptRecord {
    count: u32,
    first_attempt: Instant,
    last_attempt: Instant,
}

impl AttemptRecord {
    fn new() -> Self {
        let now = Instant::now();
        Self {
            count: 1,
            first_attempt: now,
            last_attempt: now,
        }
    }
    
    fn increment(&mut self) {
        self.count += 1;
        self.last_attempt = Instant::now();
    }
    
    fn is_expired(&self, window: Duration) -> bool {
        self.last_attempt.elapsed() > window
    }
    
    fn should_block(&self, max_attempts: u32, window: Duration) -> bool {
        self.count >= max_attempts && !self.is_expired(window)
    }
}

/// 基于内存的速率限制器
pub struct RateLimiter {
    attempts: Mutex<HashMap<String, AttemptRecord>>,
    max_attempts: u32,
    window: Duration,
}

impl RateLimiter {
    /// 创建新的速率限制器
    /// 
    /// # Arguments
    /// * `max_attempts` - 时间窗口内的最大尝试次数
    /// * `window` - 时间窗口时长
    pub fn new(max_attempts: u32, window: Duration) -> Self {
        Self {
            attempts: Mutex::new(HashMap::new()),
            max_attempts,
            window,
        }
    }
    
    /// 检查是否应该限制该标识符
    pub fn check(&self, identifier: &str) -> bool {
        let mut attempts = self.attempts.lock().unwrap();
        
        // 清理过期的记录
        let expired_keys: Vec<String> = attempts
            .iter()
            .filter(|(_, record)| record.is_expired(self.window))
            .map(|(key, _)| key.clone())
            .collect();
        
        for key in expired_keys {
            attempts.remove(&key);
        }
        
        // 检查是否应该阻止
        if let Some(record) = attempts.get(identifier) {
            !record.should_block(self.max_attempts, self.window)
        } else {
            true
        }
    }
    
    /// 记录一次尝试
    pub fn record_attempt(&self, identifier: &str) {
        let mut attempts = self.attempts.lock().unwrap();
        
        attempts
            .entry(identifier.to_string())
            .and_modify(|record| record.increment())
            .or_insert_with(AttemptRecord::new);
    }
    
    /// 成功登录后清除记录
    pub fn clear(&self, identifier: &str) {
        let mut attempts = self.attempts.lock().unwrap();
        attempts.remove(identifier);
    }
    
    /// 获取剩余尝试次数
    pub fn remaining_attempts(&self, identifier: &str) -> u32 {
        let attempts = self.attempts.lock().unwrap();
        
        if let Some(record) = attempts.get(identifier) {
            if record.is_expired(self.window) {
                self.max_attempts
            } else {
                self.max_attempts.saturating_sub(record.count)
            }
        } else {
            self.max_attempts
        }
    }
}

impl Default for RateLimiter {
    fn default() -> Self {
        // 默认配置：15分钟内最多5次尝试
        Self::new(5, Duration::from_secs(15 * 60))
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_rate_limiter_allows_within_limit() {
        let limiter = RateLimiter::new(3, Duration::from_secs(60));
        
        assert!(limiter.check("user1"));
        limiter.record_attempt("user1");
        assert!(limiter.check("user1"));
        limiter.record_attempt("user1");
        assert!(limiter.check("user1"));
    }
    
    #[test]
    fn test_rate_limiter_blocks_after_limit() {
        let limiter = RateLimiter::new(2, Duration::from_secs(60));
        
        limiter.record_attempt("user1");
        limiter.record_attempt("user1");
        
        assert!(!limiter.check("user1"));
    }
    
    #[test]
    fn test_rate_limiter_clears_on_success() {
        let limiter = RateLimiter::new(2, Duration::from_secs(60));
        
        limiter.record_attempt("user1");
        limiter.clear("user1");
        
        assert!(limiter.check("user1"));
    }
    
    #[test]
    fn test_remaining_attempts() {
        let limiter = RateLimiter::new(5, Duration::from_secs(60));
        
        assert_eq!(limiter.remaining_attempts("user1"), 5);
        limiter.record_attempt("user1");
        assert_eq!(limiter.remaining_attempts("user1"), 4);
    }
}
```

- [ ] **Step 2: 导出 rate_limit 模块**

修改 `crates/decacan-auth/src/lib.rs`:

```rust
pub mod entities;
pub mod error;
pub mod rate_limit;  // 新增
pub mod service;
pub mod storage;
pub mod authz;

// 从 runtime 重新导出 WorkspaceRole
pub use decacan_runtime::workspace::rbac::WorkspaceRole;

// 保留本地实体的导出
pub use entities::{AuthProvider, AuthSession, OAuthState, User, UserStatus};
pub use error::{AuthError, AuthResult};
pub use rate_limit::RateLimiter;  // 新增
pub use service::auth::AuthService;
pub use storage::UserStorage;
pub use authz::{Authorization, Permission};
```

- [ ] **Step 3: 在 AuthService 中集成速率限制**

修改 `crates/decacan-auth/src/service/auth.rs`:

```rust
use crate::entities::{User, UserStatus, AuthSession};
use crate::error::{AuthError, AuthResult};
use crate::rate_limit::RateLimiter;
use crate::storage::UserStorage;
use argon2::{Argon2, PasswordHash, PasswordVerifier};
use argon2::password_hash::SaltString;
use argon2::password_hash::rand_core::OsRng;
use jsonwebtoken::{decode, encode, DecodingKey, EncodingKey, Header, Validation};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use time::{Duration, OffsetDateTime};
use uuid::Uuid;

pub struct AuthService<S: UserStorage> {
    storage: Arc<S>,
    jwt_secret: String,
    rate_limiter: RateLimiter,  // 新增
}

impl<S: UserStorage> AuthService<S> {
    pub fn new(storage: Arc<S>, jwt_secret: String) -> Self {
        Self {
            storage,
            jwt_secret,
            rate_limiter: RateLimiter::default(),
        }
    }
    
    /// 创建带自定义速率限制配置的 AuthService
    pub fn with_rate_limiter(
        storage: Arc<S>,
        jwt_secret: String,
        rate_limiter: RateLimiter,
    ) -> Self {
        Self {
            storage,
            jwt_secret,
            rate_limiter,
        }
    }
    
    /// 用户登录（带速率限制）
    pub async fn login(
        &self,
        email: &str,
        password: &str,
        ip_address: Option<String>,
        user_agent: Option<String>,
    ) -> AuthResult<AuthSession> {
        // 检查速率限制
        if !self.rate_limiter.check(email) {
            return Err(AuthError::RateLimited);
        }
        
        // 查找用户
        let user = self.storage
            .find_user_by_email(email)
            .await?
            .ok_or(AuthError::InvalidCredentials)?;
        
        // 验证密码
        if let Some(ref hash) = user.password_hash {
            if !self.verify_password(password, hash).await? {
                self.rate_limiter.record_attempt(email);
                return Err(AuthError::InvalidCredentials);
            }
        } else {
            self.rate_limiter.record_attempt(email);
            return Err(AuthError::InvalidCredentials);
        }
        
        // 检查用户状态
        if user.status != UserStatus::Active {
            return Err(AuthError::UserSuspended);
        }
        
        // 清除速率限制记录（登录成功）
        self.rate_limiter.clear(email);
        
        // 创建会话
        let session = self.create_session(&user.id, ip_address, user_agent).await?;
        
        // 更新最后登录时间
        self.storage.update_last_login(&user.id).await?;
        
        Ok(session)
    }
    
    // ... 其他方法保持不变 ...
}
```

- [ ] **Step 4: 添加 RateLimited 错误变体**

修改 `crates/decacan-auth/src/error.rs`:

```rust
use thiserror::Error;

#[derive(Debug, Error, Clone)]
pub enum AuthError {
    #[error("invalid credentials")]
    InvalidCredentials,
    
    #[error("user not found")]
    UserNotFound,
    
    #[error("user already exists")]
    UserAlreadyExists,
    
    #[error("user suspended")]
    UserSuspended,
    
    #[error("invalid token")]
    InvalidToken,
    
    #[error("token expired")]
    TokenExpired,
    
    #[error("rate limited - too many attempts")]
    RateLimited,  // 新增
    
    #[error("validation error: {0}")]
    Validation(String),
    
    #[error("storage error: {0}")]
    Storage(String),
    
    #[error("internal error: {0}")]
    Internal(String),
}

pub type AuthResult<T> = Result<T, AuthError>;
```

- [ ] **Step 5: 运行测试**

```bash
cargo test -p decacan-auth 2>&1 | tail -40
```

Expected: 所有测试通过，包括新增的 rate_limiter 测试

- [ ] **Step 6: Commit**

```bash
git add crates/decacan-auth/
git commit -m "feat(auth): add rate limiting to prevent brute force attacks

Implement RateLimiter with configurable max attempts and time window
Integrate into login flow to block repeated failed attempts
Add RateLimited error variant for proper client feedback"
```

---

### Task 4: 修复 decacan-app 中的 panic 调用

**Problem:** 大量 `.expect()` 调用在 Mutex 锁中毒时会导致 panic

**Solution:** 将 `.expect()` 替换为适当的错误处理，使用 `Result` 传播

**Files:**
- Modify: `crates/decacan-app/src/app/state.rs` (主要文件)

---

#### Task 4.1: 分析并修复 state.rs 中的 panic

- [ ] **Step 1: 统计需要修复的 expect 调用**

```bash
grep -n "\.expect(" /Users/nicholasl/Documents/build-whatever/decacan/crates/decacan-app/src/app/state.rs | wc -l
```

Expected: 约 40-50 个需要修复

- [ ] **Step 2: 设计错误处理方案**

由于 `AppState` 是应用核心状态，需要考虑：
1. 有些 `.expect()` 在测试代码中，可以保持
2. 生产代码应该返回 `Result` 或使用 `unwrap_or_default()`
3. 锁中毒应该使用 `lock().unwrap_or_else(|e| e.into_inner())` 恢复

- [ ] **Step 3: 修改关键方法**

示例修复（部分关键方法）:

```rust
// 修改前
let mut lifecycle = self.lifecycle_playbooks.lock()
    .expect("playbook lifecycle lock should not be poisoned");

// 修改后 - 方法1: 使用 unwrap_or_else 恢复中毒锁
let mut lifecycle = match self.lifecycle_playbooks.lock() {
    Ok(guard) => guard,
    Err(poisoned) => poisoned.into_inner(),
};

// 或者修改后 - 方法2: 返回 Result（适用于可能失败的操作）
pub fn get_playbook_lifecycle(&self, id: &str) -> Result<Option<StoredLifecyclePlaybook>, AppError> {
    let lifecycle = match self.lifecycle_playbooks.lock() {
        Ok(guard) => guard,
        Err(poisoned) => poisoned.into_inner(),
    };
    Ok(lifecycle.get(id).cloned())
}
```

- [ ] **Step 4: 批量替换所有生产代码中的 expect**

使用 pattern:
```rust
// 替换前
.expect("... lock should not be poisoned")

// 替换后
// 如果是方法内部，使用 unwrap_or_else
.unwrap_or_else(|e| e.into_inner())
```

- [ ] **Step 5: 保持测试代码中的 expect**

测试代码中的 `.expect()` 可以保留，因为测试失败时应该立即 panic：
```rust
// 测试代码 - 保持不变
let workspace_id = self.create_workspace(CreateWorkspaceRequestDto { ... })
    .expect("Failed to create test workspace");
```

- [ ] **Step 6: 验证编译**

```bash
cargo check -p decacan-app 2>&1 | head -50
```

- [ ] **Step 7: 运行测试**

```bash
cargo test -p decacan-app 2>&1 | tail -50
```

Expected: 所有测试通过

- [ ] **Step 8: Commit**

```bash
git add crates/decacan-app/src/app/state.rs
git commit -m "fix(app): replace panic-prone expect calls with graceful error handling

Use unwrap_or_else with into_inner() to recover from poisoned mutexes
Prevents application crashes due to lock poisoning
Keep expect in test code where immediate failure is desired"
```

---

## Phase 3: 代码质量和一致性

### Task 5: 运行 cargo fmt 和 cargo clippy

**Problem:** 代码格式不一致，存在潜在问题

**Solution:** 运行格式化工具并修复警告

**Files:**
- All Rust files in the workspace

---

#### Task 5.1: 格式化代码

- [ ] **Step 1: 运行 cargo fmt**

```bash
cd /Users/nicholasl/Documents/build-whatever/decacan
cargo fmt --all
```

- [ ] **Step 2: 检查变更**

```bash
git diff --stat
```

Expected: 显示所有格式化的文件

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "style: apply cargo fmt to entire workspace

Consistent formatting across all crates"
```

---

#### Task 5.2: 运行 clippy

- [ ] **Step 1: 运行 clippy**

```bash
cargo clippy --workspace -- -D warnings 2>&1 | head -100
```

Expected: 显示所有警告和错误

- [ ] **Step 2: 修复高优先级警告**

逐个修复 clippy 警告，特别是：
- `unwrap_or_default` 代替 `unwrap_or(Vec::new())`
- `if let` 代替 `match` 单分支
- 未使用的导入
- 可推导的生命周期

- [ ] **Step 3: 验证修复**

```bash
cargo clippy --workspace -- -D warnings 2>&1 | tail -20
```

Expected: 无警告

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "refactor: fix clippy warnings across workspace

Fix common Rust anti-patterns and style issues"
```

---

## 验证清单

在所有修复完成后，运行以下验证：

```bash
# 1. 完整构建
cargo build --workspace 2>&1 | tail -20

# 2. 运行所有测试
cargo test --workspace 2>&1 | tail -50

# 3. 检查 clippy
cargo clippy --workspace -- -D warnings

# 4. 检查格式
cargo fmt --all -- --check
```

**Expected:** 全部通过

---

## 依赖关系图

```
Task 1.1 (runtime deps)
    ↓
Task 1.2 (auth deps)
    ↓
Task 1.3 (migrate storage) → 可以并行执行 Task 2
    ↓
Task 2 (WorkspaceRole)
    ↓
Task 3 (rate limit) → 可以并行执行 Task 4
    ↓
Task 4 (expect fixes)
    ↓
Task 5 (format & clippy)
```

**可并行执行的任务:**
- Task 1.3 (storage 迁移) 和 Task 2 (WorkspaceRole) 可以并行
- Task 3 (速率限制) 和 Task 4 (expect 修复) 可以并行
