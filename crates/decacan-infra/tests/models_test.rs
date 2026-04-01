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
        let config = ModelRouterConfig::default().with_openai("sk-test");

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
        let config = ModelRouterConfig::default().with_openai("test-key");

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
