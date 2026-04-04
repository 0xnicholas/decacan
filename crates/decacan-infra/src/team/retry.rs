use std::future::Future;
use std::time::Duration;
use tokio::time::sleep;
use thiserror::Error;

#[derive(Debug, Clone, Error)]
pub enum RetryError {
    #[error("transient error: {0}")]
    Transient(String),
    #[error("permanent error: {0}")]
    Permanent(String),
}

#[derive(Debug, Clone, Copy)]
pub struct RetryConfig {
    pub max_attempts: u32,
    pub base_delay_ms: u64,
    pub max_delay_ms: u64,
    pub backoff_multiplier: f64,
}

impl Default for RetryConfig {
    fn default() -> Self {
        Self {
            max_attempts: 3,
            base_delay_ms: 100,
            max_delay_ms: 5000,
            backoff_multiplier: 2.0,
        }
    }
}

#[derive(Debug, Clone)]
pub struct RetryableClient {
    config: RetryConfig,
}

impl RetryableClient {
    pub fn with_config(config: RetryConfig) -> Self {
        Self { config }
    }
    
    pub async fn execute_with_retry<T, F, Fut>(&self, operation: F) -> Result<T, RetryError>
    where
        F: Fn() -> Fut,
        Fut: Future<Output = Result<T, RetryError>>,
    {
        let mut attempts = 0;
        let mut delay_ms = self.config.base_delay_ms;
        
        loop {
            match operation().await {
                Ok(value) => return Ok(value),
                Err(RetryError::Permanent(msg)) => return Err(RetryError::Permanent(msg)),
                Err(RetryError::Transient(msg)) => {
                    attempts += 1;
                    if attempts >= self.config.max_attempts {
                        return Err(RetryError::Transient(format!(
                            "exhausted {} attempts, last error: {}",
                            self.config.max_attempts, msg
                        )));
                    }
                    sleep(Duration::from_millis(delay_ms)).await;
                    delay_ms = ((delay_ms as f64 * self.config.backoff_multiplier) as u64)
                        .min(self.config.max_delay_ms);
                }
            }
        }
    }
}