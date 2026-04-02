use super::config::ProviderConfig;
use super::provider::{ModelProvider, ProviderError};
use super::retry::RetryConfig;
use super::types::{Message, ModelRequest, ModelResponse, Role, Usage};
use async_trait::async_trait;
use reqwest::Client;
use serde::{Deserialize, Serialize};

pub struct OpenAiProvider {
    config: ProviderConfig,
    retry_config: RetryConfig,
    client: Client,
}

impl OpenAiProvider {
    /// 创建新的 OpenAI Provider（可能失败）
    pub fn new(config: ProviderConfig) -> Result<Self, ProviderError> {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout_seconds))
            .build()
            .map_err(|e| ProviderError::NetworkError(format!("Failed to build HTTP client: {}", e)))?;

        let retry_config = config.retry_config;
        Ok(Self { config, retry_config, client })
    }

    fn to_openai_messages(&self, request: &ModelRequest) -> Vec<OpenAiMessage> {
        let mut messages = Vec::new();

        // 添加系统消息
        if let Some(system) = &request.system {
            messages.push(OpenAiMessage {
                role: "system".to_string(),
                content: system.clone(),
            });
        }

        // 添加对话消息
        for msg in &request.messages {
            let role = match msg.role {
                Role::System => "system",
                Role::User => "user",
                Role::Assistant => "assistant",
            };
            messages.push(OpenAiMessage {
                role: role.to_string(),
                content: msg.content.clone(),
            });
        }

        messages
    }

    async fn complete_internal(&self, request: ModelRequest) -> Result<ModelResponse, ProviderError> {
        let api_request = OpenAiApiRequest {
            model: request.model.clone(),
            messages: self.to_openai_messages(&request),
            temperature: request.temperature,
            max_tokens: request.max_tokens,
        };

        let response = self
            .client
            .post(format!("{}/chat/completions", self.config.base_url))
            .header("Authorization", format!("Bearer {}", self.config.api_key))
            .header("Content-Type", "application/json")
            .json(&api_request)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let text = response.text().await.unwrap_or_default();
            return Err(match status.as_u16() {
                401 | 403 => ProviderError::AuthenticationError(text),
                429 => ProviderError::RateLimitError(text),
                408 => ProviderError::TimeoutError(text),
                _ => ProviderError::ApiError(format!("HTTP {}: {}", status, text)),
            });
        }

        let api_response: OpenAiApiResponse = response.json().await?;

        let content = api_response
            .choices
            .first()
            .map(|c| c.message.content.clone())
            .unwrap_or_default();

        Ok(ModelResponse {
            content,
            model: request.model,
            usage: api_response.usage.map(|u| Usage {
                prompt_tokens: u.prompt_tokens,
                completion_tokens: u.completion_tokens,
                total_tokens: u.total_tokens,
            }),
        })
    }
}

#[async_trait]
impl ModelProvider for OpenAiProvider {
    fn name(&self) -> &str {
        "openai"
    }

    fn supported_models(&self) -> Vec<&str> {
        vec![
            // GPT-4o 系列（推荐）
            "gpt-4o",
            "gpt-4o-mini",
            "gpt-4o-latest",
            // GPT-4 系列
            "gpt-4",
            "gpt-4-turbo",
            "gpt-4-turbo-preview",
            // GPT-3.5 系列
            "gpt-3.5-turbo",
            "gpt-3.5-turbo-0125",
            // o1 系列（推理模型）
            "o1",
            "o1-mini",
            "o1-preview",
        ]
    }

    async fn complete(&self, request: ModelRequest) -> Result<ModelResponse, ProviderError> {
        self.retry_config.execute(|| self.complete_internal(request.clone())).await
    }
}

// OpenAI API 类型
#[derive(Debug, Serialize)]
struct OpenAiApiRequest {
    model: String,
    messages: Vec<OpenAiMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    temperature: Option<f32>,
    #[serde(skip_serializing_if = "Option::is_none")]
    max_tokens: Option<u32>,
}

#[derive(Debug, Serialize, Deserialize)]
struct OpenAiMessage {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct OpenAiApiResponse {
    choices: Vec<OpenAiChoice>,
    usage: Option<OpenAiUsage>,
}

#[derive(Debug, Deserialize)]
struct OpenAiChoice {
    message: OpenAiMessage,
}

#[derive(Debug, Deserialize)]
struct OpenAiUsage {
    prompt_tokens: u32,
    completion_tokens: u32,
    total_tokens: u32,
}
