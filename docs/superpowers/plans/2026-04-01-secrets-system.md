# Secrets 密钥管理系统实施计划

> **架构更新（2026-04-16）**：项目已全面迁移至 TypeScript/Node.js，后端核心位于 `packages/orchestrator`。本文档中的 Rust/crates 相关实现细节为历史记录，当前技术栈为 Hono + Drizzle ORM + Zod。


> **For agentic workers:** REQUIRED SUB-SKILL: Use @superpowers:subagent-driven-development (recommended) or @superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **注意:** 本计划中的代码示例需要从 Rust 转换为 TypeScript 实现。核心逻辑和架构保持不变，仅变更语言实现。

**Goal:** 构建分层 Secrets 管理系统，支持环境变量、.env 文件，并为 HashiCorp Vault 预留接口

**架构：** 定义 `SecretsManager` 作为统一入口，支持多来源（Env > .env file > Vault），带内存缓存。TypeScript 接口定义使用 Zod 进行验证。

**Tech Stack:** TypeScript, dotenv, node-vault (optional), Zod

---

## 文件结构映射

### 修改文件
- `packages/orchestrator/package.json` - 添加依赖
- `packages/orchestrator/src/secrets/index.ts` - Secrets 模块入口

### 新建文件
- `packages/orchestrator/src/secrets/manager.ts` - SecretsManager 实现
- `packages/orchestrator/src/secrets/env-source.ts` - 环境变量来源
- `packages/orchestrator/src/secrets/vault-source.ts` - Vault 预留接口
- `packages/orchestrator/tests/secrets.test.ts` - Secrets 系统测试
- `.env.example` - 环境变量示例文件

---

## Task 1: 添加依赖

**Files:**
- Modify: `crates/decacan-infra/Cargo.toml`

- [ ] **Step 1: 添加 Secrets 相关依赖**

```toml
[dependencies]
decacan-runtime = { path = "../decacan-runtime" }
time = { version = "0.3", features = ["formatting", "parsing"] }
config = "0.14"
serde = { version = "1", features = ["derive"] }
serde_yaml = "0.9"
once_cell = "1"

# Secrets 新增
dotenvy = "0.15"
async-trait = "0.1"
tokio = { version = "1", features = ["sync"] }
```

- [ ] **Step 2: 运行 cargo check 验证依赖**

Run: `cd crates/decacan-infra && cargo check`
Expected: 编译成功

- [ ] **Step 3: Commit**

```bash
git add crates/decacan-infra/Cargo.toml
git commit -m "deps(secrets): add dotenvy, async-trait, tokio dependencies"
```

---

## Task 2: 定义 SecretsPort Trait

**Files:**
- Create: `crates/decacan-infra/src/secrets/mod.rs`
- Modify: `crates/decacan-infra/src/lib.rs`

- [ ] **Step 1: 编写 SecretsPort 测试**

Create: `crates/decacan-infra/tests/secrets_test.rs`

```rust
#[cfg(test)]
mod tests {
    use decacan_infra::secrets::{SecretsPort, SecretsError};
    use std::env;

    #[tokio::test]
    async fn test_secrets_port_get() {
        env::set_var("TEST_SECRET", "test_value");
        
        // 这里我们稍后会有具体实现
        // 现在只是定义测试接口
        
        env::remove_var("TEST_SECRET");
    }

    #[test]
    fn test_secrets_error_display() {
        let err = SecretsError::NotFound("API_KEY".to_string());
        assert!(err.to_string().contains("API_KEY"));
    }
}
```

- [ ] **Step 2: 运行测试验证失败**

Run: `cd crates/decacan-infra && cargo test secrets --test secrets_test`
Expected: 编译失败（模块不存在）

- [ ] **Step 3: 创建 SecretsPort trait 和错误类型**

Create: `crates/decacan-infra/src/secrets/mod.rs`

