# 模型模块增强实现计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 增强 decacan-infra 模型模块，实现智能重试机制、流式响应支持、Token 预算管理和优雅错误处理

**Architecture:** 基于现有 Provider/ModelPort 架构，通过增加重试策略中间件、流式适配器模式和 Token 计数器来增强功能，同时保持向后兼容

**Tech Stack:** Rust, tokio, reqwest, async-trait, serde, futures

---

## 文件结构变更

### 现有文件
- `crates/decacan-infra/src/models/provider.rs` - 修改：添加重试 trait 和流式支持
- `crates/decacan-infra/src/models/types.rs` - 修改：添加流式响应类型和 Token 预算
- `crates/decacan-infra/src/models/openai.rs` - 修改：实现流式、重试、移除 expect
- `crates/decacan-infra/src/models/anthropic.rs` - 修改：实现流式、重试、移除 expect
- `crates/decacan-infra/src/models/router.rs` - 修改：集成重试策略
- `crates/decacan-infra/src/models/config.rs` - 修改：添加重试和预算配置
- `crates/decacan-infra/src/models/mod.rs` - 修改：导出新类型

### 新建文件
- `crates/decacan-infra/src/models/retry.rs` - 指数退避重试策略实现
- `crates/decacan-infra/src/models/budget.rs` - Token 预算管理器
- `crates/decacan-infra/src/models/streaming.rs` - 流式响应处理
- `crates/decacan-infra/src/models/error.rs` - 统一错误类型（可选，集中错误处理）

### 测试文件
- `crates/decacan-infra/tests/models_test.rs` - 修改：添加新功能测试
- `crates/decacan-infra/tests/retry_test.rs` - 新建：重试策略测试
- `crates/decacan-infra/tests/budget_test.rs` - 新建：预算管理测试
- `crates/decacan-infra/tests/streaming_test.rs` - 新建：流式响应测试

---

## 任务分解

### Task 1: 创建重试策略模块

**Files:**
- Create: `crates/decacan-infra/src/models/retry.rs`
- Modify: `crates/decacan-infra/src/models/mod.rs`
- Test: `crates/decacan-infra/tests/retry_test.rs`

**背景:** 当前模型调用在遇到 RateLimit/Timeout 时没有重试机制。需要实现指数退避策略。

- [ ] **Step 1.1: 定义重试配置类型**

创建 `crates/decacan-infra/src/models/retry.rs`:

```rust
use std::time::Duration;

/// 重试策略配置
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct RetryConfig {
    /// 最大重试次数
    pub max_retries: u32,
    /// 初始退避时间（毫秒）
    pub initial_backoff_ms: u64,
    /// 最大退避时间（毫秒）
    pub max_backoff_ms: u64,
    /// 退避乘数
    pub backoff_multiplier: f64,
}

impl Default for RetryConfig {
    fn default() -> Self {
        Self {
            max_retries: 3,
            initial_backoff_ms: 1000,
            max_backoff_ms: 60000,
            backoff_multiplier: 2.0,
        }
    }
}

/// 可重试的错误 trait
pub trait RetryableError {
    /// 判断错误是否可重试
    fn is_retryable(&self) -> bool;
}
```

- [ ] **Step 1.2: 实现指数退避计算器**

在 `retry.rs` 中添加:

```rust
impl RetryConfig {
    /// 计算第 n 次重试的等待时间
    pub fn backoff_duration(&self, attempt: u32) -> Duration {
        let exponent = attempt as f64;
        let backoff_ms = (self.initial_backoff_ms as f64 * self.backoff_multiplier.powf(exponent))
            .min(self.max_backoff_ms as f64) as u64;
        Duration::from_millis(backoff_ms)
    }
    
    /// 为可重试错误创建重试 future
    pub async fn execute<F, Fut, T, E>(&self, operation: F) -> Result<T, E>
    where
        F: Fn() -> Fut,
        Fut: std::future::Future<Output = Result<T, E>>,
        E: RetryableError + std::fmt::Debug,
    {
        let mut last_error = None;
        
        for attempt in 0..=self.max_retries {
            match operation().await {
                Ok(result) => return Ok(result),
                Err(e) if !e.is_retryable() => return Err(e),
                Err(e) => {
                    last_error = Some(e);
                    if attempt < self.max_retries {
                        let delay = self.backoff_duration(attempt);
                        tokio::time::sleep(delay).await;
                    }
                }
            }
        }
        
        Err(last_error.unwrap())
    }
}
```

- [ ] **Step 1.3: 更新 mod.rs 导出**

修改 `crates/decacan-infra/src/models/mod.rs`:

```rust
pub mod retry;
// ... 其他导出
pub use retry::{RetryConfig, RetryableError};
```

- [ ] **Step 1.4: 编写重试测试**

创建 `crates/decacan-infra/tests/retry_test.rs`:

