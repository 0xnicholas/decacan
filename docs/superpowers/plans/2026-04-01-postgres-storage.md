# Storage PostgreSQL 系统实施计划

> **架构更新（2026-04-16）**：项目已全面迁移至 TypeScript/Node.js，后端核心位于 `packages/orchestrator`。本文档中的 Rust/crates 相关实现细节为历史记录，当前技术栈为 Hono + Drizzle ORM + Zod。


> **For agentic workers:** REQUIRED SUB-SKILL: Use @superpowers:subagent-driven-development (recommended) or @superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现 PostgreSQL 存储适配器，支持连接池、自动迁移（开发模式），实现 `StoragePort` trait

**架构：** 使用 `sqlx` crate（async PostgreSQL），实现 `StoragePort` 接口，开发模式自动运行 migrations，生产模式需要显式迁移。

**Tech Stack:** Rust, sqlx, tokio, PostgreSQL

---

## 文件结构映射

### 修改文件
- `crates/decacan-infra/Cargo.toml` - 添加 sqlx 依赖
- `crates/decacan-infra/src/storage/mod.rs` - 导出 postgres 模块
- `crates/decacan-infra/src/config/mod.rs` - 添加 PostgresConfig

### 新建文件
- `crates/decacan-infra/src/storage/postgres.rs` - PostgreSQL 实现
- `crates/decacan-infra/src/config/postgres.rs` - PostgreSQL 配置
- `crates/decacan-infra/migrations/001_init.sql` - 初始迁移
- `crates/decacan-infra/tests/postgres_test.rs` - PostgreSQL 测试

---

## Task 1: 添加 sqlx 依赖

**Files:**
- Modify: `crates/decacan-infra/Cargo.toml`

- [ ] **Step 1: 添加 PostgreSQL 依赖**

```toml
[dependencies]
decacan-runtime = { path = "../decacan-runtime" }
time = { version = "0.3", features = ["formatting", "parsing"] }
config = "0.14"
serde = { version = "1", features = ["derive"] }
serde_yaml = "0.9"
serde_json = "1"
once_cell = "1"
dotenvy = "0.15"
async-trait = "0.1"
tokio = { version = "1", features = ["sync", "rt", "macros"] }
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["json", "env-filter", "time"] }
tracing-appender = "0.2"

# PostgreSQL 新增
sqlx = { version = "0.8", features = ["runtime-tokio", "postgres", "migrate", "time"] }
```

- [ ] **Step 2: 运行 cargo check**

Run: `cd crates/decacan-infra && cargo check`
Expected: 编译成功（可能有警告）

- [ ] **Step 3: Commit**

```bash
git add crates/decacan-infra/Cargo.toml
git commit -m "deps(storage): add sqlx with PostgreSQL support"
```

---

## Task 2: 添加 PostgreSQL 配置

**Files:**
- Create: `crates/decacan-infra/src/config/postgres.rs`
- Modify: `crates/decacan-infra/src/config/mod.rs`
- Modify: `crates/decacan-infra/src/config/loader.rs`

- [ ] **Step 1: 创建 PostgreSQL 配置**

Create: `crates/decacan-infra/src/config/postgres.rs`

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct PostgresConfig {
    #[serde(default = "default_url")]
    pub url: String,
    #[serde(default = "default_max_connections")]
    pub max_connections: u32,
    #[serde(default)]
    pub auto_migrate: bool,
}

impl Default for PostgresConfig {
    fn default() -> Self {
        Self {
            url: default_url(),
            max_connections: default_max_connections(),
            auto_migrate: false,
        }
    }
}

impl PostgresConfig {
    pub fn for_development() -> Self {
        Self {
            url: default_url(),
            max_connections: 5,
            auto_migrate: true,
        }
    }

    pub fn for_production(url: impl Into<String>) -> Self {
        Self {
            url: url.into(),
            max_connections: 20,
            auto_migrate: false,
        }
    }
}

fn default_url() -> String {
    "postgres://postgres:postgres@localhost/decacan".to_string()
}