```rust
use async_trait::async_trait;
use std::fmt;

#[async_trait]
pub trait SecretsPort: Send + Sync {
    type Error: std::error::Error + Send + Sync;

    async fn get(&self, key: &str) -> Result<Option<String>, Self::Error>;

    async fn get_required(&self, key: &str) -> Result<String, Self::Error> {
        match self.get(key).await? {
            Some(value) => Ok(value),
            None => Err(Self::Error::from(SecretsError::NotFound(key.to_string()))),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum SecretsError {
    NotFound(String),
    LoadError(String),
    VaultError(String),
}

impl fmt::Display for SecretsError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            SecretsError::NotFound(key) => write!(f, "Secret not found: {}", key),
            SecretsError::LoadError(msg) => write!(f, "Failed to load secrets: {}", msg),
            SecretsError::VaultError(msg) => write!(f, "Vault error: {}", msg),
        }
    }
}

impl std::error::Error for SecretsError {}

impl From<SecretsError> for SecretsError {
    fn from(err: SecretsError) -> Self {
        err
    }
}
```

- [ ] **Step 4: 更新 lib.rs 导出**

Modify: `crates/decacan-infra/src/lib.rs`

```rust
pub mod clock;
pub mod config;
pub mod filesystem;
pub mod logging;
pub mod models;
pub mod secrets;  // 新增
pub mod storage;
```

- [ ] **Step 5: 运行测试验证编译**

Run: `cd crates/decacan-infra && cargo test secrets --test secrets_test`
Expected: 编译通过（测试可能失败因为无实现）

- [ ] **Step 6: Commit**

```bash
git add crates/decacan-infra/src/secrets/mod.rs
git add crates/decacan-infra/src/lib.rs
git add crates/decacan-infra/tests/secrets_test.rs
git commit -m "feat(secrets): define SecretsPort trait and SecretsError"
```

---

## Task 3: 实现环境变量来源

**Files:**
- Create: `crates/decacan-infra/src/secrets/env.rs`
- Modify: `crates/decacan-infra/src/secrets/mod.rs`

- [ ] **Step 1: 编写环境变量来源测试**

Add to: `crates/decacan-infra/tests/secrets_test.rs`

```rust
#[cfg(test)]
mod env_tests {
    use decacan_infra::secrets::{SecretsPort, env::EnvSecretsSource};
    use std::env;

    #[tokio::test]
    async fn test_env_source_get_existing() {
        env::set_var("MY_SECRET", "secret_value");
        
        let source = EnvSecretsSource::new();
        let result = source.get("MY_SECRET").await.unwrap();
        
        assert_eq!(result, Some("secret_value".to_string()));
        
        env::remove_var("MY_SECRET");
    }

    #[tokio::test]
    async fn test_env_source_get_missing() {
        env::remove_var("NON_EXISTENT_SECRET");
        
        let source = EnvSecretsSource::new();
        let result = source.get("NON_EXISTENT_SECRET").await.unwrap();
        
        assert_eq!(result, None);
    }

    #[tokio::test]
    async fn test_env_source_with_prefix() {
        env::set_var("DECACAN_API_KEY", "prefixed_value");
        
        let source = EnvSecretsSource::with_prefix("DECACAN");
        let result = source.get("API_KEY").await.unwrap();
        
        assert_eq!(result, Some("prefixed_value".to_string()));
        
        env::remove_var("DECACAN_API_KEY");
    }
}
```

- [ ] **Step 2: 运行测试验证失败**

Run: `cd crates/decacan-infra && cargo test env_tests`
Expected: 编译失败（EnvSecretsSource 不存在）

- [ ] **Step 3: 创建环境变量来源实现**

Create: `crates/decacan-infra/src/secrets/env.rs`

```rust
use super::{SecretsError, SecretsPort};
use async_trait::async_trait;
use std::env;

pub struct EnvSecretsSource {
    prefix: Option<String>,
}

impl EnvSecretsSource {
    pub fn new() -> Self {
        Self { prefix: None }
    }

    pub fn with_prefix(prefix: impl Into<String>) -> Self {
        Self {
            prefix: Some(prefix.into()),
        }
    }

    fn full_key(&self, key: &str) -> String {
        match &self.prefix {
            Some(prefix) => format!("{}_{}", prefix, key),
            None => key.to_string(),
        }
    }
}

impl Default for EnvSecretsSource {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl SecretsPort for EnvSecretsSource {
    type Error = SecretsError;

    async fn get(&self, key: &str) -> Result<Option<String>, Self::Error> {
        let full_key = self.full_key(key);
        Ok(env::var(&full_key).ok())
    }
}
```