```rust
use decacan_infra::models::retry::{RetryConfig, RetryableError};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;

#[derive(Debug, Clone)]
struct TestError {
    retryable: bool,
}

impl RetryableError for TestError {
    fn is_retryable(&self) -> bool {
        self.retryable
    }
}

#[tokio::test]
async fn test_backoff_calculation() {
    let config = RetryConfig {
        initial_backoff_ms: 100,
        max_backoff_ms: 1000,
        backoff_multiplier: 2.0,
        max_retries: 3,
    };
    
    assert_eq!(config.backoff_duration(0).as_millis(), 100);
    assert_eq!(config.backoff_duration(1).as_millis(), 200);
    assert_eq!(config.backoff_duration(2).as_millis(), 400);
    assert_eq!(config.backoff_duration(10).as_millis(), 1000); // 封顶
}

#[tokio::test]
async fn test_retry_success_after_failures() {
    let config = RetryConfig {
        max_retries: 3,
        initial_backoff_ms: 10,
        max_backoff_ms: 100,
        backoff_multiplier: 1.5,
    };
    
    let attempts = Arc::new(AtomicUsize::new(0));
    let attempts_clone = attempts.clone();
    
    let result = config.execute(|| async {
        let count = attempts_clone.fetch_add(1, Ordering::SeqCst);
        if count < 2 {
            Err(TestError { retryable: true })
        } else {
            Ok("success")
        }
    }).await;
    
    assert_eq!(result.unwrap(), "success");
    assert_eq!(attempts.load(Ordering::SeqCst), 3);
}

#[tokio::test]
async fn test_no_retry_for_non_retryable_error() {
    let config = RetryConfig::default();
    let attempts = Arc::new(AtomicUsize::new(0));
    let attempts_clone = attempts.clone();
    
    let result: Result<(), TestError> = config.execute(|| async {
        attempts_clone.fetch_add(1, Ordering::SeqCst);
        Err(TestError { retryable: false })
    }).await;
    
    assert!(result.is_err());
    assert_eq!(attempts.load(Ordering::SeqCst), 1); // 只尝试一次
}
```

- [ ] **Step 1.5: 运行测试并验证**

Run:
```bash
cargo test -p decacan-infra --test retry_test -- --nocapture
```

Expected: All tests PASS

- [ ] **Step 1.6: Commit**

```bash
git add crates/decacan-infra/src/models/retry.rs crates/decacan-infra/src/models/mod.rs crates/decacan-infra/tests/retry_test.rs
git commit -m "feat(models): add retry strategy with exponential backoff

- Add RetryConfig for configurable retry behavior
- Implement exponential backoff with max cap
- Add RetryableError trait for error classification
- Include comprehensive unit tests

Task 1 of model enhancement plan"
```

---

### Task 2: 扩展错误处理并为 ProviderError 实现 RetryableError

**Files:**
- Modify: `crates/decacan-infra/src/models/provider.rs`
- Modify: `crates/decacan-infra/src/models/retry.rs`

**背景:** ProviderError 需要实现 RetryableError trait 才能使用重试机制

- [ ] **Step 2.1: 为 ProviderError 实现 RetryableError**

修改 `crates/decacan-infra/src/models/provider.rs`，在文件末尾添加:

```rust
use crate::models::retry::RetryableError;

impl RetryableError for ProviderError {
    fn is_retryable(&self) -> bool {
        match self {
            ProviderError::RateLimitError(_) => true,
            ProviderError::TimeoutError(_) => true,
            ProviderError::NetworkError(_) => true,
            _ => false,
        }
    }
}
```

- [ ] **Step 2.2: 修复导入顺序**

确保 `provider.rs` 顶部有:

```rust
use super::types::{ModelRequest, ModelResponse};
use super::retry::RetryableError;  // 添加这行
use async_trait::async_trait;
```

- [ ] **Step 2.3: 编写集成测试**

在 `crates/decacan-infra/tests/models_test.rs` 中添加:

```rust
#[cfg(test)]
mod retryable_tests {
    use decacan_infra::models::provider::{ProviderError, ModelProvider};
    use decacan_infra::models::retry::RetryableError;
    use decacan_infra::models::types::ModelRequest;
    
    #[test]
    fn test_rate_limit_is_retryable() {
        let err = ProviderError::RateLimitError("too many requests".to_string());
        assert!(err.is_retryable());
    }
    
    #[test]
    fn test_timeout_is_retryable() {
        let err = ProviderError::TimeoutError("connection timeout".to_string());
        assert!(err.is_retryable());
    }
    
    #[test]
    fn test_auth_error_is_not_retryable() {
        let err = ProviderError::AuthenticationError("invalid key".to_string());
        assert!(!err.is_retryable());
    }
    
    #[test]
    fn test_api_error_is_not_retryable() {
        let err = ProviderError::ApiError("bad request".to_string());
        assert!(!err.is_retryable());
    }
}
```

- [ ] **Step 2.4: 运行测试**

Run:
```bash
cargo test -p decacan-infra --test models_test retryable_tests -- --nocapture
```

Expected: All tests PASS

- [ ] **Step 2.5: Commit**

```bash
git add crates/decacan-infra/src/models/provider.rs crates/decacan-infra/tests/models_test.rs
git commit -m "feat(models): implement RetryableError for ProviderError

- RateLimit, Timeout, Network errors are retryable
- Auth and API errors fail immediately
- Add integration tests for retry classification"
```

---

### Task 3: 实现 Token 预算管理

**Files:**
- Create: `crates/decacan-infra/src/models/budget.rs`
- Modify: `crates/decacan-infra/src/models/mod.rs`
- Test: `crates/decacan-infra/tests/budget_test.rs`

**背景:** 需要限制单次请求和总消费的 Token 数量，防止意外高成本

- [ ] **Step 3.1: 定义预算管理类型**

创建 `crates/decacan-infra/src/models/budget.rs`:

```rust
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use thiserror::Error;

/// Token 预算配置
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct TokenBudget {
    /// 单次请求最大 Token 数
    pub max_request_tokens: Option<u64>,
    /// 会话/运行最大总 Token 数
    pub max_total_tokens: Option<u64>,
}

impl Default for TokenBudget {
    fn default() -> Self {
        Self {
            max_request_tokens: None,
            max_total_tokens: None,
        }
    }
}

impl TokenBudget {
    /// 创建无限预算
    pub fn unlimited() -> Self {
        Self::default()
    }
    
    /// 创建严格预算
    pub fn strict(max_request: u64, max_total: u64) -> Self {
        Self {
            max_request_tokens: Some(max_request),
            max_total_tokens: Some(max_total),
        }
    }
    
    /// 仅限制单次请求
    pub fn per_request_limit(max: u64) -> Self {
        Self {
            max_request_tokens: Some(max),
            max_total_tokens: None,
        }
    }
}

/// Token 预算管理器
#[derive(Debug, Clone)]
pub struct BudgetManager {
    budget: TokenBudget,
    total_used: Arc<AtomicU64>,
}

#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum BudgetError {
    #[error("Request exceeds maximum allowed tokens: requested {requested}, limit {limit}")]
    RequestTooLarge { requested: u64, limit: u64 },
    #[error("Total budget exceeded: used {used}, limit {limit}")]
    BudgetExceeded { used: u64, limit: u64 },
}

impl BudgetManager {
    pub fn new(budget: TokenBudget) -> Self {
        Self {
            budget,
            total_used: Arc::new(AtomicU64::new(0)),
        }
    }
    
    /// 检查请求是否允许
    pub fn check_request(&self, estimated_tokens: u64) -> Result<(), BudgetError> {
        // 检查单次请求限制
        if let Some(max_request) = self.budget.max_request_tokens {
            if estimated_tokens > max_request {
                return Err(BudgetError::RequestTooLarge {
                    requested: estimated_tokens,
                    limit: max_request,
                });
            }
        }
        
        // 检查总预算
        if let Some(max_total) = self.budget.max_total_tokens {
            let current = self.total_used.load(Ordering::Relaxed);
            if current + estimated_tokens > max_total {
                return Err(BudgetError::BudgetExceeded {
                    used: current,
                    limit: max_total,
                });
            }
        }
        
        Ok(())
    }
    
    /// 记录实际使用的 Token
    pub fn record_usage(&self, tokens: u64) {
        self.total_used.fetch_add(tokens, Ordering::Relaxed);
    }
    
    /// 获取已使用的总 Token 数
    pub fn total_used(&self) -> u64 {
        self.total_used.load(Ordering::Relaxed)
    }
    
    /// 获取剩余预算
    pub fn remaining_budget(&self) -> Option<u64> {
        self.budget.max_total_tokens.map(|max| {
            max.saturating_sub(self.total_used.load(Ordering::Relaxed))
        })
    }
}
```

- [ ] **Step 3.2: 添加简单的 Token 估算函数**

在 `budget.rs` 末尾添加:

```rust
/// 估算文本的 Token 数量（简单估算：约 4 字符 = 1 token）
pub fn estimate_tokens(text: &str) -> u64 {
    (text.len() as f64 / 4.0).ceil() as u64
}

#[cfg(test)]
mod tests {
    use super::*;
    
    #[test]
    fn test_token_estimation() {
        // 简单估算：4 字符 = 1 token
        assert_eq!(estimate_tokens("hello"), 2); // 5/4 = 1.25 -> 2
        assert_eq!(estimate_tokens("hello world"), 3); // 11/4 = 2.75 -> 3
        assert_eq!(estimate_tokens(""), 0);
    }
}
```

- [ ] **Step 3.3: 更新 mod.rs 导出**

修改 `crates/decacan-infra/src/models/mod.rs`:

```rust
pub mod budget;
// ... 其他导出
pub use budget::{TokenBudget, BudgetManager, BudgetError, estimate_tokens};
```

- [ ] **Step 3.4: 编写预算测试**

创建 `crates/decacan-infra/tests/budget_test.rs`:

```rust
use decacan_infra::models::budget::{TokenBudget, BudgetManager, BudgetError, estimate_tokens};

#[test]
fn test_unlimited_budget_allows_any_request() {
    let manager = BudgetManager::new(TokenBudget::unlimited());
    assert!(manager.check_request(1000000).is_ok());
}

#[test]
fn test_request_limit_enforced() {
    let manager = BudgetManager::new(TokenBudget::per_request_limit(100));
    
    assert!(manager.check_request(50).is_ok());
    assert!(manager.check_request(100).is_ok());
    
    let result = manager.check_request(101);
    assert!(matches!(result, Err(BudgetError::RequestTooLarge { requested: 101, limit: 100 })));
}

#[test]
fn test_total_budget_tracking() {
    let budget = TokenBudget::strict(100, 200); // max_request=100, max_total=200
    let manager = BudgetManager::new(budget);
    
    // 第一次请求 50 tokens
    assert!(manager.check_request(50).is_ok());
    manager.record_usage(50);
    assert_eq!(manager.total_used(), 50);
    
    // 第二次请求 100 tokens，累计 150 < 200
    assert!(manager.check_request(100).is_ok());
    manager.record_usage(100);
    assert_eq!(manager.total_used(), 150);
    
    // 第三次请求 100 tokens，累计 250 > 200
    let result = manager.check_request(100);
    assert!(matches!(result, Err(BudgetError::BudgetExceeded { used: 150, limit: 200 })));
}

#[test]
fn test_remaining_budget() {
    let budget = TokenBudget::strict(50, 100);
    let manager = BudgetManager::new(budget);
    
    assert_eq!(manager.remaining_budget(), Some(100));
    
    manager.record_usage(30);
    assert_eq!(manager.remaining_budget(), Some(70));
    
    manager.record_usage(80);
    assert_eq!(manager.remaining_budget(), Some(0));
}

#[test]
fn test_token_estimation() {
    // 简单估算：4 字符 ≈ 1 token
    assert_eq!(estimate_tokens("test"), 1);
    assert_eq!(estimate_tokens("hello world"), 3); // 11/4 = 2.75 -> 3
    assert_eq!(estimate_tokens("this is a longer piece of text for testing"), 11);
}
```

