# Models 多模型路由系统实施计划

> **架构更新（2026-04-16）**：项目已全面迁移至 TypeScript/Node.js，后端核心位于 `packages/orchestrator`。本文档中的 Rust/crates 相关实现细节为历史记录，当前技术栈为 Hono + Drizzle ORM + Zod。


> **For agentic workers:** REQUIRED SUB-SKILL: Use @superpowers:subagent-driven-development (recommended) or @superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **注意:** 本计划中的代码示例需要从 Rust 转换为 TypeScript 实现。核心逻辑和架构保持不变，仅变更语言实现。

**Goal:** 构建统一的多模型路由层，支持 OpenAI 和 Anthropic，带 fallback 机制和统一请求/响应格式

**架构：** 定义 `ModelRouter` 作为统一入口，实现 Provider 接口，支持按配置路由到不同提供商（OpenAI/Anthropic），支持 fallback 链。

**Tech Stack:** TypeScript, fetch API, Zod, AI SDK (or openai SDK directly)

---

## 文件结构映射

### 修改文件
- `packages/orchestrator/package.json` - 添加 AI SDK 依赖
- `packages/orchestrator/src/models/index.ts` - 模型模块入口

### 新建文件
- `packages/orchestrator/src/models/config.ts` - 模型路由配置
- `packages/orchestrator/src/models/router.ts` - 模型路由器
- `packages/orchestrator/src/models/provider.ts` - 提供商接口
- `packages/orchestrator/src/models/openai-provider.ts` - OpenAI 适配器
- `packages/orchestrator/src/models/anthropic-provider.ts` - Anthropic 适配器
- `packages/orchestrator/src/models/types.ts` - 统一请求/响应类型
- `packages/orchestrator/tests/models.test.ts` - 模型系统测试

---

## Task 1: 添加 HTTP 客户端依赖

**Files:**
- Modify: `crates/decacan-infra/Cargo.toml`

- [ ] **Step 1: 添加 HTTP 和模型相关依赖**

```toml
[dependencies]
decacan-runtime = { path = "../decacan-runtime" }
time = { version = "0.3", features = ["formatting", "parsing"] }
config = "0.14"
serde = { version = "1", features = ["derive"] }
serde_yaml = "0.9"
serde_json = "1"
once_cell = "1"
dotenvy = "0.15"
async-trait = "0.1"
tokio = { version = "1", features = ["sync", "rt", "macros"] }
tracing = "0.1"
tracing-subscriber = { version = "0.3", features = ["json", "env-filter", "time"] }
tracing-appender = "0.2"
sqlx = { version = "0.8", features = ["runtime-tokio", "postgres", "migrate", "time"] }

# 模型新增
reqwest = { version = "0.12", features = ["json", "rustls-tls"] }
thiserror = "1"
```

- [ ] **Step 2: 运行 cargo check**

Run: `cd crates/decacan-infra && cargo check`
Expected: 编译成功

- [ ] **Step 3: Commit**

```bash
git add crates/decacan-infra/Cargo.toml
git commit -m "deps(models): add reqwest and thiserror dependencies"
```

---

## Task 2: 定义统一请求/响应类型

**Files:**
- Create: `crates/decacan-infra/src/models/types.rs`

- [ ] **Step 1: 创建统一类型**

Create: `crates/decacan-infra/src/models/types.rs`

```rust
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
#[derive(Debug, Clone, Deserialize)]
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
```

- [ ] **Step 2: 更新 models/mod.rs**

Modify: `crates/decacan-infra/src/models/mod.rs`

```rust
pub mod anthropic;
pub mod config;
pub mod openai;
pub mod provider;
pub mod router;
pub mod types;

// 重新导出常用类型
pub use types::{Message, ModelRequest, ModelResponse, Role, Usage};
```

- [ ] **Step 3: 运行检查**

Run: `cd crates/decacan-infra && cargo check`
Expected: 编译成功

- [ ] **Step 4: Commit**

```bash
git add crates/decacan-infra/src/models/types.rs
git add crates/decacan-infra/src/models/mod.rs
git commit -m "feat(models): add unified ModelRequest and ModelResponse types"
```

---

## Task 3: 定义模型提供商 Trait

**Files:**
- Create: `crates/decacan-infra/src/models/provider.rs`
- Create: `crates/decacan-infra/src/models/config.rs`

