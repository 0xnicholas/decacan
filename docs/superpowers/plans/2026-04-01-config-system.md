# Config 配置系统实施计划

> **架构更新（2026-04-16）**：项目已全面迁移至 TypeScript/Node.js，后端核心位于 `packages/orchestrator`。本文档中的 Rust/crates 相关实现细节为历史记录，当前技术栈为 Hono + Drizzle ORM + Zod。


> **For agentic workers:** REQUIRED SUB-SKILL: Use @superpowers:subagent-driven-development (recommended) or @superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建分层配置系统，支持 profiles、多来源配置（环境变量、YAML 文件），并与现有 InfraConfig 集成

**架构：** 使用 `config` crate 构建分层配置系统，支持 dev/staging/production profiles。配置来源按优先级加载：环境变量 > YAML 文件 > 默认值。

**Tech Stack:** Rust, config crate, serde, serde_yaml

---

## 文件结构映射

### 修改文件
- `crates/decacan-infra/Cargo.toml` - 添加依赖
- `crates/decacan-infra/src/lib.rs` - 导出新模块
- `crates/decacan-infra/src/config/mod.rs` - 扩展现有 InfraConfig

### 新建文件
- `crates/decacan-infra/src/config/loader.rs` - 配置加载逻辑
- `crates/decacan-infra/src/config/sources.rs` - 配置来源定义
- `crates/decacan-infra/tests/config_test.rs` - 配置系统测试
- `config/default.yaml` - 默认配置
- `config/dev.yaml` - 开发环境配置示例

---

## Task 1: 添加依赖

**Files:**
- Modify: `crates/decacan-infra/Cargo.toml`

- [ ] **Step 1: 添加配置相关依赖**

```toml
[dependencies]
decacan-runtime = { path = "../decacan-runtime" }
time = { version = "0.3", features = ["formatting", "parsing"] }

# 新增依赖
config = "0.14"
serde = { version = "1", features = ["derive"] }
serde_yaml = "0.9"
once_cell = "1"
```

- [ ] **Step 2: 运行 cargo check 验证依赖**

Run: `cd crates/decacan-infra && cargo check`
Expected: 编译成功（可能有未使用警告）

- [ ] **Step 3: Commit**

```bash
git add crates/decacan-infra/Cargo.toml
git commit -m "deps(config): add config, serde, serde_yaml dependencies"
```

---

## Task 2: 定义配置来源

**Files:**
- Create: `crates/decacan-infra/src/config/sources.rs`
- Modify: `crates/decacan-infra/src/config/mod.rs`

- [ ] **Step 1: 编写配置来源测试**

Create: `crates/decacan-infra/tests/config_test.rs`

```rust
#[cfg(test)]
mod tests {
    use decacan_infra::config::{InfraConfig, ConfigError};

    #[test]
    fn test_default_config_has_profile() {
        let config = InfraConfig::default();
        assert_eq!(config.profile, "dev");
    }

    #[test]
    fn test_config_from_yaml() {
        let yaml = r#"
profile: production
"#;
        let config: InfraConfig = serde_yaml::from_str(yaml).unwrap();
        assert_eq!(config.profile, "production");
    }
}
```

- [ ] **Step 2: 运行测试验证失败**

Run: `cd crates/decacan-infra && cargo test config --test config_test`
Expected: 编译失败（模块不存在）

- [ ] **Step 3: 创建配置来源模块**

Create: `crates/decacan-infra/src/config/sources.rs`

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct InfraConfig {
    pub profile: String,
}

impl Default for InfraConfig {
    fn default() -> Self {
        Self {
            profile: "dev".to_string(),
        }
    }
}

impl InfraConfig {
    pub fn new(profile: impl Into<String>) -> Self {
        Self {
            profile: profile.into(),
        }
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ConfigError {
    LoadError(String),
}

impl std::fmt::Display for ConfigError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            ConfigError::LoadError(msg) => write!(f, "Config load error: {}", msg),
        }
    }
}

impl std::error::Error for ConfigError {}
```

- [ ] **Step 4: 更新 mod.rs 导出**

Modify: `crates/decacan-infra/src/config/mod.rs`

```rust
pub mod sources;

