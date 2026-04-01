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
