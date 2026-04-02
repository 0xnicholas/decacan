use serde::{Deserialize, Serialize};
use std::time::Duration;

/// 重试策略配置
#[derive(Debug, Clone, Copy, PartialEq, Serialize, Deserialize)]
pub struct RetryConfig {
    /// 最大重试次数
    pub max_retries: u32,
    /// 初始退避时间（毫秒）
    pub initial_backoff_ms: u64,
    /// 最大退避时间（毫秒）
    pub max_backoff_ms: u64,
    /// 退避乘数
    pub backoff_multiplier: f64,
}

impl Default for RetryConfig {
    fn default() -> Self {
        Self {
            max_retries: 3,
            initial_backoff_ms: 1000,
            max_backoff_ms: 60000,
            backoff_multiplier: 2.0,
        }
    }
}

/// 可重试的错误 trait
pub trait RetryableError {
    /// 判断错误是否可重试
    fn is_retryable(&self) -> bool;
}

impl RetryConfig {
    /// 计算第 n 次重试的等待时间
    pub fn backoff_duration(&self, attempt: u32) -> Duration {
        let exponent = attempt as f64;
        let backoff_ms = (self.initial_backoff_ms as f64 * self.backoff_multiplier.powf(exponent))
            .min(self.max_backoff_ms as f64) as u64;
        Duration::from_millis(backoff_ms)
    }
    
    /// 为可重试错误创建重试 future
    pub async fn execute<F, Fut, T, E>(&self, operation: F) -> Result<T, E>
    where
        F: Fn() -> Fut,
        Fut: std::future::Future<Output = Result<T, E>>,
        E: RetryableError + std::fmt::Debug,
    {
        let mut last_error = None;
        
        for attempt in 0..=self.max_retries {
            match operation().await {
                Ok(result) => return Ok(result),
                Err(e) if !e.is_retryable() => return Err(e),
                Err(e) => {
                    last_error = Some(e);
                    if attempt < self.max_retries {
                        let delay = self.backoff_duration(attempt);
                        tokio::time::sleep(delay).await;
                    }
                }
            }
        }
        
        Err(last_error.unwrap())
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_default_retry_config() {
        let config = RetryConfig::default();
        assert_eq!(config.max_retries, 3);
        assert_eq!(config.initial_backoff_ms, 1000);
        assert_eq!(config.max_backoff_ms, 60000);
        assert_eq!(config.backoff_multiplier, 2.0);
    }

    #[test]
    fn test_backoff_calculation() {
        let config = RetryConfig {
            initial_backoff_ms: 100,
            max_backoff_ms: 1000,
            backoff_multiplier: 2.0,
            max_retries: 3,
        };
        
        assert_eq!(config.backoff_duration(0).as_millis(), 100);
        assert_eq!(config.backoff_duration(1).as_millis(), 200);
        assert_eq!(config.backoff_duration(2).as_millis(), 400);
        assert_eq!(config.backoff_duration(10).as_millis(), 1000); // 封顶
    }
}