- [ ] **Step 4: 更新 mod.rs 导出 env 模块**

Modify: `crates/decacan-infra/src/secrets/mod.rs`

```rust
pub mod env;
pub mod manager;
pub mod vault;

use async_trait::async_trait;
use std::fmt;

pub use env::EnvSecretsSource;

// ... rest of the code
```

- [ ] **Step 5: 运行测试验证通过**

Run: `cd crates/decacan-infra && cargo test env_tests`
Expected: 3 tests PASSED

- [ ] **Step 6: Commit**

```bash
git add crates/decacan-infra/src/secrets/env.rs
git add crates/decacan-infra/src/secrets/mod.rs
git add crates/decacan-infra/tests/secrets_test.rs
git commit -m "feat(secrets): implement EnvSecretsSource with prefix support"
```

---

## Task 4: 实现 .env 文件支持

**Files:**
- Modify: `crates/decacan-infra/src/secrets/env.rs`
- Create: `.env.example`

- [ ] **Step 1: 添加 .env 加载测试**

Add to: `crates/decacan-infra/tests/secrets_test.rs`

```rust
#[cfg(test)]
mod dotenv_tests {
    use decacan_infra::secrets::env::load_dotenv;
    use std::env;
    use std::fs;
    use tempfile::TempDir;

    #[test]
    fn test_load_dotenv_file() {
        let temp_dir = TempDir::new().unwrap();
        let env_path = temp_dir.path().join(".env");
        
        fs::write(&env_path, "DOTENV_TEST_KEY=dotenv_value\n").unwrap();
        
        // 确保变量不存在
        env::remove_var("DOTENV_TEST_KEY");
        
        // 加载 .env 文件
        load_dotenv(Some(&env_path)).unwrap();
        
        // 验证变量已加载
        assert_eq!(
            env::var("DOTENV_TEST_KEY").unwrap(),
            "dotenv_value"
        );
        
        // 清理
        env::remove_var("DOTENV_TEST_KEY");
    }
}
```

- [ ] **Step 2: 实现 .env 文件加载函数**

Modify: `crates/decacan-infra/src/secrets/env.rs`

```rust
use super::{SecretsError, SecretsPort};
use async_trait::async_trait;
use std::env;
use std::path::Path;

pub struct EnvSecretsSource {
    prefix: Option<String>,
}

impl EnvSecretsSource {
    pub fn new() -> Self {
        Self { prefix: None }
    }

    pub fn with_prefix(prefix: impl Into<String>) -> Self {
        Self {
            prefix: Some(prefix.into()),
        }
    }

    pub fn load_dotenv() -> Result<(), SecretsError> {
        Self::load_dotenv_at(None)
    }

    pub fn load_dotenv_at(path: Option<&Path>) -> Result<(), SecretsError> {
        match path {
            Some(p) => dotenvy::from_path(p)
                .map_err(|e| SecretsError::LoadError(e.to_string())),
            None => dotenvy::dotenv()
                .map(|_| ())
                .map_err(|e| SecretsError::LoadError(e.to_string())),
        }
    }

    fn full_key(&self, key: &str) -> String {
        match &self.prefix {
            Some(prefix) => format!("{}_{}", prefix, key),
            None => key.to_string(),
        }
    }
}

impl Default for EnvSecretsSource {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl SecretsPort for EnvSecretsSource {
    type Error = SecretsError;

    async fn get(&self, key: &str) -> Result<Option<String>, Self::Error> {
        let full_key = self.full_key(key);
        Ok(env::var(&full_key).ok())
    }
}

// 导出方便使用的函数
pub fn load_dotenv(path: Option<&Path>) -> Result<(), SecretsError> {
    EnvSecretsSource::load_dotenv_at(path)
}
```

- [ ] **Step 3: 创建 .env.example 文件**

Create: `.env.example`

```bash
# Decacan 环境变量示例
# 复制此文件为 .env 并填入实际值

# 应用配置
DECACAN_PROFILE=dev

# 数据库
DECACAN_DATABASE_URL=postgres://user:password@localhost/decacan

# API Keys (示例)
DECACAN_OPENAI_API_KEY=sk-...
DECACAN_ANTHROPIC_API_KEY=sk-ant-...

# JWT 密钥
DECACAN_JWT_SECRET=your-secret-key-here
```

