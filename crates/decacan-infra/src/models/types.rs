use serde::{Deserialize, Serialize};

/// 统一的模型请求
#[derive(Debug, Clone, Serialize)]
pub struct ModelRequest {
    /// 模型标识符（如 gpt-4, claude-3-opus）
    pub model: String,
    /// 系统提示词
    #[serde(skip_serializing_if = "Option::is_none")]
    pub system: Option<String>,
    /// 用户消息
    pub messages: Vec<Message>,
    /// 温度参数
    #[serde(skip_serializing_if = "Option::is_none")]
    pub temperature: Option<f32>,
    /// 最大 token 数
    #[serde(skip_serializing_if = "Option::is_none")]
    pub max_tokens: Option<u32>,
}

/// 消息类型
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Message {
    pub role: Role,
    pub content: String,
}

/// 角色
#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq)]
#[serde(rename_all = "lowercase")]
pub enum Role {
    System,
    User,
    Assistant,
}

/// 统一的模型响应
#[derive(Debug, Clone, Deserialize)]
pub struct ModelResponse {
    pub content: String,
    pub model: String,
    pub usage: Option<Usage>,
}

/// Token 使用量
#[derive(Debug, Clone, Deserialize, PartialEq, Eq)]
pub struct Usage {
    pub prompt_tokens: u32,
    pub completion_tokens: u32,
    pub total_tokens: u32,
}

impl ModelRequest {
    pub fn new(model: impl Into<String>, content: impl Into<String>) -> Self {
        Self {
            model: model.into(),
            system: None,
            messages: vec![Message {
                role: Role::User,
                content: content.into(),
            }],
            temperature: None,
            max_tokens: None,
        }
    }

    pub fn with_system(mut self, system: impl Into<String>) -> Self {
        self.system = Some(system.into());
        self
    }

    pub fn with_temperature(mut self, temp: f32) -> Self {
        self.temperature = Some(temp);
        self
    }

    pub fn with_max_tokens(mut self, max: u32) -> Self {
        self.max_tokens = Some(max);
        self
    }
}
