#[cfg(test)]
mod tests {
    use decacan_infra::storage::postgres::PostgresStorage;
    use decacan_infra::config::PostgresConfig;

    // 注意：这些测试需要运行 PostgreSQL 实例
    // 使用 #[ignore] 标记，需要显式运行: cargo test -- --ignored

    #[tokio::test]
    #[ignore]
    async fn test_postgres_storage_put_and_get() {
        let config = PostgresConfig::for_development();
        let storage = PostgresStorage::new(&config).await.unwrap();

        // 测试 put
        storage.put("test_key", "test_value").await.unwrap();

        // 测试 get
        let value = storage.get("test_key").await.unwrap();
        assert_eq!(value, Some("test_value".to_string()));

        // 清理
        storage.delete("test_key").await.ok();
    }

    #[tokio::test]
    #[ignore]
    async fn test_postgres_storage_get_missing() {
        let config = PostgresConfig::for_development();
        let storage = PostgresStorage::new(&config).await.unwrap();

        let value = storage.get("non_existent_key").await.unwrap();
        assert_eq!(value, None);
    }
}
