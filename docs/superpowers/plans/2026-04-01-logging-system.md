# Logging 结构化日志系统实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use @superpowers:subagent-driven-development (recommended) or @superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建 JSON 结构化日志系统，支持 stdout 和文件输出，带日志轮转

**架构：** 使用 `tracing` 生态（tracing + tracing-subscriber），实现 JSON 格式订阅器，支持多级输出（stdout + file），文件按天轮转。

**Tech Stack:** Rust, tracing, tracing-subscriber, tracing-appender, serde_json

---

## 文件结构映射

### 修改文件
- `crates/decacan-infra/Cargo.toml` - 添加依赖
- `crates/decacan-infra/src/lib.rs` - 更新导出
- `crates/decacan-infra/src/logging/mod.rs` - 替换现有极简实现

### 新建文件
- `crates/decacan-infra/src/logging/config.rs` - 日志配置结构
- `crates/decacan-infra/src/logger.rs` - Logger 实现
- `crates/decacan-infra/src/logging/subscriber.rs` - tracing-subscriber 配置
- `crates/decacan-infra/tests/logging_test.rs` - 日志系统测试

---

## Task 1: 添加依赖

**Files:**
- Modify: `crates/decacan-infra/Cargo.toml`

- [ ] **Step 1: 添加日志相关依赖**

```toml
[dependencies]
decacan-runtime = { path = "../decacan-runtime" }
time = { version = "0.3", features = ["formatting", "parsing"] }
config = "0.14"
serde = { version = "1", features = ["derive"] }
serde_yaml = "0.9"
serde_json = "1"  # 新增
once_cell = "1"
dotenvy = "0.15"
async-trait = "0.1"
tokio = { version = "1", features = ["sync", "rt"] }

# 日志新增
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["json", "env-filter", "time"] }
tracing-appender = "0.2"
```

- [ ] **Step 2: 运行 cargo check 验证依赖**

Run: `cd crates/decacan-infra && cargo check`
Expected: 编译成功

- [ ] **Step 3: Commit**

```bash
git add crates/decacan-infra/Cargo.toml
git commit -m "deps(logging): add tracing, tracing-subscriber, tracing-appender"
```

---

## Task 2: 定义日志配置

**Files:**
- Create: `crates/decacan-infra/src/logging/config.rs`
- Modify: `crates/decacan-infra/src/logging/mod.rs`

- [ ] **Step 1: 编写配置测试**

Create: `crates/decacan-infra/tests/logging_test.rs`

```rust
#[cfg(test)]
mod config_tests {
    use decacan_infra::logging::LoggingConfig;

    #[test]
    fn test_default_config() {
        let config = LoggingConfig::default();
        assert_eq!(config.level, "info");
        assert!(config.stdout);
        assert!(!config.file.enabled);
    }

    #[test]
    fn test_config_from_yaml() {
        let yaml = r#"
level: debug
stdout: true
file:
  enabled: true
  path: logs/app.log
  rotation: daily
  max_files: 7
"#;
        let config: LoggingConfig = serde_yaml::from_str(yaml).unwrap();
        assert_eq!(config.level, "debug");
        assert!(config.file.enabled);
        assert_eq!(config.file.path, "logs/app.log");
    }
}
```

- [ ] **Step 2: 运行测试验证失败**

Run: `cd crates/decacan-infra && cargo test config_tests --test logging_test`
Expected: 编译失败

- [ ] **Step 3: 创建日志配置**

Create: `crates/decacan-infra/src/logging/config.rs`

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct LoggingConfig {
    #[serde(default = "default_level")]
    pub level: String,
    #[serde(default = "default_stdout")]
    pub stdout: bool,
    #[serde(default)]
    pub file: FileConfig,
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
pub struct FileConfig {
    #[serde(default)]
    pub enabled: bool,
    #[serde(default = "default_file_path")]
    pub path: String,
    #[serde(default = "default_rotation")]
    pub rotation: RotationConfig,
    #[serde(default = "default_max_files")]
    pub max_files: usize,
}

#[derive(Debug, Clone, Deserialize, Serialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum RotationConfig {
    Minutely,
    Hourly,
    Daily,
    Never,
}