pub use sources::{InfraConfig, ConfigError};
```

- [ ] **Step 5: 运行测试验证通过**

Run: `cd crates/decacan-infra && cargo test config --test config_test`
Expected: 2 tests PASSED

- [ ] **Step 6: Commit**

```bash
git add crates/decacan-infra/src/config/sources.rs
git add crates/decacan-infra/src/config/mod.rs
git add crates/decacan-infra/tests/config_test.rs
git commit -m "feat(config): add basic InfraConfig struct with tests"
```

---

## Task 3: 实现配置加载器

**Files:**
- Create: `crates/decacan-infra/src/config/loader.rs`
- Modify: `crates/decacan-infra/src/config/mod.rs`

- [ ] **Step 1: 编写配置加载器测试**

Add to: `crates/decacan-infra/tests/config_test.rs`

```rust
#[cfg(test)]
mod loader_tests {
    use decacan_infra::config::ConfigLoader;
    use std::env;

    #[test]
    fn test_load_from_default() {
        // 清除可能影响测试的环境变量
        env::remove_var("DECACAN_PROFILE");
        
        let loader = ConfigLoader::new();
        let config = loader.load().unwrap();
        
        assert_eq!(config.profile, "dev");
    }

    #[test]
    fn test_load_from_env() {
        env::set_var("DECACAN_PROFILE", "production");
        
        let loader = ConfigLoader::new();
        let config = loader.load().unwrap();
        
        assert_eq!(config.profile, "production");
        
        // 清理
        env::remove_var("DECACAN_PROFILE");
    }
}
```

- [ ] **Step 2: 运行测试验证失败**

Run: `cd crates/decacan-infra && cargo test loader_tests`
Expected: 编译失败（ConfigLoader 不存在）

- [ ] **Step 3: 创建配置加载器**

Create: `crates/decacan-infra/src/config/loader.rs`

```rust
use super::sources::{InfraConfig, ConfigError};
use std::env;

pub struct ConfigLoader {
    prefix: String,
}

impl ConfigLoader {
    pub fn new() -> Self {
        Self {
            prefix: "DECACAN".to_string(),
        }
    }

    pub fn with_prefix(prefix: impl Into<String>) -> Self {
        Self {
            prefix: prefix.into(),
        }
    }

    pub fn load(&self) -> Result<InfraConfig, ConfigError> {
        // 1. 从环境变量加载（最高优先级）
        if let Ok(profile) = env::var(format!("{}_PROFILE", self.prefix)) {
            return Ok(InfraConfig::new(profile));
        }

        // 2. 返回默认值
        Ok(InfraConfig::default())
    }
}

impl Default for ConfigLoader {
    fn default() -> Self {
        Self::new()
    }
}
```

- [ ] **Step 4: 更新 mod.rs 导出加载器**

Modify: `crates/decacan-infra/src/config/mod.rs`

```rust
pub mod loader;
pub mod sources;

pub use loader::ConfigLoader;
pub use sources::{InfraConfig, ConfigError};
```

- [ ] **Step 5: 运行测试验证通过**

Run: `cd crates/decacan-infra && cargo test loader_tests`
Expected: 2 tests PASSED

- [ ] **Step 6: Commit**

```bash
git add crates/decacan-infra/src/config/loader.rs
git add crates/decacan-infra/src/config/mod.rs
git add crates/decacan-infra/tests/config_test.rs
git commit -m "feat(config): add ConfigLoader with env var support"
```

---

## Task 4: 添加 YAML 文件支持

**Files:**
- Modify: `crates/decacan-infra/src/config/loader.rs`
- Create: `config/default.yaml`
- Create: `config/dev.yaml`

- [ ] **Step 1: 编写 YAML 加载测试**

Add to: `crates/decacan-infra/tests/config_test.rs`

```rust
#[cfg(test)]
mod yaml_tests {
    use decacan_infra::config::ConfigLoader;
    use std::fs;
    use std::path::Path;
    use tempfile::TempDir;

