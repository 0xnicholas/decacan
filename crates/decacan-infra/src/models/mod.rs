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
//!     TokenBudget
//! };
//!
//! #[tokio::main]
//! async fn main() -> Result<(), Box<dyn std::error::Error>> {
//!     // Configure token budget
//!     let budget = TokenBudget::strict(4000, 100000);
//!     
//!     let config = ModelRouterConfig::default()
//!         .with_openai("your-api-key")
//!         .with_budget(budget);
//!     
//!     let router = ModelRouter::new(config)?;
//!     let response = router.complete("Hello, AI!").await?;
//!     
//!     println!("Response: {}", response);
//!     Ok(())
//! }
//! ```

pub mod anthropic;
pub mod budget;
pub mod config;
pub mod openai;
pub mod provider;
pub mod retry;
pub mod router;
pub mod streaming;
pub mod types;

pub use anthropic::AnthropicProvider;
pub use budget::{BudgetError, BudgetManager, TokenBudget, estimate_tokens};
pub use config::{ModelRouterConfig, ProviderConfig};
pub use openai::OpenAiProvider;
pub use provider::{ModelProvider, ProviderError};
pub use retry::{RetryConfig, RetryableError};
pub use router::{ModelRouter, RouterError};
pub use streaming::StreamChunk;
pub use types::{Message, ModelRequest, ModelResponse, Role, Usage};
