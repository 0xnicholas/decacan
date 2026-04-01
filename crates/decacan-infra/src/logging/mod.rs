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
