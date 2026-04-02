# Changelog

## [Unreleased]

### Added
- Retry strategy with exponential backoff for model requests (`RetryConfig`, `RetryableError`)
- Token budget management with per-request and total limits (`TokenBudget`, `BudgetManager`)
- Streaming response foundation types (`StreamChunk`, `ModelStream`)
- Support for latest models: GPT-4o, GPT-4o-mini, Claude 3.5 Sonnet, o1 series
- Budget integration in `ModelRouter` with automatic token tracking
- Retry integration in `OpenAiProvider` and `AnthropicProvider`

### Changed
- `OpenAiProvider::new()` and `AnthropicProvider::new()` now return `Result<Self, ProviderError>` instead of panicking
- `ProviderConfig` now includes `retry_config` field
- `ModelRouterConfig` now includes `budget` field
- Updated default models to GPT-4o and Claude 3.5 Sonnet

### Fixed
- Removed all `expect()` calls from provider initialization for graceful error handling
- Added proper error handling for HTTP client creation failures

## Model Enhancement Summary

This release significantly enhances the model module with:

1. **Reliability**: Automatic retry with exponential backoff for rate limits and timeouts
2. **Cost Control**: Token budget management to prevent unexpected high costs
3. **Modern Models**: Support for latest OpenAI and Anthropic models
4. **Robustness**: Zero panic - all errors handled gracefully
5. **Extensibility**: Foundation for streaming response support

### New Modules
- `models::retry` - Retry strategy and configuration
- `models::budget` - Token budget management
- `models::streaming` - Streaming response types

### Usage Example

```rust
use decacan_infra::models::{
    ModelRouter, ModelRouterConfig,
    RetryConfig, TokenBudget
};

let config = ModelRouterConfig::default()
    .with_openai("your-api-key")
    .with_budget(TokenBudget::strict(4000, 100000))
    .with_retry(RetryConfig {
        max_retries: 3,
        initial_backoff_ms: 1000,
        max_backoff_ms: 60000,
        backoff_multiplier: 2.0,
    });

let router = ModelRouter::new(config)?;
let response = router.complete("Hello, AI!").await?;
```