- [ ] **Step 4: 运行测试验证**

Run: `cd crates/decacan-infra && cargo test dotenv_tests`
Expected: 1 test PASSED

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-infra/src/secrets/env.rs
git add crates/decacan-infra/tests/secrets_test.rs
git add .env.example
git commit -m "feat(secrets): add .env file support with load_dotenv function"
```

---

## Task 5: 实现 SecretsManager

**Files:**
- Create: `crates/decacan-infra/src/secrets/manager.rs`

- [ ] **Step 1: 编写 SecretsManager 测试**

Add to: `crates/decacan-infra/tests/secrets_test.rs`

```rust
#[cfg(test)]
mod manager_tests {
    use decacan_infra::secrets::{SecretsManager, SecretsPort};
    use std::env;

    #[tokio::test]
    async fn test_manager_get_from_env() {
        env::set_var("MANAGER_TEST_KEY", "manager_value");
        
        let manager = SecretsManager::new();
        let result = manager.get("MANAGER_TEST_KEY").await.unwrap();
        
        assert_eq!(result, Some("manager_value".to_string()));
        
        env::remove_var("MANAGER_TEST_KEY");
    }

    #[tokio::test]
    async fn test_manager_get_required_existing() {
        env::set_var("REQUIRED_KEY", "required_value");
        
        let manager = SecretsManager::new();
        let result = manager.get_required("REQUIRED_KEY").await.unwrap();
        
        assert_eq!(result, "required_value");
        
        env::remove_var("REQUIRED_KEY");
    }

    #[tokio::test]
    async fn test_manager_get_required_missing() {
        env::remove_var("MISSING_REQUIRED_KEY");
        
        let manager = SecretsManager::new();
        let result = manager.get_required("MISSING_REQUIRED_KEY").await;
        
        assert!(result.is_err());
    }
}
```

- [ ] **Step 2: 创建 SecretsManager**

Create: `crates/decacan-infra/src/secrets/manager.rs`

```rust
use super::{env::EnvSecretsSource, SecretsError, SecretsPort};
use async_trait::async_trait;
use std::collections::HashMap;
use std::sync::Arc;
use tokio::sync::RwLock;

pub struct SecretsManager {
    sources: Vec<Box<dyn SecretsPort<Error = SecretsError>>>,
    cache: Arc<RwLock<HashMap<String, String>>>,
}

