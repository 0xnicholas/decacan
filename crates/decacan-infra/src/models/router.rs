use super::anthropic::AnthropicProvider;
use super::budget::{estimate_tokens, BudgetError, BudgetManager, TokenBudget};
use super::config::ModelRouterConfig;
use super::openai::OpenAiProvider;
use super::provider::{ModelProvider, ProviderError};
use super::types::{ModelRequest, ModelResponse};
use decacan_runtime::ports::model::ModelPort;
use std::collections::HashMap;
use std::future::Future;
use thiserror::Error;

pub struct ModelRouter {
    providers: HashMap<String, Box<dyn ModelProvider>>,
    default_provider: String,
    fallback_chain: Vec<String>,
    budget_manager: BudgetManager,
}

#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum RouterError {
    #[error("Provider not found: {0}")]
    ProviderNotFound(String),
    #[error("No providers available")]
    NoProviders,
    #[error("Provider error: {0}")]
    ProviderError(String),
    #[error("Budget error: {0}")]
    BudgetError(#[from] BudgetError),
}

impl From<ProviderError> for RouterError {
    fn from(err: ProviderError) -> Self {
        RouterError::ProviderError(err.to_string())
    }
}

impl ModelRouter {
    pub fn new(config: ModelRouterConfig) -> Result<Self, RouterError> {
        let mut providers: HashMap<String, Box<dyn ModelProvider>> = HashMap::new();

        // 初始化配置的提供商
        for (name, provider_config) in config.providers {
            let provider: Box<dyn ModelProvider> = match name.as_str() {
                "openai" => Box::new(OpenAiProvider::new(provider_config)
                    .map_err(|e| RouterError::ProviderError(e.to_string()))?),
                "anthropic" => Box::new(AnthropicProvider::new(provider_config)
                    .map_err(|e| RouterError::ProviderError(e.to_string()))?),
                _ => continue, // 未知提供商，跳过
            };
            providers.insert(name, provider);
        }

        if providers.is_empty() {
            return Err(RouterError::NoProviders);
        }

        // 初始化预算管理器
        let budget_manager = BudgetManager::new(config.budget);

        Ok(Self {
            providers,
            default_provider: config.default_provider,
            fallback_chain: config.fallback_chain,
            budget_manager,
        })
    }

    fn get_provider(&self, name: &str) -> Result<&Box<dyn ModelProvider>, RouterError> {
        self.providers
            .get(name)
            .ok_or_else(|| RouterError::ProviderNotFound(name.to_string()))
    }

    fn block_on<F, T>(&self, future: F) -> Result<T, RouterError>
    where
        F: Future<Output = Result<T, RouterError>> + Send,
        T: Send,
    {
        std::thread::scope(|scope| {
            scope
                .spawn(move || {
                    tokio::runtime::Builder::new_current_thread()
                        .enable_all()
                        .build()
                        .map_err(|error| {
                            RouterError::ProviderError(format!(
                                "Failed to create tokio runtime: {error}"
                            ))
                        })?
                        .block_on(future)
                })
                .join()
                .map_err(|_| {
                    RouterError::ProviderError("Model runtime worker thread panicked".to_string())
                })?
        })
    }

    async fn try_with_fallback(&self, request: ModelRequest) -> Result<ModelResponse, RouterError> {
        // 按 fallback 链顺序尝试
        for provider_name in &self.fallback_chain {
            if let Ok(provider) = self.get_provider(provider_name) {
                match provider.complete(request.clone()).await {
                    Ok(response) => return Ok(response),
                    Err(ProviderError::RateLimitError(_)) | Err(ProviderError::TimeoutError(_)) => {
                        // 可恢复错误，继续 fallback
                        continue;
                    }
                    Err(e) => return Err(e.into()),
                }
            }
        }

        Err(RouterError::ProviderError(
            "All providers failed".to_string(),
        ))
    }

    /// 使用特定模型执行请求
    pub async fn complete_with_model(
        &self,
        model: &str,
        prompt: &str,
    ) -> Result<String, RouterError> {
        // 检查预算
        let estimated_tokens = estimate_tokens(prompt);
        self.budget_manager.check_request(estimated_tokens)?;

        let request = ModelRequest::new(model, prompt);
        let response = self.try_with_fallback(request).await?;

        // 记录使用的 token
        self.budget_manager.record_usage(estimated_tokens);

        Ok(response.content)
    }

    /// 使用完整请求对象
    pub async fn complete_request(
        &self,
        request: ModelRequest,
    ) -> Result<ModelResponse, RouterError> {
        // 检查预算 - 计算所有消息中的 token 数
        let content: String = request
            .messages
            .iter()
            .map(|m| m.content.clone())
            .collect::<Vec<_>>()
            .join(" ");
        let estimated_tokens = estimate_tokens(&content);
        self.budget_manager.check_request(estimated_tokens)?;

        let response = self.try_with_fallback(request).await?;

        // 记录使用的 token
        self.budget_manager.record_usage(estimated_tokens);

        Ok(response)
    }

    /// 使用默认模型执行请求
    pub async fn complete(&self, prompt: &str) -> Result<String, RouterError> {
        // 检查预算
        let estimated_tokens = estimate_tokens(prompt);
        self.budget_manager.check_request(estimated_tokens)?;

        let request = ModelRequest::new(&self.default_provider, prompt);
        let response = self.try_with_fallback(request).await?;

        // 记录使用的 token
        self.budget_manager.record_usage(estimated_tokens);

        Ok(response.content)
    }

    /// 获取预算管理器（用于测试和监控）
    pub fn budget_manager(&self) -> &BudgetManager {
        &self.budget_manager
    }
}

#[async_trait::async_trait]
impl ModelPort for ModelRouter {
    type Error = RouterError;

    async fn complete(&self, prompt: &str) -> Result<String, Self::Error> {
        ModelRouter::complete(self, prompt).await
    }
}