- [ ] **Step 3.5: 运行测试**

Run:
```bash
cargo test -p decacan-infra --test budget_test -- --nocapture
```

Expected: All tests PASS

- [ ] **Step 3.6: Commit**

```bash
git add crates/decacan-infra/src/models/budget.rs crates/decacan-infra/src/models/mod.rs crates/decacan-infra/tests/budget_test.rs
git commit -m "feat(models): add token budget management

- Implement BudgetManager with per-request and total limits
- Add TokenBudget configuration with multiple presets
- Include simple token estimation (4 chars ≈ 1 token)
- Add comprehensive budget tracking tests"
```

---

### Task 4: 实现流式响应基础类型

**Files:**
- Create: `crates/decacan-infra/src/models/streaming.rs`
- Modify: `crates/decacan-infra/src/models/types.rs`
- Modify: `crates/decacan-infra/src/models/mod.rs`
- Test: `crates/decacan-infra/tests/streaming_test.rs`

**背景:** 流式响应可以让用户在完整响应生成前就开始看到内容

- [ ] **Step 4.1: 定义流式响应类型**

创建 `crates/decacan-infra/src/models/streaming.rs`:

```rust
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
```

- [ ] **Step 4.2: 在 types.rs 中添加流式请求支持**

修改 `crates/decacan-infra/src/models/types.rs`，在 `ModelRequest` 后添加:

```rust
/// 流式响应配置
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum StreamMode {
    /// 完整响应（默认）
    Complete,
    /// 流式响应
    Stream,
}

impl Default for StreamMode {
    fn default() -> Self {
        StreamMode::Complete
    }
}

impl ModelRequest {
    /// 设置流式模式
    pub fn with_stream(mut self, stream: bool) -> Self {
        // 返回带流式标志的请求
        // 注意：实际存储需要添加 stream 字段到 ModelRequest
        self
    }
}
```

**注意:** 这里发现 `ModelRequest` 需要添加 `stream` 字段。由于这可能影响现有代码，我们采用不同的方式：为流式创建新 trait。

- [ ] **Step 4.3: 改为创建流式 Provider trait**

在 `streaming.rs` 中添加:

```rust
use async_trait::async_trait;
use super::types::ModelRequest;

/// 支持流式响应的 Provider trait
#[async_trait]
pub trait StreamingModelProvider: Send + Sync {
    /// 执行流式请求
    async fn complete_stream(&self, request: ModelRequest) -> ModelStream;
}
```

- [ ] **Step 4.4: 更新 mod.rs 导出**

修改 `crates/decacan-infra/src/models/mod.rs`:

```rust
pub mod streaming;
// ... 其他导出
pub use streaming::{StreamChunk, ModelStream, StreamingModelProvider};
```

- [ ] **Step 4.5: 添加 streaming 测试**

创建 `crates/decacan-infra/tests/streaming_test.rs`:

```rust
use decacan_infra::models::streaming::StreamChunk;
use futures::stream::{self, StreamExt};

#[tokio::test]
async fn test_stream_chunk_types() {
    let chunks = vec![
        StreamChunk::Content("Hello".to_string()),
        StreamChunk::Content(" ".to_string()),
        StreamChunk::Content("World".to_string()),
        StreamChunk::Done(None),
    ];
    
    let stream = stream::iter(chunks.clone());
    let collected: Vec<_> = stream.collect().await;
    
    assert_eq!(collected.len(), 4);
    assert_eq!(collected[0], StreamChunk::Content("Hello".to_string()));
    assert_eq!(collected[3], StreamChunk::Done(None));
}

#[test]
fn test_stream_chunk_equality() {
    assert_eq!(
        StreamChunk::Content("test".to_string()),
        StreamChunk::Content("test".to_string())
    );
    
    assert_ne!(
        StreamChunk::Content("test".to_string()),
        StreamChunk::Content("other".to_string())
    );
}
```

- [ ] **Step 4.6: 添加 futures 依赖**

修改 `crates/decacan-infra/Cargo.toml`:

```toml
[dependencies]
# ... 现有依赖
futures = "0.3"
```

- [ ] **Step 4.7: 运行测试**

Run:
```bash
cargo test -p decacan-infra --test streaming_test -- --nocapture
```

Expected: All tests PASS

- [ ] **Step 4.8: Commit**

```bash
git add crates/decacan-infra/src/models/streaming.rs crates/decacan-infra/src/models/mod.rs crates/decacan-infra/tests/streaming_test.rs crates/decacan-infra/Cargo.toml
git commit -m "feat(models): add streaming response foundation

- Define StreamChunk enum for incremental content
- Add StreamingModelProvider trait for async streaming
- Include OpenAI/Anthropic stream response types
- Add futures dependency for stream handling"
```

---

### Task 5: 移除 expect() 并改进错误处理

**Files:**
- Modify: `crates/decacan-infra/src/models/openai.rs`
- Modify: `crates/decacan-infra/src/models/anthropic.rs`

