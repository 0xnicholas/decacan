use async_trait::async_trait;

#[async_trait]
pub trait StoragePort: Send + Sync {
    type Error;

    async fn put(&self, key: &str, value: &str) -> Result<(), Self::Error>;
    async fn get(&self, key: &str) -> Result<Option<String>, Self::Error>;
}