- [ ] **Step 1: 创建提供商配置**

Create: `crates/decacan-infra/src/models/config.rs`

```rust
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
        }
    }
}

impl ModelRouterConfig {
    pub fn with_openai(mut self, api_key: impl Into<String>) -> Self {
        self.providers.insert(
            "openai".to_string(),
            ProviderConfig {
                api_key: api_key.into(),
                base_url: "https://api.openai.com/v1".to_string(),
                default_model: Some("gpt-4".to_string()),
                timeout_seconds: 60,
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
                default_model: Some("claude-3-opus-20240229".to_string()),
                timeout_seconds: 60,
            },
        );
        self
    }
}
```

- [ ] **Step 2: 创建提供商 Trait**

Create: `crates/decacan-infra/src/models/provider.rs`

```rust
use super::types::{ModelRequest, ModelResponse};
use async_trait::async_trait;
use std::error::Error;
use std::fmt;

/// 模型提供商 trait
#[async_trait]
pub trait ModelProvider: Send + Sync {
    /// 提供商名称
    fn name(&self) -> &str;

    /// 支持的模型列表
    fn supported_models(&self) -> Vec<&str>;

    /// 执行模型请求
    async fn complete(
        &self,
        request: ModelRequest,
    ) -> Result<ModelResponse, ProviderError>;
}

/// 提供商错误
#[derive(Debug, Clone, PartialEq, Eq)]
pub enum ProviderError {
    ApiError(String),
    AuthenticationError(String),
    RateLimitError(String),
    TimeoutError(String),
    InvalidRequest(String),
    NetworkError(String),
}

impl fmt::Display for ProviderError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            ProviderError::ApiError(msg) => write!(f, "API error: {}", msg),
            ProviderError::AuthenticationError(msg) => {
                write!(f, "Authentication error: {}", msg)
            }
            ProviderError::RateLimitError(msg) => write!(f, "Rate limit: {}", msg),
            ProviderError::TimeoutError(msg) => write!(f, "Timeout: {}", msg),
            ProviderError::InvalidRequest(msg) => write!(f, "Invalid request: {}", msg),
            ProviderError::NetworkError(msg) => write!(f, "Network error: {}", msg),
        }
    }
}

impl Error for ProviderError {}

impl From<reqwest::Error> for ProviderError {
    fn from(err: reqwest::Error) -> Self {
        if err.is_timeout() {
            ProviderError::TimeoutError(err.to_string())
        } else if err.is_connect() {
            ProviderError::NetworkError(err.to_string())
        } else {
            ProviderError::ApiError(err.to_string())
        }
    }
}
```

- [ ] **Step 3: 更新 mod.rs**

Modify: `crates/decacan-infra/src/models/mod.rs`

```rust
pub mod anthropic;
pub mod config;
pub mod openai;
pub mod provider;
pub mod router;
pub mod types;

pub use config::{ModelRouterConfig, ProviderConfig};
pub use provider::{ModelProvider, ProviderError};
pub use types::{Message, ModelRequest, ModelResponse, Role, Usage};
```

- [ ] **Step 4: 运行检查**

Run: `cd crates/decacan-infra && cargo check`
Expected: 编译成功

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-infra/src/models/config.rs
git add crates/decacan-infra/src/models/provider.rs
git add crates/decacan-infra/src/models/mod.rs
git commit -m "feat(models): add ModelProvider trait and router config"
```

---

## Task 4: 实现 OpenAI 适配器

**Files:**
- Create: `crates/decacan-infra/src/models/openai.rs`

- [ ] **Step 1: 创建 OpenAI 适配器**

Create: `crates/decacan-infra/src/models/openai.rs`

```rust
use super::config::ProviderConfig;
use super::provider::{ModelProvider, ProviderError};
use super::types::{Message, ModelRequest, ModelResponse, Role, Usage};
use async_trait::async_trait;
use reqwest::Client;
use serde::{Deserialize, Serialize};

pub struct OpenAiProvider {
    config: ProviderConfig,
    client: Client,
}

impl OpenAiProvider {
    pub fn new(config: ProviderConfig) -> Self {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout_seconds))
            .build()
            .expect("Failed to build HTTP client");

        Self { config, client }
    }

    fn to_openai_messages(&self,
        request: &ModelRequest,
    ) -> Vec<OpenAiMessage> {
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
}

