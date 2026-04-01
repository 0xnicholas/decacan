#[cfg(test)]
mod tests {
    use decacan_infra::secrets::{SecretsPort, SecretsError};
    use std::env;

    #[tokio::test]
    async fn test_secrets_port_get() {
        env::set_var("TEST_SECRET", "test_value");
        
        // 这里我们稍后会有具体实现
        // 现在只是定义测试接口
        
        env::remove_var("TEST_SECRET");
    }

    #[test]
    fn test_secrets_error_display() {
        let err = SecretsError::NotFound("API_KEY".to_string());
        assert!(err.to_string().contains("API_KEY"));
    }
}

#[cfg(test)]
mod env_tests {
    use decacan_infra::secrets::{SecretsPort, env::EnvSecretsSource};
    use std::env;

    #[tokio::test]
    async fn test_env_source_get_existing() {
        env::set_var("MY_SECRET", "secret_value");
        
        let source = EnvSecretsSource::new();
        let result = source.get("MY_SECRET").await.unwrap();
        
        assert_eq!(result, Some("secret_value".to_string()));
        
        env::remove_var("MY_SECRET");
    }

    #[tokio::test]
    async fn test_env_source_get_missing() {
        env::remove_var("NON_EXISTENT_SECRET");
        
        let source = EnvSecretsSource::new();
        let result = source.get("NON_EXISTENT_SECRET").await.unwrap();
        
        assert_eq!(result, None);
    }

    #[tokio::test]
    async fn test_env_source_with_prefix() {
        env::set_var("DECACAN_API_KEY", "prefixed_value");
        
        let source = EnvSecretsSource::with_prefix("DECACAN");
        let result = source.get("API_KEY").await.unwrap();
        
        assert_eq!(result, Some("prefixed_value".to_string()));
        
        env::remove_var("DECACAN_API_KEY");
    }
}
