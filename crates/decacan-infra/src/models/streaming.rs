use super::types::Usage;
use futures::stream::BoxStream;
use serde::Deserialize;

/// 流式响应的单个数据块
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum StreamChunk {
    /// 内容增量
    Content(String),
    /// 完成标记（包含最终使用量统计）
    Done(Option<Usage>),
    /// 错误
    Error(String),
}

/// 流式响应类型
pub type ModelStream = BoxStream<'static, StreamChunk>;

/// OpenAI 流式响应格式
#[derive(Debug, Deserialize)]
pub struct OpenAiStreamResponse {
    pub choices: Vec<OpenAiStreamChoice>,
}

#[derive(Debug, Deserialize)]
pub struct OpenAiStreamChoice {
    pub delta: OpenAiStreamDelta,
    pub finish_reason: Option<String>,
}

#[derive(Debug, Deserialize, Default)]
pub struct OpenAiStreamDelta {
    pub content: Option<String>,
}

/// Anthropic 流式响应格式
#[derive(Debug, Deserialize)]
pub struct AnthropicStreamResponse {
    #[serde(rename = "type")]
    pub event_type: String,
    pub delta: Option<AnthropicStreamDelta>,
    pub message: Option<AnthropicStreamMessage>,
    pub content_block: Option<AnthropicContentBlock>,
}

#[derive(Debug, Deserialize)]
pub struct AnthropicStreamDelta {
    pub text: String,
}

#[derive(Debug, Deserialize)]
pub struct AnthropicStreamMessage {
    pub usage: Option<Usage>,
}

#[derive(Debug, Deserialize)]
pub struct AnthropicContentBlock {
    pub text: String,
}