impl SecretsManager {
    pub fn new() -> Self {
        let mut sources: Vec<Box<dyn SecretsPort<Error = SecretsError>>> = Vec::new();
        sources.push(Box::new(EnvSecretsSource::new()));

        Self {
            sources,
            cache: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub fn with_prefix(prefix: impl Into<String>) -> Self {
        let mut sources: Vec<Box<dyn SecretsPort<Error = SecretsError>>> = Vec::new();
        sources.push(Box::new(EnvSecretsSource::with_prefix(prefix)));

        Self {
            sources,
            cache: Arc::new(RwLock::new(HashMap::new())),
        }
    }

    pub fn add_source(&mut self, source: Box<dyn SecretsPort<Error = SecretsError>>) {
        self.sources.push(source);
    }

    async fn get_from_sources(&self,
        key: &str,
    ) -> Result<Option<String>, SecretsError> {
        // 1. 首先检查缓存
        {
            let cache = self.cache.read().await;
            if let Some(value) = cache.get(key) {
                return Ok(Some(value.clone()));
            }
        }

        // 2. 按顺序查询所有来源
        for source in &self.sources {
            if let Some(value) = source.get(key).await? {
                // 写入缓存
                let mut cache = self.cache.write().await;
                cache.insert(key.to_string(), value.clone());
                return Ok(Some(value));
            }
        }

        Ok(None)
    }
}

impl Default for SecretsManager {
    fn default() -> Self {
        Self::new()
    }
}

#[async_trait]
impl SecretsPort for SecretsManager {
    type Error = SecretsError;

    async fn get(&self, key: &str) -> Result<Option<String>, Self::Error> {
        self.get_from_sources(key).await
    }
}
```

- [ ] **Step 3: 更新 mod.rs 导出**

Modify: `crates/decacan-infra/src/secrets/mod.rs`

```rust
pub mod env;
pub mod manager;
pub mod vault;

use async_trait::async_trait;
use std::fmt;

pub use env::EnvSecretsSource;
pub use manager::SecretsManager;

// ... rest
```

- [ ] **Step 4: 运行测试**

Run: `cd crates/decacan-infra && cargo test manager_tests`
Expected: 3 tests PASSED

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-infra/src/secrets/manager.rs
git add crates/decacan-infra/src/secrets/mod.rs
git add crates/decacan-infra/tests/secrets_test.rs
git commit -m "feat(secrets): implement SecretsManager with caching"
```

---

## Task 6: 添加 Vault 预留接口

**Files:**
- Create: `crates/decacan-infra/src/secrets/vault.rs`

- [ ] **Step 1: 创建 Vault 预留接口**

Create: `crates/decacan-infra/src/secrets/vault.rs`

```rust
use super::{SecretsError, SecretsPort};
use async_trait::async_trait;

/// HashiCorp Vault 集成（预留接口，将来实现）
pub struct VaultSecretsSource {
    address: String,
    token: String,
    mount_path: String,
}

impl VaultSecretsSource {
    /// 创建新的 Vault 来源（预留，当前返回错误）
    pub fn new(
        _address: impl Into<String>,
        _token: impl Into<String>,
    ) -> Result<Self, SecretsError> {
        // 将来实现：验证连接和认证
        Ok(Self {
            address: _address.into(),
            token: _token.into(),
            mount_path: "secret".to_string(),
        })
    }

    pub fn with_mount_path(mut self, path: impl Into<String>) -> Self {
        self.mount_path = path.into();
        self
    }
}

#[async_trait]
impl SecretsPort for VaultSecretsSource {
    type Error = SecretsError;

    async fn get(&self,
        _key: &str,
    ) -> Result<Option<String>, Self::Error> {
        // 预留：将来实现 Vault API 调用
        Err(SecretsError::VaultError(
            "Vault integration not yet implemented".to_string(),
        ))
    }
}
```

- [ ] **Step 2: 更新 mod.rs**

Modify: `crates/decacan-infra/src/secrets/mod.rs`

```rust
pub mod env;
pub mod manager;
pub mod vault;

use async_trait::async_trait;
use std::fmt;

pub use env::EnvSecretsSource;
pub use manager::SecretsManager;
pub use vault::VaultSecretsSource;

// ... rest
```

- [ ] **Step 3: 运行完整测试**

Run: `cd crates/decacan-infra && cargo test`
Expected: All tests PASSED

- [ ] **Step 4: Commit**

```bash
git add crates/decacan-infra/src/secrets/vault.rs
git add crates/decacan-infra/src/secrets/mod.rs
git commit -m "feat(secrets): add Vault integration placeholder"
```

---

## 验收标准

- [ ] `SecretsPort` trait 定义完整，支持 async get/get_required
- [ ] `EnvSecretsSource` 可以从环境变量读取，支持前缀
- [ ] `.env` 文件加载功能可用
- [ ] `SecretsManager` 支持多来源和缓存
- [ ] `VaultSecretsSource` 接口已预留
- [ ] 所有测试通过
- [ ] `.env.example` 文件存在

---

## 使用示例

```rust
use decacan_infra::secrets::{SecretsManager, SecretsPort, load_dotenv};

#[tokio::main]
async fn main() {
    // 1. 加载 .env 文件（开发环境）
    load_dotenv(None).ok();

    // 2. 创建 SecretsManager
    let secrets = SecretsManager::with_prefix("DECACAN");

    // 3. 获取密钥
    let api_key = secrets.get("OPENAI_API_KEY").await.unwrap();
    let required = secrets.get_required("JWT_SECRET").await.unwrap();
}
```

---

## 下一步

继续实施：
1. @superpowers:writing-plans - Logging 结构化日志系统
2. @superpowers:writing-plans - Storage PostgreSQL 系统
3. @superpowers:writing-plans - Models 多模型路由系统