    #[test]
    fn test_load_from_yaml_file() {
        let temp_dir = TempDir::new().unwrap();
        let config_path = temp_dir.path().join("test.yaml");
        
        fs::write(&config_path, "profile: staging\n").unwrap();
        
        // 注意：这个测试演示功能，实际实现需要文件路径支持
        let content = fs::read_to_string(&config_path).unwrap();
        let config: decacan_infra::config::InfraConfig = serde_yaml::from_str(&content).unwrap();
        
        assert_eq!(config.profile, "staging");
    }
}
```

- [ ] **Step 2: 创建配置文件**

Create: `config/default.yaml`

```yaml
# 默认配置
profile: dev
```

Create: `config/dev.yaml`

```yaml
# 开发环境配置
profile: dev
```

- [ ] **Step 3: 扩展加载器支持文件**

Modify: `crates/decacan-infra/src/config/loader.rs`

```rust
use super::sources::{InfraConfig, ConfigError};
use std::env;
use std::path::Path;

pub struct ConfigLoader {
    prefix: String,
    config_dir: Option<String>,
}

impl ConfigLoader {
    pub fn new() -> Self {
        Self {
            prefix: "DECACAN".to_string(),
            config_dir: None,
        }
    }

    pub fn with_prefix(prefix: impl Into<String>) -> Self {
        Self {
            prefix: prefix.into(),
            config_dir: None,
        }
    }

    pub fn with_config_dir(mut self, dir: impl Into<String>) -> Self {
        self.config_dir = Some(dir.into());
        self
    }

    pub fn load(&self) -> Result<InfraConfig, ConfigError> {
        // 1. 从环境变量加载（最高优先级）
        if let Ok(profile) = env::var(format!("{}_PROFILE", self.prefix)) {
            return Ok(InfraConfig::new(profile));
        }

        // 2. 尝试从配置文件加载
        if let Some(config_dir) = &self.config_dir {
            let config_path = Path::new(config_dir).join("default.yaml");
            if config_path.exists() {
                let content = std::fs::read_to_string(&config_path)
                    .map_err(|e| ConfigError::LoadError(e.to_string()))?;
                let config: InfraConfig = serde_yaml::from_str(&content)
                    .map_err(|e| ConfigError::LoadError(e.to_string()))?;
                return Ok(config);
            }
        }

        // 3. 返回默认值
        Ok(InfraConfig::default())
    }
}

impl Default for ConfigLoader {
    fn default() -> Self {
        Self::new()
    }
}
```

- [ ] **Step 4: 更新测试以使用 tempfile**

Add to `crates/decacan-infra/Cargo.toml` dev-dependencies:

```toml
[dev-dependencies]
tempfile = "3"
```

- [ ] **Step 5: 运行测试**

Run: `cd crates/decacan-infra && cargo test yaml_tests`
Expected: 1 test PASSED

- [ ] **Step 6: Commit**

```bash
git add crates/decacan-infra/src/config/loader.rs
git add crates/decacan-infra/Cargo.toml
git add crates/decacan-infra/tests/config_test.rs
git add config/default.yaml
git add config/dev.yaml
git commit -m "feat(config): add YAML file configuration support"
```

---

## Task 5: 更新 lib.rs 导出

**Files:**
- Modify: `crates/decacan-infra/src/lib.rs`

- [ ] **Step 1: 更新 lib.rs 导出 config 模块**

Current:
```rust
pub mod clock;
pub mod config;
pub mod filesystem;
pub mod logging;
pub mod models;
pub mod storage;
```

No changes needed - config module is already exported.

- [ ] **Step 2: 运行完整测试**

Run: `cd crates/decacan-infra && cargo test`
Expected: All tests PASSED

- [ ] **Step 3: 验证 crate 可以构建**

Run: `cd crates/decacan-infra && cargo build`
Expected: Build successful

- [ ] **Step 4: Commit**

```bash
git add crates/decacan-infra/src/lib.rs
git commit -m "chore(config): verify config module exports"
```

---

## 验收标准

- [ ] `ConfigLoader` 可以从环境变量加载配置
- [ ] `ConfigLoader` 可以从 YAML 文件加载配置
- [ ] 环境变量优先级高于配置文件
- [ ] 所有测试通过
- [ ] `config/default.yaml` 和 `config/dev.yaml` 文件存在

---

## 下一步

Config 系统完成后，继续实施：
1. @superpowers:writing-plans - Secrets 密钥管理系统
2. @superpowers:writing-plans - Logging 结构化日志系统
3. @superpowers:writing-plans - Storage PostgreSQL 系统
4. @superpowers:writing-plans - Models 多模型路由系统
