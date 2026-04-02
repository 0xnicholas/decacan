use super::config::ProviderConfig;
use super::provider::{ModelProvider, ProviderError};
use super::types::{Message, ModelRequest, ModelResponse, Role, Usage};
use async_trait::async_trait;
use reqwest::Client;
use serde::{Deserialize, Serialize};

pub struct AnthropicProvider {
    config: ProviderConfig,
    client: Client,
}

impl AnthropicProvider {
    /// 创建新的 Anthropic Provider（可能失败）
    pub fn new(config: ProviderConfig) -> Result<Self, ProviderError> {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout_seconds))
            .build()
            .map_err(|e| ProviderError::NetworkError(format!("Failed to build HTTP client: {}", e)))?;

        Ok(Self { config, client })
    }

    fn to_anthropic_messages(
        &self,
        request: &ModelRequest,
    ) -> (Option<String>, Vec<AnthropicMessage>) {
        let system = request.system.clone();

        let messages: Vec<AnthropicMessage> = request
            .messages
            .iter()
            .map(|msg| {
                let role = match msg.role {
                    Role::User => "user",
                    Role::Assistant => "assistant",
                    Role::System => "user", // Claude 使用 system 字段
                };
                AnthropicMessage {
                    role: role.to_string(),
                    content: msg.content.clone(),
                }
            })
            .collect();

        (system, messages)
    }
}

#[async_trait]
impl ModelProvider for AnthropicProvider {
    fn name(&self) -> &str {
        "anthropic"
    }

    fn supported_models(&self) -> Vec<&str> {
        vec![
            // Claude 3.5 系列（最新）
            "claude-3-5-sonnet-20241022",
            "claude-3-5-haiku-20241022",
            // Claude 3 系列
            "claude-3-opus-20240229",
            "claude-3-sonnet-20240229",
            "claude-3-haiku-20240307",
        ]
    }

    async fn complete(&self, request: ModelRequest) -> Result<ModelResponse, ProviderError> {
        let (system, messages) = self.to_anthropic_messages(&request);

        let api_request = AnthropicApiRequest {
            model: request.model.clone(),
            max_tokens: request.max_tokens.unwrap_or(4096),
            messages,
            system,
            temperature: request.temperature,
        };

        let response = self
            .client
            .post(format!("{}/messages", self.config.base_url))
            .header("x-api-key", &self.config.api_key)
            .header("anthropic-version", "2023-06-01")
            .header("Content-Type", "application/json")
            .json(&api_request)
            .send()
            .await?;

        if !response.status().is_success() {
            let status = response.status();
            let text = response.text().await.unwrap_or_default();
            return Err(ProviderError::ApiError(format!(
                "HTTP {}: {}",
                status, text
            )));
        }

        let api_response: AnthropicApiResponse = response.json().await?;

        let content = api_response
            .content
            .first()
            .map(|c| c.text.clone())
            .unwrap_or_default();

        Ok(ModelResponse {
            content,
            model: request.model,
            usage: api_response.usage.map(|u| Usage {
                prompt_tokens: u.input_tokens,
                completion_tokens: u.output_tokens,
                total_tokens: u.input_tokens + u.output_tokens,
            }),
        })
    }
}

// Anthropic API 类型
#[derive(Debug, Serialize)]
struct AnthropicApiRequest {
    model: String,
    max_tokens: u32,
    messages: Vec<AnthropicMessage>,
    #[serde(skip_serializing_if = "Option::is_none")]
    system: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    temperature: Option<f32>,
}

#[derive(Debug, Serialize, Deserialize)]
struct AnthropicMessage {
    role: String,
    content: String,
}

#[derive(Debug, Deserialize)]
struct AnthropicApiResponse {
    content: Vec<AnthropicContent>,
    usage: Option<AnthropicUsage>,
}

#[derive(Debug, Deserialize)]
struct AnthropicContent {
    text: String,
    #[serde(rename = "type")]
    content_type: String,
}

#[derive(Debug, Deserialize)]
struct AnthropicUsage {
    input_tokens: u32,
    output_tokens: u32,
}