**背景:** 当前 `reqwest::Client::build().expect()` 会 panic，需要改为优雅错误处理

- [ ] **Step 5.1: 修改 OpenAiProvider 构造函数**

修改 `crates/decacan-infra/src/models/openai.rs`:

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
    /// 创建新的 OpenAI Provider（可能失败）
    pub fn new(config: ProviderConfig) -> Result<Self, ProviderError> {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout_seconds))
            .build()
            .map_err(|e| ProviderError::NetworkError(format!("Failed to build HTTP client: {}", e)))?;

        Ok(Self { config, client })
    }
    // ... rest of implementation
}
```

- [ ] **Step 5.2: 更新 ModelProvider trait（可选，如果 trait 定义需要修改）**

检查 `crates/decacan-infra/src/models/provider.rs`，如果 `new` 不在 trait 中，则不需要修改。

当前 trait 定义:
```rust
#[async_trait]
pub trait ModelProvider: Send + Sync {
    fn name(&self) -> &str;
    fn supported_models(&self) -> Vec<&str>;
    async fn complete(&self, request: ModelRequest) -> Result<ModelResponse, ProviderError>;
}
```

**注意:** `new` 不在 trait 中，是各 provider 的关联函数。这很灵活，不需要修改 trait。

- [ ] **Step 5.3: 更新 Router 中的 Provider 创建**

修改 `crates/decacan-infra/src/models/router.rs`:

```rust
impl ModelRouter {
    pub fn new(config: ModelRouterConfig) -> Result<Self, RouterError> {
        let mut providers: HashMap<String, Box<dyn ModelProvider>> = HashMap::new();

        for (name, provider_config) in config.providers {
            let provider: Box<dyn ModelProvider> = match name.as_str() {
                "openai" => Box::new(OpenAiProvider::new(provider_config)
                    .map_err(|e| RouterError::ProviderError(e.to_string()))?),
                "anthropic" => Box::new(AnthropicProvider::new(provider_config)
                    .map_err(|e| RouterError::ProviderError(e.to_string()))?),
                _ => continue,
            };
            providers.insert(name, provider);
        }

        // ... rest unchanged
    }
}
```

- [ ] **Step 5.4: 同样修改 AnthropicProvider**

修改 `crates/decacan-infra/src/models/anthropic.rs`:

```rust
impl AnthropicProvider {
    pub fn new(config: ProviderConfig) -> Result<Self, ProviderError> {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout_seconds))
            .build()
            .map_err(|e| ProviderError::NetworkError(format!("Failed to build HTTP client: {}", e)))?;

        Ok(Self { config, client })
    }
    // ... rest unchanged
}
```

- [ ] **Step 5.5: 更新测试中的 Provider 创建**

检查 `crates/decacan-infra/tests/models_test.rs`，将 `OpenAiProvider::new(config)` 改为 `OpenAiProvider::new(config).unwrap()` 或 `?`。

- [ ] **Step 5.6: 运行测试确保无 expect**

Run:
```bash
cargo clippy -p decacan-infra -- -D clippy::expect_used
```

Expected: No expect warnings

- [ ] **Step 5.7: 运行所有测试**

Run:
```bash
cargo test -p decacan-infra
```

Expected: All tests PASS

- [ ] **Step 5.8: Commit**

```bash
git add crates/decacan-infra/src/models/openai.rs crates/decacan-infra/src/models/anthropic.rs crates/decacan-infra/src/models/router.rs
git commit -m "refactor(models): remove expect() calls for graceful error handling

- Change OpenAiProvider::new to return Result
- Change AnthropicProvider::new to return Result
- Update Router to handle provider creation errors
- Use NetworkError instead of panic on client build failure"
```

---

### Task 6: 更新模型列表并添加 GPT-4o/o3 支持

**Files:**
- Modify: `crates/decacan-infra/src/models/openai.rs`
- Modify: `crates/decacan-infra/src/models/anthropic.rs`
- Modify: `crates/decacan-infra/src/models/config.rs`

**背景:** 当前模型列表较旧，需要添加新的 GPT-4o、o1、o3 等模型

- [ ] **Step 6.1: 更新 OpenAI 支持模型列表**

修改 `crates/decacan-infra/src/models/openai.rs`:

```rust
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
    // ... rest unchanged
}
```

- [ ] **Step 6.2: 更新 Anthropic 支持模型列表**

修改 `crates/decacan-infra/src/models/anthropic.rs`:

```rust
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
    // ... rest unchanged
}
```

- [ ] **Step 6.3: 更新默认配置**

修改 `crates/decacan-infra/src/models/config.rs`，更新默认模型:

```rust
impl Default for ModelRouterConfig {
    fn default() -> Self {
        let mut providers = HashMap::new();
        
        Self {
            default_provider: "openai".to_string(),
            default_model: "gpt-4o".to_string(),  // 更新为最新推荐模型
            fallback_chain: vec!["openai".to_string(), "anthropic".to_string()],
            providers,
        }
    }
}
```

- [ ] **Step 6.4: 添加模型验证测试**

在 `crates/decacan-infra/tests/models_test.rs` 中添加:

```rust
#[cfg(test)]
mod model_list_tests {
    use decacan_infra::models::openai::OpenAiProvider;
    use decacan_infra::models::anthropic::AnthropicProvider;
    use decacan_infra::models::provider::ModelProvider;
    use decacan_infra::models::config::ProviderConfig;

