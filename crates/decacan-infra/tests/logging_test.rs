#[cfg(test)]
mod config_tests {
    use decacan_infra::logging::LoggingConfig;

    #[test]
    fn test_default_config() {
        let config = LoggingConfig::default();
        assert_eq!(config.level, "info");
        assert!(config.stdout);
        assert!(!config.file.enabled);
    }

    #[test]
    fn test_config_from_yaml() {
        let yaml = r#"
level: debug
stdout: true
file:
  enabled: true
  path: logs/app.log
  rotation: daily
  max_files: 7
"#;
        let config: LoggingConfig = serde_yaml::from_str(yaml).unwrap();
        assert_eq!(config.level, "debug");
        assert!(config.file.enabled);
        assert_eq!(config.file.path, "logs/app.log");
    }
}

#[cfg(test)]
mod usage_tests {
    use decacan_infra::logging::{debug, error, info, trace, warn};

    #[test]
    fn test_log_macros_available() {
        // 这些宏应该可以编译和使用
        // 注意：如果没有初始化订阅者，日志会静默丢弃
        trace!("trace message");
        debug!("debug message");
        info!("info message");
        warn!("warn message");
        error!("error message");
    }

    #[test]
    fn test_log_with_fields() {
        let user_id = "user-123";
        let action = "login";

        info!(%user_id, %action, "User performed action");
    }
}