fn default_max_connections() -> u32 {
    10
}
```

- [ ] **Step 2: 更新 InfraConfig 包含 PostgreSQL**

Modify: `crates/decacan-infra/src/config/mod.rs`

```rust
pub mod loader;
pub mod postgres;
pub mod sources;

pub use loader::ConfigLoader;
pub use postgres::PostgresConfig;
pub use sources::{ConfigError, InfraConfig};

// 扩展 InfraConfig 以支持序列化
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Default, Deserialize, Serialize, PartialEq, Eq)]
pub struct InfraConfigFull {
    pub profile: String,
    pub postgres: PostgresConfig,
}
```

- [ ] **Step 3: 运行检查**

Run: `cd crates/decacan-infra && cargo check`
Expected: 编译成功

- [ ] **Step 4: Commit**

```bash
git add crates/decacan-infra/src/config/postgres.rs
git add crates/decacan-infra/src/config/mod.rs
git commit -m "feat(config): add PostgresConfig with auto_migrate support"
```

---

## Task 3: 创建数据库迁移

**Files:**
- Create: `crates/decacan-infra/migrations/001_init.sql`

- [ ] **Step 1: 创建迁移目录和文件**

Create: `crates/decacan-infra/migrations/001_init.sql`

```sql
-- 初始迁移：创建键值存储表
-- 用于实现 StoragePort

CREATE TABLE IF NOT EXISTS storage_kv (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 索引
CREATE INDEX IF NOT EXISTS idx_storage_kv_updated ON storage_kv(updated_at);
```

- [ ] **Step 2: Commit**

```bash
git add crates/decacan-infra/migrations/001_init.sql
git commit -m "chore(storage): add initial PostgreSQL migration for storage_kv table"
```

---

## Task 4: 实现 PostgresStorage

**Files:**
- Create: `crates/decacan-infra/src/storage/postgres.rs`
- Modify: `crates/decacan-infra/src/storage/mod.rs`

- [ ] **Step 1: 编写测试**

Create: `crates/decacan-infra/tests/postgres_test.rs`

```rust
#[cfg(test)]
mod tests {
    use decacan_infra::storage::postgres::PostgresStorage;
    use decacan_infra::config::PostgresConfig;

    // 注意：这些测试需要运行 PostgreSQL 实例
    // 使用 #[ignore] 标记，需要显式运行: cargo test -- --ignored

    #[tokio::test]
    #[ignore]
    async fn test_postgres_storage_put_and_get() {
        let config = PostgresConfig::for_development();
        let storage = PostgresStorage::new(&config).await.unwrap();

        // 测试 put
        storage.put("test_key", "test_value").await.unwrap();

        // 测试 get
        let value = storage.get("test_key").await.unwrap();
        assert_eq!(value, Some("test_value".to_string()));

        // 清理
        storage.delete("test_key").await.ok();
    }

    #[tokio::test]
    #[ignore]
    async fn test_postgres_storage_get_missing() {
        let config = PostgresConfig::for_development();
        let storage = PostgresStorage::new(&config).await.unwrap();

        let value = storage.get("non_existent_key").await.unwrap();
        assert_eq!(value, None);
    }
}
```

- [ ] **Step 2: 创建 PostgresStorage**

Create: `crates/decacan-infra/src/storage/postgres.rs`

```rust
use decacan_runtime::ports::storage::StoragePort;
use crate::config::PostgresConfig;
use sqlx::{Pool, Postgres, Row};
use std::error::Error;
use std::fmt;

pub struct PostgresStorage {
    pool: Pool<Postgres>,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum PostgresStorageError {
    ConnectionError(String),
    MigrationError(String),
    QueryError(String),
}

impl fmt::Display for PostgresStorageError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            PostgresStorageError::ConnectionError(msg) => {
                write!(f, "Database connection error: {}", msg)
            }
            PostgresStorageError::MigrationError(msg) => {
                write!(f, "Migration error: {}", msg)
            }
            PostgresStorageError::QueryError(msg) => {
                write!(f, "Query error: {}", msg)
            }
        }
    }
}

impl Error for PostgresStorageError {}

impl From<sqlx::Error> for PostgresStorageError {
    fn from(err: sqlx::Error) -> Self {
        PostgresStorageError::QueryError(err.to_string())
    }
}