impl Default for LoggingConfig {
    fn default() -> Self {
        Self {
            level: default_level(),
            stdout: default_stdout(),
            file: FileConfig::default(),
        }
    }
}

impl Default for FileConfig {
    fn default() -> Self {
        Self {
            enabled: false,
            path: default_file_path(),
            rotation: default_rotation(),
            max_files: default_max_files(),
        }
    }
}

fn default_level() -> String {
    "info".to_string()
}

fn default_stdout() -> bool {
    true
}

fn default_file_path() -> String {
    "logs/decacan.log".to_string()
}

fn default_rotation() -> RotationConfig {
    RotationConfig::Daily
}

fn default_max_files() -> usize {
    7
}
```

- [ ] **Step 4: 更新 logging/mod.rs**

Modify: `crates/decacan-infra/src/logging/mod.rs`

```rust
pub mod config;
pub mod subscriber;

pub use config::{FileConfig, LoggingConfig, RotationConfig};
pub use subscriber::init_logging;

// 保留向后兼容的简单配置
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct LoggingConfigLegacy {
    pub enabled: bool,
}

impl LoggingConfigLegacy {
    pub fn new(enabled: bool) -> Self {
        Self { enabled }
    }
}
```

- [ ] **Step 5: 运行测试**

Run: `cd crates/decacan-infra && cargo test config_tests --test logging_test`
Expected: 2 tests PASSED

- [ ] **Step 6: Commit**

```bash
git add crates/decacan-infra/src/logging/config.rs
git add crates/decacan-infra/src/logging/mod.rs
git add crates/decacan-infra/tests/logging_test.rs
git commit -m "feat(logging): add LoggingConfig with JSON/YAML support"
```

---

## Task 3: 实现 tracing-subscriber

**Files:**
- Create: `crates/decacan-infra/src/logging/subscriber.rs`

- [ ] **Step 1: 创建订阅者实现**

Create: `crates/decacan-infra/src/logging/subscriber.rs`

```rust
use super::config::{LoggingConfig, RotationConfig};
use std::io;
use tracing_appender::rolling::{RollingFileAppender, Rotation};
use tracing_subscriber::fmt::format::JsonFields;
use tracing_subscriber::fmt::Layer;
use tracing_subscriber::layer::SubscriberExt;
use tracing_subscriber::util::SubscriberInitExt;
use tracing_subscriber::EnvFilter;

/// 初始化日志系统
pub fn init_logging(config: &LoggingConfig) -> Result<(), LoggingInitError> {
    let env_filter = EnvFilter::try_from_default_env()
        .unwrap_or_else(|_| EnvFilter::new(&config.level));

    // 构建基础订阅者
    let subscriber = tracing_subscriber::registry().with(env_filter);

    // 添加 stdout 层
    let subscriber = if config.stdout {
        let stdout_layer = Layer::new()
            .with_writer(io::stdout)
            .with_ansi(true)
            .json()
            .with_flatten(true);
        subscriber.with(stdout_layer)
    } else {
        subscriber.with(None)
    };

    // 添加文件层
    if config.file.enabled {
        let rotation = match config.file.rotation {
            RotationConfig::Minutely => Rotation::MINUTELY,
            RotationConfig::Hourly => Rotation::HOURLY,
            RotationConfig::Daily => Rotation::DAILY,
            RotationConfig::Never => Rotation::NEVER,
        };

        let file_appender = RollingFileAppender::new(
            rotation,
            "logs",
            "decacan.log",
        );

        let file_layer = Layer::new()
            .with_writer(file_appender)
            .json()
            .with_flatten(true);

        subscriber.with(file_layer).try_init()?;
    } else {
        subscriber.try_init()?;
    }

    Ok(())
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum LoggingInitError {
    AlreadyInitialized,
    IoError(String),
}

impl std::fmt::Display for LoggingInitError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            LoggingInitError::AlreadyInitialized => {
                write!(f, "Logging subscriber already initialized")
            }
            LoggingInitError::IoError(msg) => write!(f, "IO error: {}", msg),
        }
    }
}

