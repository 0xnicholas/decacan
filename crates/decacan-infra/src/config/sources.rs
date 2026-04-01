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