impl PostgresStorage {
    pub async fn new(config: &PostgresConfig) -> Result<Self, PostgresStorageError> {
        // 创建连接池
        let pool = Pool::connect(&config.url)
            .await
            .map_err(|e| PostgresStorageError::ConnectionError(e.to_string()))?;

        let storage = Self { pool };

        // 开发模式：自动运行迁移
        if config.auto_migrate {
            storage.run_migrations().await?;
        }

        Ok(storage)
    }

    async fn run_migrations(&self,
    ) -> Result<(), PostgresStorageError> {
        // 手动运行迁移（不使用 sqlx migrate）
        let migration_sql = include_str!("../../migrations/001_init.sql");
        
        sqlx::query(migration_sql)
            .execute(&self.pool)
            .await
            .map_err(|e| PostgresStorageError::MigrationError(e.to_string()))?;

        Ok(())
    }

    /// 删除键（主要用于测试清理）
    pub async fn delete(&self,
        key: &str,
    ) -> Result<(), PostgresStorageError> {
        sqlx::query("DELETE FROM storage_kv WHERE key = $1")
            .bind(key)
            .execute(&self.pool)
            .await?;
        
        Ok(())
    }
}

#[async_trait::async_trait]
impl StoragePort for PostgresStorage {
    type Error = PostgresStorageError;

    async fn put(&self,
        key: &str,
        value: &str,
    ) -> Result<(), Self::Error> {
        sqlx::query(
            r#"
            INSERT INTO storage_kv (key, value, updated_at)
            VALUES ($1, $2, CURRENT_TIMESTAMP)
            ON CONFLICT (key)
            DO UPDATE SET value = $2, updated_at = CURRENT_TIMESTAMP
            "#
        )
        .bind(key)
        .bind(value)
        .execute(&self.pool)
        .await?;

        Ok(())
    }

    async fn get(&self,
        key: &str,
    ) -> Result<Option<String>, Self::Error> {
        let row = sqlx::query("SELECT value FROM storage_kv WHERE key = $1")
            .bind(key)
            .fetch_optional(&self.pool)
            .await?;

        match row {
            Some(row) => {
                let value: String = row.try_get("value")?;
                Ok(Some(value))
            }
            None => Ok(None),
        }
    }
}
```

- [ ] **Step 3: 更新 storage/mod.rs**

Modify: `crates/decacan-infra/src/storage/mod.rs`

```rust
pub mod memory;
pub mod postgres;
pub mod sqlite;

pub use memory::MemoryStorage;
pub use postgres::{PostgresStorage, PostgresStorageError};
pub use sqlite::SqliteStoragePlaceholder;
```

- [ ] **Step 4: 运行编译检查**

Run: `cd crates/decacan-infra && cargo check`
Expected: 编译成功

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-infra/src/storage/postgres.rs
git add crates/decacan-infra/src/storage/mod.rs
git add crates/decacan-infra/tests/postgres_test.rs
git commit -m "feat(storage): implement PostgresStorage with StoragePort trait"
```

---

## Task 5: 更新 Cargo.toml 添加 async-trait

**Files:**
- Modify: `crates/decacan-infra/Cargo.toml`

- [ ] **Step 1: 确保 async-trait 已添加**

检查 Cargo.toml 已有：
```toml
async-trait = "0.1"
```

- [ ] **Step 2: 在 postgres.rs 中使用 async-trait**

需要在 postgres.rs 顶部添加：

```rust
use async_trait::async_trait;

// ... 然后在 impl 块前
#[async_trait]
impl StoragePort for PostgresStorage {
    // ...
}
```

- [ ] **Step 3: 运行完整检查**

Run: `cd crates/decacan-infra && cargo check`
Expected: 编译成功

- [ ] **Step 4: Commit**

```bash
git add crates/decacan-infra/src/storage/postgres.rs
git commit -m "fix(storage): add async_trait attribute to StoragePort impl"
```

---

## Task 6: 添加配置示例

**Files:**
- Modify: `config/default.yaml`
- Modify: `config/dev.yaml`
- Modify: `.env.example`