impl std::error::Error for LoggingInitError {}

impl From<std::io::Error> for LoggingInitError {
    fn from(err: std::io::Error) -> Self {
        LoggingInitError::IoError(err.to_string())
    }
}

impl From<tracing_subscriber::util::TryInitError> for LoggingInitError {
    fn from(_: tracing_subscriber::util::TryInitError) -> Self {
        LoggingInitError::AlreadyInitialized
    }
}
```

- [ ] **Step 2: 更新 mod.rs 导出**

Modify: `crates/decacan-infra/src/logging/mod.rs`

```rust
pub mod config;
pub mod subscriber;

pub use config::{FileConfig, LoggingConfig, RotationConfig};
pub use subscriber::{init_logging, LoggingInitError};

// 向后兼容
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct LoggingConfigLegacy {
    pub enabled: bool,
}

impl LoggingConfigLegacy {
    pub fn new(enabled: bool) -> Self {
        Self { enabled }
    }
}
```

- [ ] **Step 3: 编写集成测试**

Add to: `crates/decacan-infra/tests/logging_test.rs`

```rust
#[cfg(test)]
mod integration_tests {
    use decacan_infra::logging::{init_logging, LoggingConfig, FileConfig};

    #[test]
    fn test_init_logging_stdout_only() {
        let config = LoggingConfig {
            level: "info".to_string(),
            stdout: true,
            file: FileConfig {
                enabled: false,
                ..Default::default()
            },
        };

        // 注意：这会初始化全局订阅者，测试可能冲突
        // 实际测试中需要使用 #[serial] 或隔离测试
        let result = init_logging(&config);
        
        // 可能返回 AlreadyInitialized，这是正常的
        assert!(result.is_ok() || matches!(result, Err(decacan_infra::logging::LoggingInitError::AlreadyInitialized)));
    }
}
```

- [ ] **Step 4: 运行测试**

Run: `cd crates/decacan-infra && cargo test integration_tests --test logging_test`
Expected: 测试通过（可能有 AlreadyInitialized 错误，这是预期的）

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-infra/src/logging/subscriber.rs
git add crates/decacan-infra/src/logging/mod.rs
git add crates/decacan-infra/tests/logging_test.rs
git commit -m "feat(logging): implement tracing-subscriber with JSON output"
```

---

## Task 4: 添加日志宏和工具函数

**Files:**
- Create: `crates/decacan-infra/src/logging/macros.rs` (可选)
- Modify: `crates/decacan-infra/src/logging/mod.rs`

- [ ] **Step 1: 导出 tracing 宏**

在 mod.rs 中添加常用宏的重新导出：

Modify: `crates/decacan-infra/src/logging/mod.rs`

```rust
pub mod config;
pub mod subscriber;

pub use config::{FileConfig, LoggingConfig, RotationConfig};
pub use subscriber::{init_logging, LoggingInitError};

// 重新导出 tracing 宏
pub use tracing::{debug, error, info, trace, warn};

// 向后兼容
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct LoggingConfigLegacy {
    pub enabled: bool,
}

impl LoggingConfigLegacy {
    pub fn new(enabled: bool) -> Self {
        Self { enabled }
    }
}

/// 便捷函数：使用默认配置初始化日志
pub fn init_default_logging() {
    let config = LoggingConfig::default();
    let _ = init_logging(&config);
}

/// 便捷函数：从环境变量初始化日志
pub fn init_logging_from_env() {
    let config = LoggingConfig {
        level: std::env::var("RUST_LOG").unwrap_or_else(|_| "info".to_string()),
        ..Default::default()
    };
    let _ = init_logging(&config);
}
```

