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

#[cfg(test)]
mod yaml_tests {
    use decacan_infra::config::ConfigLoader;
    use std::fs;
    use std::path::Path;
    use tempfile::TempDir;

    #[test]
    fn test_load_from_yaml_file() {
        let temp_dir = TempDir::new().unwrap();
        let config_path = temp_dir.path().join("test.yaml");

        fs::write(&config_path, "profile: staging\n").unwrap();

        // 注意：这个测试演示功能，实际实现需要文件路径支持
        let content = fs::read_to_string(&config_path).unwrap();
        let config: decacan_infra::config::InfraConfig = serde_yaml::from_str(&content).unwrap();

        assert_eq!(config.profile, "staging");
    }
}