#[async_trait]
impl ModelProvider for OpenAiProvider {
    fn name(&self) -> &str {
        "openai"
    }

    fn supported_models(&self) -> Vec<&str> {
        vec![
            "gpt-4",
            "gpt-4-turbo",
            "gpt-3.5-turbo",
        ]
    }

    async fn complete(
        &self,
        request: ModelRequest,
    ) -> Result<ModelResponse, ProviderError> {
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
            return Err(ProviderError::ApiError(format!(
                "HTTP {}: {}",
                status, text
            )));
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
```

- [ ] **Step 2: 更新 mod.rs 导出**

Modify: `crates/decacan-infra/src/models/mod.rs`

```rust
pub mod anthropic;
pub mod config;
pub mod openai;
pub mod provider;
pub mod router;
pub mod types;

pub use config::{ModelRouterConfig, ProviderConfig};
pub use openai::OpenAiProvider;
pub use provider::{ModelProvider, ProviderError};
pub use types::{Message, ModelRequest, ModelResponse, Role, Usage};
```

- [ ] **Step 3: 运行检查**

Run: `cd crates/decacan-infra && cargo check`
Expected: 编译成功

- [ ] **Step 4: Commit**

```bash
git add crates/decacan-infra/src/models/openai.rs
git add crates/decacan-infra/src/models/mod.rs
git commit -m "feat(models): implement OpenAI provider adapter"
```

---

## Task 5: 实现 Anthropic 适配器

**Files:**
- Create: `crates/decacan-infra/src/models/anthropic.rs`

- [ ] **Step 1: 创建 Anthropic 适配器**

Create: `crates/decacan-infra/src/models/anthropic.rs`

```rust
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
    pub fn new(config: ProviderConfig) -> Self {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout_seconds))
            .build()
            .expect("Failed to build HTTP client");