- [ ] **Step 2: 编写使用示例测试**

Add to: `crates/decacan-infra/tests/logging_test.rs`

```rust
#[cfg(test)]
mod usage_tests {
    use decacan_infra::logging::{info, debug, trace, warn, error};

    #[test]
    fn test_log_macros_available() {
        // 这些宏应该可以编译和使用
        // 注意：如果没有初始化订阅者，日志会静默丢弃
        trace!("trace message");
        debug!("debug message");
        info!("info message");
        warn!("warn message");
        error!("error message");
    }

    #[test]
    fn test_log_with_fields() {
        let user_id = "user-123";
        let action = "login";
        
        info!(%user_id, %action, "User performed action");
    }
}
```

- [ ] **Step 3: 运行测试**

Run: `cd crates/decacan-infra && cargo test usage_tests --test logging_test`
Expected: 测试通过

- [ ] **Step 4: Commit**

```bash
git add crates/decacan-infra/src/logging/mod.rs
git add crates/decacan-infra/tests/logging_test.rs
git commit -m "feat(logging): add convenience functions and re-export tracing macros"
```

---

## Task 5: 更新配置示例

**Files:**
- Modify: `config/default.yaml`
- Modify: `config/dev.yaml`

- [ ] **Step 1: 添加日志配置到 YAML**

Modify: `config/default.yaml`

```yaml
# 默认配置
profile: dev

# 日志配置
logging:
  level: info
  stdout: true
  file:
    enabled: false
    path: logs/decacan.log
    rotation: daily
    max_files: 7
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
```

- [ ] **Step 2: Commit**

```bash
git add config/default.yaml
git add config/dev.yaml
git commit -m "chore(config): add logging configuration to YAML files"
```

---

## Task 6: 运行完整测试

**Files:**
- All

- [ ] **Step 1: 运行所有测试**

Run: `cd crates/decacan-infra && cargo test`
Expected: All tests PASSED

- [ ] **Step 2: 验证 crate 构建**

Run: `cd crates/decacan-infra && cargo build`
Expected: Build successful

- [ ] **Step 3: 检查依赖树**

Run: `cd crates/decacan-infra && cargo tree | grep -E "(tracing|log)"`
Expected: 显示 tracing 相关依赖

- [ ] **Step 4: Final Commit**

```bash
git add -A
git commit -m "feat(logging): complete structured JSON logging system"
```

---

## 验收标准

- [ ] `LoggingConfig` 支持 YAML/JSON 序列化
- [ ] `init_logging()` 可以初始化 tracing-subscriber
- [ ] 支持 JSON 格式输出到 stdout
- [ ] 支持文件输出和按天轮转
- [ ] 宏 `info!`, `debug!`, `warn!`, `error!`, `trace!` 可用
- [ ] 配置文件包含日志配置示例
- [ ] 所有测试通过

---

## 使用示例

```rust
use decacan_infra::logging::{init_logging, LoggingConfig, info, debug};

#[tokio::main]
async fn main() {
    // 初始化日志
    let config = LoggingConfig::default();
    init_logging(&config).expect("Failed to initialize logging");

    // 使用日志宏
    info!("Application started");
    debug!(target: "db", "Connecting to database");
    
    // 带字段的日志
    let user_id = 42;
    info!(%user_id, action = "login", "User logged in");
}
```

输出示例：
```json
{"timestamp":"2026-04-01T10:30:00.123Z","level":"INFO","fields":{"message":"Application started"},"target":"my_app"}
{"timestamp":"2026-04-01T10:30:00.124Z","level":"DEBUG","fields":{"message":"Connecting to database"},"target":"db"}
{"timestamp":"2026-04-01T10:30:01.456Z","level":"INFO","fields":{"user_id":"42","action":"login","message":"User logged in"},"target":"my_app"}
```

---

## 下一步

继续实施：
1. @superpowers:writing-plans - Storage PostgreSQL 系统
2. @superpowers:writing-plans - Models 多模型路由系统
