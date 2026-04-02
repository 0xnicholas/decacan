use super::budget::TokenBudget;
use super::retry::RetryConfig;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ModelRouterConfig {
    #[serde(default = "default_provider")]
    pub default_provider: String,
    #[serde(default)]
    pub fallback_chain: Vec<String>,
    #[serde(default)]
    pub providers: HashMap<String, ProviderConfig>,
    #[serde(default)]
    pub budget: TokenBudget,
}

#[derive(Debug, Clone, Deserialize, Serialize)]
pub struct ProviderConfig {
    pub api_key: String,
    #[serde(default = "default_base_url")]
    pub base_url: String,
    #[serde(default)]
    pub default_model: Option<String>,
    #[serde(default)]
    pub timeout_seconds: u64,
    #[serde(default)]
    pub retry_config: RetryConfig,
}

fn default_provider() -> String {
    "openai".to_string()
}

fn default_base_url() -> String {
    "".to_string()
}

impl Default for ModelRouterConfig {
    fn default() -> Self {
        Self {
            default_provider: default_provider(),
            fallback_chain: vec!["openai".to_string(), "anthropic".to_string()],
            providers: HashMap::new(),
            budget: TokenBudget::unlimited(),
        }
    }
}

impl ProviderConfig {
    /// 设置重试配置（链式调用）
    pub fn with_retry(mut self, retry_config: RetryConfig) -> Self {
        self.retry_config = retry_config;
        self
    }
}

impl ModelRouterConfig {
    /// 设置 Token 预算
    pub fn with_budget(mut self, budget: TokenBudget) -> Self {
        self.budget = budget;
        self
    }

    pub fn with_openai(mut self, api_key: impl Into<String>) -> Self {
        self.providers.insert(
            "openai".to_string(),
            ProviderConfig {
                api_key: api_key.into(),
                base_url: "https://api.openai.com/v1".to_string(),
                default_model: Some("gpt-4o".to_string()),
                timeout_seconds: 60,
                retry_config: RetryConfig::default(),
            },
        );
        self
    }

    pub fn with_anthropic(mut self, api_key: impl Into<String>) -> Self {
        self.providers.insert(
            "anthropic".to_string(),
            ProviderConfig {
                api_key: api_key.into(),
                base_url: "https://api.anthropic.com/v1".to_string(),
                default_model: Some("claude-3-5-sonnet-20241022".to_string()),
                timeout_seconds: 60,
                retry_config: RetryConfig::default(),
            },
        );
        self
    }
}