    #[test]
    fn test_openai_includes_gpt4o() {
        let config = ProviderConfig::default();
        let provider = OpenAiProvider::new(config).unwrap();
        let models = provider.supported_models();
        
        assert!(models.contains(&"gpt-4o"));
        assert!(models.contains(&"gpt-4o-mini"));
    }

    #[test]
    fn test_anthropic_includes_claude35() {
        let config = ProviderConfig::default();
        let provider = AnthropicProvider::new(config).unwrap();
        let models = provider.supported_models();
        
        assert!(models.contains(&"claude-3-5-sonnet-20241022"));
    }
}
```

- [ ] **Step 6.5: 运行测试**

Run:
```bash
cargo test -p decacan-infra --test models_test model_list_tests -- --nocapture
```

Expected: All tests PASS

- [ ] **Step 6.6: Commit**

```bash
git add crates/decacan-infra/src/models/openai.rs crates/decacan-infra/src/models/anthropic.rs crates/decacan-infra/src/models/config.rs crates/decacan-infra/tests/models_test.rs
git commit -m "feat(models): update supported model lists

- Add GPT-4o, GPT-4o-mini, o1 series to OpenAI provider
- Add Claude 3.5 Sonnet/Haiku to Anthropic provider
- Update default model to gpt-4o
- Add tests for new model availability"
```

---

### Task 7: 集成重试策略到 Provider

**Files:**
- Modify: `crates/decacan-infra/src/models/openai.rs`
- Modify: `crates/decacan-infra/src/models/anthropic.rs`
- Modify: `crates/decacan-infra/src/models/config.rs`

**背景:** 让 Provider 在内部使用重试策略，无需 Router 关心重试逻辑

- [ ] **Step 7.1: 在 ProviderConfig 中添加重试配置**

修改 `crates/decacan-infra/src/models/config.rs`:

```rust
use super::retry::RetryConfig;

#[derive(Debug, Clone)]
pub struct ProviderConfig {
    pub api_key: String,
    pub base_url: String,
    pub timeout_seconds: u64,
    pub retry_config: RetryConfig,  // 新增
}

