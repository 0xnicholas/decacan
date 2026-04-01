#[cfg(test)]
mod tests {
    use decacan_infra::config::{ConfigError, InfraConfig};

    #[test]
    fn test_default_config_has_profile() {
        let config = InfraConfig::default();
        assert_eq!(config.profile, "dev");
    }

    #[test]
    fn test_config_from_yaml() {
        let yaml = r#"
profile: production
"#;
        let config: InfraConfig = serde_yaml::from_str(yaml).unwrap();
        assert_eq!(config.profile, "production");
    }
}

#[cfg(test)]
mod loader_tests {
    use decacan_infra::config::ConfigLoader;
    use std::env;

    #[test]
    fn test_load_from_default() {
        // 清除可能影响测试的环境变量
        env::remove_var("DECACAN_PROFILE");

        let loader = ConfigLoader::new();
        let config = loader.load().unwrap();

        assert_eq!(config.profile, "dev");
    }

    #[test]
    fn test_load_from_env() {
        env::set_var("DECACAN_PROFILE", "production");

        let loader = ConfigLoader::new();
        let config = loader.load().unwrap();

        assert_eq!(config.profile, "production");

        // 清理
        env::remove_var("DECACAN_PROFILE");
    }
}
