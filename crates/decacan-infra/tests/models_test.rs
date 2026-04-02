mod retryable_tests {
    use decacan_infra::models::provider::ProviderError;
    use decacan_infra::models::retry::RetryableError;

    #[test]
    fn test_rate_limit_is_retryable() {
        let err = ProviderError::RateLimitError("rate limit exceeded".to_string());
        assert!(err.is_retryable(), "RateLimitError should be retryable");
    }

    #[test]
    fn test_timeout_is_retryable() {
        let err = ProviderError::TimeoutError("request timeout".to_string());
        assert!(err.is_retryable(), "TimeoutError should be retryable");
    }

    #[test]
    fn test_auth_error_is_not_retryable() {
        let err = ProviderError::AuthenticationError("invalid API key".to_string());
        assert!(
            !err.is_retryable(),
            "AuthenticationError should not be retryable"
        );
    }

    #[test]
    fn test_api_error_is_not_retryable() {
        let err = ProviderError::ApiError("bad request".to_string());
        assert!(!err.is_retryable(), "ApiError should not be retryable");
    }
}

mod model_list_tests {
    use decacan_infra::models::anthropic::AnthropicProvider;
    use decacan_infra::models::config::ProviderConfig;
    use decacan_infra::models::openai::OpenAiProvider;
    use decacan_infra::models::provider::ModelProvider;

    #[test]
    fn test_openai_includes_gpt4o() {
        let config = ProviderConfig {
            api_key: "test".to_string(),
            base_url: "https://api.openai.com/v1".to_string(),
            default_model: None,
            timeout_seconds: 60,
        };
        let provider = OpenAiProvider::new(config).unwrap();
        let models = provider.supported_models();

        assert!(models.contains(&"gpt-4o"));
        assert!(models.contains(&"gpt-4o-mini"));
    }

    #[test]
    fn test_anthropic_includes_claude35() {
        let config = ProviderConfig {
            api_key: "test".to_string(),
            base_url: "https://api.anthropic.com/v1".to_string(),
            default_model: None,
            timeout_seconds: 60,
        };
        let provider = AnthropicProvider::new(config).unwrap();
        let models = provider.supported_models();

        assert!(models.contains(&"claude-3-5-sonnet-20241022"));
    }
}