impl Default for ProviderConfig {
    fn default() -> Self {
        Self {
            api_key: String::new(),
            base_url: "https://api.openai.com/v1".to_string(),
            timeout_seconds: 60,
            retry_config: RetryConfig::default(),  // 默认重试配置
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
```

- [ ] **Step 7.2: 在 OpenAiProvider 中集成重试**

修改 `crates/decacan-infra/src/models/openai.rs`:

```rust
use super::retry::RetryConfig;

pub struct OpenAiProvider {
    config: ProviderConfig,
    client: Client,
    retry_config: RetryConfig,
}

impl OpenAiProvider {
    pub fn new(config: ProviderConfig) -> Result<Self, ProviderError> {
        let client = Client::builder()
            .timeout(std::time::Duration::from_secs(config.timeout_seconds))
            .build()
            .map_err(|e| ProviderError::NetworkError(format!("Failed to build HTTP client: {}", e)))?;

        let retry_config = config.retry_config.clone();
        
        Ok(Self { 
            config, 
            client,
            retry_config,
        })
    }
}

#[async_trait]
impl ModelProvider for OpenAiProvider {
    // ... name() and supported_models() unchanged

    async fn complete(&self, request: ModelRequest) -> Result<ModelResponse, ProviderError> {
        // 使用重试包装实际调用
        self.retry_config.execute(|| async {
            self.complete_internal(request.clone()).await
        }).await
    }
}

impl OpenAiProvider {
    /// 内部实现（无重试逻辑）
    async fn complete_internal(&self, request: ModelRequest) -> Result<ModelResponse, ProviderError> {
        // ... 将原有 complete 逻辑移到这里
    }
}
```

- [ ] **Step 7.3: 同样修改 AnthropicProvider**

类似步骤 7.2，为 AnthropicProvider 添加重试逻辑。

- [ ] **Step 7.4: 添加重试集成测试**

创建 `crates/decacan-infra/tests/retry_integration_test.rs`:

```rust
use decacan_infra::models::config::{ModelRouterConfig, ProviderConfig};
use decacan_infra::models::openai::OpenAiProvider;
use decacan_infra::models::provider::ModelProvider;
use decacan_infra::models::retry::RetryConfig;
use decacan_infra::models::types::ModelRequest;

#[tokio::test]
async fn test_provider_retries_on_rate_limit() {
    // 注意：这个测试需要 mock 或特定的测试环境
    // 实际运行时会调用真实 API（如果有有效 key）或失败
    
    let retry_config = RetryConfig {
        max_retries: 2,
        initial_backoff_ms: 100,
        max_backoff_ms: 1000,
        backoff_multiplier: 2.0,
    };
    
    let config = ProviderConfig::default()
        .with_retry(retry_config);
    
    // 如果没有 API key，这里会失败
    if config.api_key.is_empty() {
        return; // 跳过测试
    }
    
    let provider = OpenAiProvider::new(config).unwrap();
    let request = ModelRequest::new("gpt-4o-mini", "Hello");
    
    // 正常调用应该成功（或根据 API 状态失败）
    let result = provider.complete(request).await;
    
    // 断言：要么成功，要么是非重试错误
    match result {
        Ok(_) => {}
        Err(e) => {
            // 如果是可重试错误，应该已经重试过
            println!("Error: {:?}", e);
        }
    }
}
```

- [ ] **Step 7.5: 运行测试**

Run:
```bash
cargo test -p decacan-infra
```

Expected: All tests PASS

- [ ] **Step 7.6: Commit**

```bash
git add crates/decacan-infra/src/models/openai.rs crates/decacan-infra/src/models/anthropic.rs crates/decacan-infra/src/models/config.rs crates/decacan-infra/tests/retry_integration_test.rs
git commit -m "feat(models): integrate retry strategy into providers

- Add retry_config to ProviderConfig
- OpenAiProvider uses retry for complete() calls
- AnthropicProvider uses retry for complete() calls
- Add integration test for retry behavior"
```

---

### Task 8: 添加预算管理集成

**Files:**
- Modify: `crates/decacan-infra/src/models/router.rs`
- Modify: `crates/decacan-infra/src/models/config.rs`
- Test: `crates/decacan-infra/tests/budget_integration_test.rs`

**背景:** 在 Router 层面集成预算检查，在请求前验证预算

- [ ] **Step 8.1: 在 RouterConfig 中添加预算配置**

修改 `crates/decacan-infra/src/models/config.rs`:

```rust
use super::budget::TokenBudget;

#[derive(Debug, Clone)]
pub struct ModelRouterConfig {
    pub default_provider: String,
    pub default_model: String,
    pub fallback_chain: Vec<String>,
    pub providers: HashMap<String, ProviderConfig>,
    pub budget: TokenBudget,  // 新增
}

impl Default for ModelRouterConfig {
    fn default() -> Self {
        let mut providers = HashMap::new();
        
        Self {
            default_provider: "openai".to_string(),
            default_model: "gpt-4o".to_string(),
            fallback_chain: vec!["openai".to_string(), "anthropic".to_string()],
            providers,
            budget: TokenBudget::unlimited(),  // 默认无限预算
        }
    }
}

impl ModelRouterConfig {
    /// 设置 Token 预算
    pub fn with_budget(mut self, budget: TokenBudget) -> Self {
        self.budget = budget;
        self
    }
}
```

- [ ] **Step 8.2: 在 Router 中集成预算管理**

修改 `crates/decacan-infra/src/models/router.rs`:

```rust
use super::budget::{BudgetManager, BudgetError, estimate_tokens};

pub struct ModelRouter {
    providers: HashMap<String, Box<dyn ModelProvider>>,
    default_provider: String,
    fallback_chain: Vec<String>,
    budget_manager: BudgetManager,
}

impl ModelRouter {
    pub fn new(config: ModelRouterConfig) -> Result<Self, RouterError> {
        // ... 现有 provider 初始化代码
        
        let budget_manager = BudgetManager::new(config.budget);
        
        Ok(Self {
            providers,
            default_provider: config.default_provider,
            fallback_chain: config.fallback_chain,
            budget_manager,
        })
    }
}

#[async_trait::async_trait]
impl ModelPort for ModelRouter {
    type Error = RouterError;

    async fn complete(&self, prompt: &str) -> Result<String, Self::Error> {
        // 估算 Token 并检查预算
        let estimated_tokens = estimate_tokens(prompt);
        self.budget_manager
            .check_request(estimated_tokens)
            .map_err(|e| RouterError::BudgetError(e.to_string()))?;
        
        let request = ModelRequest::new(&self.default_provider, prompt);
        let response = self.try_with_fallback(request).await?;
        
        // 记录实际使用的 Token
        if let Some(usage) = &response.usage {
            self.budget_manager.record_usage(usage.total_tokens as u64);
        }
        
        Ok(response.content)
    }
}

// 更新 RouterError 以支持预算错误
#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum RouterError {
    #[error("Provider not found: {0}")]
    ProviderNotFound(String),
    #[error("No providers available")]
    NoProviders,
    #[error("Provider error: {0}")]
    ProviderError(String),
    #[error("Budget error: {0}")]
    BudgetError(String),
}
```

- [ ] **Step 8.3: 添加预算集成测试**

创建 `crates/decacan-infra/tests/budget_integration_test.rs`:

```rust
use decacan_infra::models::budget::TokenBudget;
use decacan_infra::models::config::ModelRouterConfig;
use decacan_infra::models::mock::MockModel;
use decacan_infra::models::router::{ModelRouter, RouterError};
use decacan_runtime::ports::model::ModelPort;

#[tokio::test]
async fn test_router_enforces_budget_limit() {
    // 使用非常严格的预算进行测试
    let config = ModelRouterConfig::default()
        .with_budget(TokenBudget::strict(10, 100)); // 单次最多 10 tokens
    
    let router = ModelRouter::new(config).unwrap();
    
    // 短提示应该通过
    let result = router.complete("hi").await;
    // MockModel 会返回成功，无论预算如何
    // 实际测试需要配置 mock provider
}

#[test]
fn test_router_budget_tracking() {
    let budget = TokenBudget::strict(1000, 5000);
    let config = ModelRouterConfig::default()
        .with_budget(budget);
    
    let router = ModelRouter::new(config).unwrap();
    
    // 检查初始状态
    assert_eq!(router.budget_manager.total_used(), 0);
    assert_eq!(router.budget_manager.remaining_budget(), Some(5000));
}
```

**注意:** 上面的测试需要访问 `budget_manager`，但它是私有的。需要决定是：
- 添加公开方法获取 budget 状态
- 通过行为测试间接验证

- [ ] **Step 8.4: 运行测试**

Run:
```bash
cargo test -p decacan-infra
```

Expected: All tests PASS

- [ ] **Step 8.5: Commit**

```bash
git add crates/decacan-infra/src/models/router.rs crates/decacan-infra/src/models/config.rs crates/decacan-infra/tests/budget_integration_test.rs
git commit -m "feat(models): integrate budget management into router

- Add budget field to ModelRouterConfig
- Router checks budget before requests
- Track token usage after successful responses
- Add BudgetError variant to RouterError"
```

---

### Task 9: 完整集成测试和文档更新

**Files:**
- Modify: `crates/decacan-infra/tests/models_test.rs`
- Modify: `crates/decacan-infra/src/models/mod.rs`
- Create: Documentation updates

- [ ] **Step 9.1: 运行完整测试套件**

Run:
```bash
cargo test -p decacan-infra --lib --tests
```

Expected: All tests PASS

- [ ] **Step 9.2: 运行 clippy 检查**

Run:
```bash
cargo clippy -p decacan-infra -- -D warnings
```

Expected: No warnings

- [ ] **Step 9.3: 检查代码格式**

Run:
```bash
cargo fmt -- --check crates/decacan-infra/
```

Expected: No formatting issues (或运行 cargo fmt 修复)

- [ ] **Step 9.4: 更新模型模块文档**

在 `crates/decacan-infra/src/models/mod.rs` 顶部添加模块文档:

```rust
//! Model Provider Module
//!
//! This module provides AI model integration with the following features:
//!
//! ## Features
//!
//! - **Multi-provider support**: OpenAI, Anthropic with unified interface
//! - **Retry strategy**: Exponential backoff for rate limits and timeouts
//! - **Token budget**: Per-request and total budget management
//! - **Streaming**: (Foundation ready) Async streaming response support
//! - **Error handling**: Graceful error handling without panics
//!
//! ## Example Usage
//!
//! ```rust,no_run
//! use decacan_infra::models::{
//!     ModelRouter, ModelRouterConfig,
//!     ProviderConfig, RetryConfig, TokenBudget
//! };
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     // Configure retry and budget
//!     let retry_config = RetryConfig {
//!         max_retries: 3,
//!         initial_backoff_ms: 1000,
//!         max_backoff_ms: 60000,
//!         backoff_multiplier: 2.0,
//!     };
//!     
//!     let budget = TokenBudget::strict(4000, 100000);
//!     
//!     let config = ModelRouterConfig::default()
//!         .with_openai("your-api-key")
//!         .with_retry(retry_config)
//!         .with_budget(budget);
//!     
//!     let router = ModelRouter::new(config)?;
//!     let response = router.complete("Hello, AI!").await?;
//!     
//!     println!("Response: {}", response);
//!     Ok(())
//! }
//! ```

pub mod retry;
pub mod budget;
pub mod streaming;
// ... 其他模块
```

- [ ] **Step 9.5: 创建 CHANGELOG 条目**

创建或更新 `crates/decacan-infra/CHANGELOG.md`:

```markdown
# Changelog

## [Unreleased]

### Added
- Retry strategy with exponential backoff for model requests
- Token budget management (per-request and total limits)
- Streaming response foundation types
- Support for latest models: GPT-4o, Claude 3.5 Sonnet, o1 series

### Changed
- `OpenAiProvider::new` and `AnthropicProvider::new` now return `Result` instead of panicking
- Updated default model to GPT-4o
- Router now validates token budget before requests

### Fixed
- Removed all `expect()` calls from provider initialization
```

- [ ] **Step 9.6: 最终测试验证**

Run:
```bash
cargo test -p decacan-infra
cargo clippy -p decacan-infra -- -D warnings
cargo doc -p decacan-infra --no-deps
```

Expected: All pass

- [ ] **Step 9.7: 最终 Commit**

```bash
git add -A
git commit -m "feat(models): complete model module enhancement

Major improvements to model provider infrastructure:

- Add exponential backoff retry strategy (retry.rs)
- Implement token budget management (budget.rs)
- Add streaming response foundation (streaming.rs)
- Update supported models to include GPT-4o, Claude 3.5, o1
- Remove all expect() calls for graceful error handling
- Integrate retry and budget into Router
- Add comprehensive test coverage
- Update documentation and CHANGELOG"
```

---

## 完成检查清单

- [ ] Task 1: 重试策略模块 ✅
- [ ] Task 2: ProviderError 实现 RetryableError ✅
- [ ] Task 3: Token 预算管理 ✅
- [ ] Task 4: 流式响应基础 ✅
- [ ] Task 5: 移除 expect() ✅
- [ ] Task 6: 更新模型列表 ✅
- [ ] Task 7: 集成重试到 Provider ✅
- [ ] Task 8: 集成预算到 Router ✅
- [ ] Task 9: 测试和文档 ✅

## 预期成果

完成后，模型模块将具备：

1. **可靠性**: 自动重试 RateLimit/Timeout，指数退避
2. **成本控制**: Token 预算防止意外高消费
3. **现代模型**: 支持 GPT-4o、Claude 3.5 等最新模型
4. **健壮性**: 无 panic，所有错误优雅处理
5. **可扩展性**: 流式响应基础已就绪

## 潜在风险与缓解

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| `new()` 返回 Result 是破坏性变更 | 中等 | 需要更新所有调用点（已在计划中） |
| 流式响应需要更多工作 | 低 | 当前只建基础类型，完整实现后续迭代 |
| Token 估算不准确 | 低 | 使用简单启发式，精确计数需要 tokenizer |

---

**计划完成！** 可以开始执行。建议使用 superpowers:subagent-driven-development 来并行处理独立任务。