- [ ] **Step 1: 添加 PostgreSQL 配置**

Modify: `config/default.yaml`

```yaml
# 默认配置
profile: dev

logging:
  level: info
  stdout: true
  file:
    enabled: false
    path: logs/decacan.log
    rotation: daily
    max_files: 7

postgres:
  url: postgres://postgres:postgres@localhost/decacan
  max_connections: 10
  auto_migrate: false
```

Modify: `config/dev.yaml`

```yaml
# 开发环境配置
profile: dev

logging:
  level: debug
  stdout: true
  file:
    enabled: true
    path: logs/decacan-dev.log
    rotation: daily
    max_files: 3

postgres:
  url: postgres://postgres:postgres@localhost/decacan_dev
  max_connections: 5
  auto_migrate: true
```

Modify: `.env.example`

```bash
# Decacan 环境变量示例
# 复制此文件为 .env 并填入实际值

# 应用配置
DECACAN_PROFILE=dev

# 数据库
DECACAN_DATABASE_URL=postgres://user:password@localhost/decacan

# PostgreSQL 完整 URL
DECACAN_POSTGRES_URL=postgres://postgres:postgres@localhost/decacan
DECACAN_POSTGRES_MAX_CONNECTIONS=10
DECACAN_POSTGRES_AUTO_MIGRATE=false

# API Keys (示例)
DECACAN_OPENAI_API_KEY=sk-...
DECACAN_ANTHROPIC_API_KEY=sk-ant-...

# JWT 密钥
DECACAN_JWT_SECRET=your-secret-key-here
```

- [ ] **Step 2: Commit**

```bash
git add config/default.yaml config/dev.yaml .env.example
git commit -m "chore(config): add PostgreSQL configuration examples"
```

---

## Task 7: 运行完整测试

**Files:**
- All

- [ ] **Step 1: 运行编译**

Run: `cd crates/decacan-infra && cargo build`
Expected: Build successful

- [ ] **Step 2: 运行单元测试（跳过集成测试）**

Run: `cd crates/decacan-infra && cargo test --lib`
Expected: 单元测试通过

- [ ] **Step 3: 验证迁移文件可加载**

Run: `cd crates/decacan-infra && cargo build --features "sqlx/runtime-tokio sqlx/postgres"`
Expected: Build successful, migration SQL included

- [ ] **Step 4: Final Commit**

```bash
git add -A
git commit -m "feat(storage): complete PostgreSQL storage implementation"
```

---

## 验收标准

- [ ] `PostgresStorage` 实现 `StoragePort` trait
- [ ] 支持 `put` 和 `get` 操作
- [ ] 连接池管理（通过 sqlx Pool）
- [ ] 开发模式自动迁移（`auto_migrate: true`）
- [ ] 迁移文件 `001_init.sql` 创建 `storage_kv` 表
- [ ] 配置文件包含 PostgreSQL 配置
- [ ] 测试标记为 `#[ignore]` 需要 PostgreSQL 实例
- [ ] 代码编译通过

---

## 使用示例

```rust
use decacan_infra::storage::PostgresStorage;
use decacan_infra::config::PostgresConfig;
use decacan_runtime::ports::storage::StoragePort;

#[tokio::main]
async fn main() {
    // 开发配置（自动迁移）
    let config = PostgresConfig::for_development();
    
    // 或生产配置
    // let config = PostgresConfig::for_production("postgres://...");
    
    let storage = PostgresStorage::new(&config).await.unwrap();
    
    // 使用 StoragePort
    storage.put("my_key", "my_value").await.unwrap();
    let value = storage.get("my_key").await.unwrap();
    
    println!("Value: {:?}", value);
}
```

---

## 测试说明

PostgreSQL 测试需要运行中的 PostgreSQL 实例。建议使用 Docker：

```bash
# 启动 PostgreSQL
docker run -d \
  --name decacan-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=decacan \
  -p 5432:5432 \
  postgres:15

# 运行测试
cargo test -- --ignored

# 停止 PostgreSQL
docker stop decacan-postgres
docker rm decacan-postgres
```

---

## 下一步

继续实施：
1. @superpowers:writing-plans - Models 多模型路由系统
