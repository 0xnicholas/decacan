use async_trait::async_trait;

#[async_trait]
pub trait ModelPort: Send + Sync {
    type Error;

    async fn complete(&self, prompt: &str) -> Result<String, Self::Error>;
}
