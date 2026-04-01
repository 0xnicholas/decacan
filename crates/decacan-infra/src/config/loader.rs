use super::sources::{ConfigError, InfraConfig};
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