        Self { config, client }
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
            "claude-3-opus-20240229",
            "claude-3-sonnet-20240229",
            "claude-3-haiku-20240307",
        ]
    }

    async fn complete(
        &self,
        request: ModelRequest,
    ) -> Result<ModelResponse, ProviderError> {
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
```

- [ ] **Step 2: 更新 mod.rs**

Modify: `crates/decacan-infra/src/models/mod.rs`

```rust
pub mod anthropic;
pub mod config;
pub mod openai;
pub mod provider;
pub mod router;
pub mod types;

pub use anthropic::AnthropicProvider;
pub use config::{ModelRouterConfig, ProviderConfig};
pub use openai::OpenAiProvider;
pub use provider::{ModelProvider, ProviderError};
pub use types::{Message, ModelRequest, ModelResponse, Role, Usage};
```

- [ ] **Step 3: 运行检查**

Run: `cd crates/decacan-infra && cargo check`
Expected: 编译成功

- [ ] **Step 4: Commit**

```bash
git add crates/decacan-infra/src/models/anthropic.rs
git add crates/decacan-infra/src/models/mod.rs
git commit -m "feat(models): implement Anthropic provider adapter"
```

---

## Task 6: 实现 ModelRouter

**Files:**
- Create: `crates/decacan-infra/src/models/router.rs`
- Modify: `crates/decacan-infra/src/models/mod.rs`

- [ ] **Step 1: 创建 ModelRouter**

Create: `crates/decacan-infra/src/models/router.rs`

```rust
use super::anthropic::AnthropicProvider;
use super::config::{ModelRouterConfig, ProviderConfig};
use super::openai::OpenAiProvider;
use super::provider::{ModelProvider, ProviderError};
use super::types::{ModelRequest, ModelResponse};
use decacan_runtime::ports::model::ModelPort;
use std::collections::HashMap;
use thiserror::Error;

pub struct ModelRouter {
    providers: HashMap<String, Box<dyn ModelProvider>>,
    default_provider: String,
    fallback_chain: Vec<String>,
}

#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum RouterError {
    #[error("Provider not found: {0}")]
    ProviderNotFound(String),
    #[error("No providers available")]
    NoProviders,
    #[error("Provider error: {0}")]
    ProviderError(String),
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
                "openai" => Box::new(OpenAiProvider::new(provider_config)),
                "anthropic" => Box::new(AnthropicProvider::new(provider_config)),
                _ => continue, // 未知提供商，跳过
            };
            providers.insert(name, provider);
        }

        if providers.is_empty() {
            return Err(RouterError::NoProviders);
        }

        Ok(Self {
            providers,
            default_provider: config.default_provider,
            fallback_chain: config.fallback_chain,
        })
    }

    fn get_provider(
        &self,
        name: &str,
    ) -> Result<&Box<dyn ModelProvider>, RouterError> {
        self.providers
            .get(name)
            .ok_or_else(|| RouterError::ProviderNotFound(name.to_string()))
    }

    async fn try_with_fallback(
        &self,
        request: ModelRequest,
    ) -> Result<ModelResponse, RouterError> {
        // 按 fallback 链顺序尝试
        for provider_name in &self.fallback_chain {
            if let Ok(provider) = self.get_provider(provider_name) {
                match provider.complete(request.clone()).await {
                    Ok(response) => return Ok(response),
                    Err(ProviderError::RateLimitError(_))
                    | Err(ProviderError::TimeoutError(_)) => {
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
}

#[async_trait::async_trait]
impl ModelPort for ModelRouter {
    type Error = RouterError;

    async fn complete(
        &self,
        prompt: &str,
    ) -> Result<String, Self::Error> {
        let request = ModelRequest::new(&self.default_provider,
            prompt,
        );

        let response = self.try_with_fallback(request).await?;
        Ok(response.content)
    }
}

impl ModelRouter {
    /// 使用特定模型执行请求
    pub async fn complete_with_model(
        &self,
        model: &str,
        prompt: &str,
    ) -> Result<String, RouterError> {
        let request = ModelRequest::new(model, prompt);
        let response = self.try_with_fallback(request).await?;
        Ok(response.content)
    }

    /// 使用完整请求对象
    pub async fn complete_request(
        &self,
        request: ModelRequest,
    ) -> Result<ModelResponse, RouterError> {
        self.try_with_fallback(request).await
    }
}
```

- [ ] **Step 2: 更新 mod.rs 导出**

Modify: `crates/decacan-infra/src/models/mod.rs`

```rust
pub mod anthropic;
pub mod config;
pub mod openai;
pub mod provider;
pub mod router;
pub mod types;

pub use anthropic::AnthropicProvider;
pub use config::{ModelRouterConfig, ProviderConfig};
pub use openai::OpenAiProvider;
pub use provider::{ModelProvider, ProviderError};
pub use router::{ModelRouter, RouterError};
pub use types::{Message, ModelRequest, ModelResponse, Role, Usage};
```

- [ ] **Step 3: 运行检查**

Run: `cd crates/decacan-infra && cargo check`
Expected: 编译成功

- [ ] **Step 4: Commit**

```bash
git add crates/decacan-infra/src/models/router.rs
git add crates/decacan-infra/src/models/mod.rs
git commit -m "feat(models): implement ModelRouter with fallback support"
```

---

## Task 7: 添加配置和测试

**Files:**
- Create: `crates/decacan-infra/tests/models_test.rs`
- Modify: `config/default.yaml`, `config/dev.yaml`, `.env.example`

- [ ] **Step 1: 创建测试**

Create: `crates/decacan-infra/tests/models_test.rs`

```rust
#[cfg(test)]
mod config_tests {
    use decacan_infra::models::ModelRouterConfig;

    #[test]
    fn test_default_config() {
        let config = ModelRouterConfig::default();
        assert_eq!(config.default_provider, "openai");
        assert_eq!(config.fallback_chain, vec!["openai", "anthropic"]);
        assert!(config.providers.is_empty());
    }

    #[test]
    fn test_config_with_providers() {
        let config = ModelRouterConfig::default()
            .with_openai("test-openai-key")
            .with_anthropic("test-anthropic-key");

        assert!(config.providers.contains_key("openai"));
        assert!(config.providers.contains_key("anthropic"));
        
        let openai = config.providers.get("openai").unwrap();
        assert_eq!(openai.api_key, "test-openai-key");
    }

    #[test]
    fn test_config_yaml_serialization() {
        let config = ModelRouterConfig::default()
            .with_openai("sk-test");

        let yaml = serde_yaml::to_string(&config).unwrap();
        assert!(yaml.contains("openai"));
        assert!(yaml.contains("sk-test"));
    }
}

#[cfg(test)]
mod router_tests {
    use decacan_infra::models::ModelRouter;
    use decacan_infra::models::ModelRouterConfig;

    #[test]
    fn test_router_creation() {
        let config = ModelRouterConfig::default()
            .with_openai("test-key");

        let router = ModelRouter::new(config);
        assert!(router.is_ok());
    }

    #[test]
    fn test_router_no_providers() {
        let config = ModelRouterConfig::default();
        let router = ModelRouter::new(config);
        assert!(router.is_err());
    }
}
```

- [ ] **Step 2: 更新配置文件**

Modify: `config/default.yaml`

```yaml
# 默认配置
profile: dev

logging:
  level: info
  stdout: true
  file:
    enabled: false

postgres:
  url: postgres://postgres:postgres@localhost/decacan
  max_connections: 10
  auto_migrate: false

models:
  default_provider: openai
  fallback_chain: [openai, anthropic]
  providers:
    openai:
      api_key: "${OPENAI_API_KEY}"
      base_url: https://api.openai.com/v1
      default_model: gpt-4
      timeout_seconds: 60
    anthropic:
      api_key: "${ANTHROPIC_API_KEY}"
      base_url: https://api.anthropic.com/v1
      default_model: claude-3-opus-20240229
      timeout_seconds: 60
```

- [ ] **Step 3: 运行测试**

Run: `cd crates/decacan-infra && cargo test --test models_test`
Expected: 测试通过

- [ ] **Step 4: Commit**

```bash
git add crates/decacan-infra/tests/models_test.rs
git add config/default.yaml
git commit -m "feat(models): add tests and configuration examples"
```

---

## Task 8: 最终验证

**Files:**
- All

- [ ] **Step 1: 运行完整构建**

Run: `cd crates/decacan-infra && cargo build`
Expected: Build successful

- [ ] **Step 2: 运行所有测试**

Run: `cd crates/decacan-infra && cargo test`
Expected: All tests PASSED

- [ ] **Step 3: 检查依赖**

Run: `cd crates/decacan-infra && cargo tree | grep -E "(reqwest|serde)" | head -10`
Expected: 显示 reqwest 和 serde 依赖

- [ ] **Step 4: Final Commit**

```bash
git add -A
git commit -m "feat(models): complete multi-provider model routing system"
```

---

## 验收标准

- [ ] `ModelRouter` 实现 `ModelPort` trait
- [ ] `OpenAiProvider` 和 `AnthropicProvider` 实现 `ModelProvider` trait
- [ ] 统一 `ModelRequest` 和 `ModelResponse` 类型
- [ ] 支持 fallback 链（当一个提供商失败时尝试下一个）
- [ ] 配置文件支持模型路由配置
- [ ] 环境变量支持 API keys
- [ ] 所有测试通过

---

## 使用示例

```rust
use decacan_infra::models::{ModelRouter, ModelRouterConfig};
use decacan_runtime::ports::model::ModelPort;

#[tokio::main]
async fn main() {
    // 1. 配置模型路由
    let config = ModelRouterConfig::default()
        .with_openai(std::env::var("OPENAI_API_KEY").unwrap())
        .with_anthropic(std::env::var("ANTHROPIC_API_KEY").unwrap());

    // 2. 创建路由器
    let router = ModelRouter::new(config).unwrap();

    // 3. 使用 ModelPort 接口
    let response = router.complete("Hello, how are you?").await.unwrap();
    println!("Response: {}", response);

    // 4. 使用特定模型
    let response = router
        .complete_with_model("claude-3-opus-20240229", "Explain Rust lifetimes")
        .await
        .unwrap();
    println!("Claude response: {}", response);

    // 5. 使用完整请求
    use decacan_infra::models::{ModelRequest, Message, Role};
    
    let request = ModelRequest::new("gpt-4", "Write a haiku about coding")
        .with_system("You are a helpful assistant")
        .with_temperature(0.7);
    
    let response = router.complete_request(request).await.unwrap();
    println!("Model: {}", response.model);
    println!("Content: {}", response.content);
    if let Some(usage) = response.usage {
        println!("Tokens: {} prompt, {} completion", 
            usage.prompt_tokens, usage.completion_tokens);
    }
}
```

---

## 完整 decacan-infra 系统就绪

所有 5 个模块已完成设计：
1. ✅ Config - 分层配置系统
2. ✅ Secrets - 密钥管理
3. ✅ Logging - 结构化日志
4. ✅ Storage - PostgreSQL 存储
5. ✅ Models - 多模型路由

现在可以开始实施这些计划！
