use super::sources::{ConfigError, InfraConfig};
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
