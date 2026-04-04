//! Retry logic with exponential backoff and jitter.
//!
//! Provides configurable retry strategies for transient failures.
//!
//! # Example
//! ```
//! use decacan_infra::team::retry::{RetryConfig, RetryableClient, RetryError};
//! use std::time::Duration;
//!
//! async fn example() -> Result<String, RetryError> {
//!     let config = RetryConfig {
//!         max_attempts: 3,
//!         base_delay_ms: 100,
//!         max_delay_ms: 5000,
//!         backoff_multiplier: 2.0,
//!         jitter: true,  // Enable jitter to prevent thundering herd
//!     };
//!
//!     let client = RetryableClient::with_config(config);
//!     
//!     client.execute_with_retry(|| async {
//!         // Your operation here
//!         Ok("success".to_string())
//!     }).await
//! }
//! ```

use std::future::Future;
use std::time::Duration;
use tokio::time::sleep;
use thiserror::Error;
use rand::Rng;

/// Error types for retry operations.
///
/// Distinguishes between transient errors (should retry) and
/// permanent errors (should fail immediately).
#[derive(Debug, Clone, Error)]
pub enum RetryError {
    /// A transient error that may succeed on retry.
    #[error("transient error: {0}")]
    Transient(String),
    /// A permanent error that should not be retried.
    #[error("permanent error: {0}")]
    Permanent(String),
}

impl RetryError {
    /// Create a transient error.
    pub fn transient(msg: impl Into<String>) -> Self {
        Self::Transient(msg.into())
    }

    /// Create a permanent error.
    pub fn permanent(msg: impl Into<String>) -> Self {
        Self::Permanent(msg.into())
    }
}

/// Configuration for retry behavior.
///
/// Controls the number of attempts, delay between retries,
/// and whether to add random jitter.
#[derive(Debug, Clone, Copy)]
pub struct RetryConfig {
    /// Maximum number of retry attempts (default: 3)
    pub max_attempts: u32,
    /// Initial delay in milliseconds (default: 100)
    pub base_delay_ms: u64,
    /// Maximum delay in milliseconds (default: 5000)
    pub max_delay_ms: u64,
    /// Multiplier for exponential backoff (default: 2.0)
    pub backoff_multiplier: f64,
    /// Add random jitter to prevent thundering herd (default: true)
    pub jitter: bool,
}

impl Default for RetryConfig {
    fn default() -> Self {
        Self {
            max_attempts: 3,
            base_delay_ms: 100,
            max_delay_ms: 5000,
            backoff_multiplier: 2.0,
            jitter: true,
        }
    }
}

/// A client that executes operations with retry logic.
///
/// Uses exponential backoff with optional jitter to handle
/// transient failures gracefully.
#[derive(Debug, Clone)]
pub struct RetryableClient {
    config: RetryConfig,
}

impl RetryableClient {
    /// Create a new client with the specified configuration.
    pub fn with_config(config: RetryConfig) -> Self {
        Self { config }
    }

    /// Execute an operation with retry logic.
    ///
    /// The operation will be retried on `RetryError::Transient` errors
    /// up to `max_attempts` times with exponential backoff.
    ///
    /// # Arguments
    /// * `operation` - A closure that returns a Future resolving to Result<T, RetryError>
    ///
    /// # Returns
    /// * `Ok(T)` if the operation succeeds
    /// * `Err(RetryError)` if all attempts fail or a permanent error occurs
    ///
    /// # Example
    /// ```
    /// use decacan_infra::team::retry::{RetryConfig, RetryableClient, RetryError};
    ///
    /// async fn example() -> Result<String, RetryError> {
    ///     let client = RetryableClient::with_config(RetryConfig::default());
    ///     
    ///     client.execute_with_retry(|| async {
    ///         // Simulate an operation that might fail
    ///         if rand::random::<bool>() {
    ///             Ok("success".to_string())
    ///         } else {
    ///             Err(RetryError::transient("temporary failure"))
    ///         }
    ///     }).await
    /// }
    /// ```
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

                    // Calculate delay with exponential backoff
                    let delay = if self.config.jitter {
                        // Add random jitter: delay * (0.5 + random * 0.5)
                        let jitter_factor = 0.5 + rand::thread_rng().gen::<f64>() * 0.5;
                        let jittered_delay = (delay_ms as f64 * jitter_factor) as u64;
                        jittered_delay.min(self.config.max_delay_ms)
                    } else {
                        delay_ms.min(self.config.max_delay_ms)
                    };

                    sleep(Duration::from_millis(delay)).await;

                    // Increase delay for next iteration with overflow protection
                    delay_ms = delay_ms
                        .saturating_mul(self.config.backoff_multiplier as u64)
                        .min(self.config.max_delay_ms);
                }
            }
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::sync::atomic::{AtomicUsize, Ordering};
    use std::sync::Arc;

    #[tokio::test]
    async fn retry_succeeds_immediately_on_success() {
        let client = RetryableClient::with_config(RetryConfig::default());
        let calls = Arc::new(AtomicUsize::new(0));

        let result = client
            .execute_with_retry({
                let calls = calls.clone();
                move || {
                    let calls = calls.clone();
                    async move {
                        calls.fetch_add(1, Ordering::SeqCst);
                        Ok::<_, RetryError>("success")
                    }
                }
            })
            .await;

        assert!(result.is_ok());
        assert_eq!(calls.load(Ordering::SeqCst), 1);
    }

    #[tokio::test]
    async fn retry_succeeds_on_second_attempt() {
        let config = RetryConfig {
            max_attempts: 3,
            base_delay_ms: 10,
            max_delay_ms: 100,
            backoff_multiplier: 2.0,
            jitter: false,
        };
        let client = RetryableClient::with_config(config);
        let calls = Arc::new(AtomicUsize::new(0));

        let result = client
            .execute_with_retry({
                let calls = calls.clone();
                move || {
                    let calls = calls.clone();
                    async move {
                        let attempt = calls.fetch_add(1, Ordering::SeqCst) + 1;
                        if attempt < 2 {
                            Err(RetryError::transient("temporary failure"))
                        } else {
                            Ok::<_, RetryError>("success")
                        }
                    }
                }
            })
            .await;

        assert!(result.is_ok());
        assert_eq!(calls.load(Ordering::SeqCst), 2);
    }

    #[tokio::test]
    async fn retry_exhausts_max_attempts() {
        let config = RetryConfig {
            max_attempts: 3,
            base_delay_ms: 10,
            max_delay_ms: 100,
            backoff_multiplier: 2.0,
            jitter: false,
        };
        let client = RetryableClient::with_config(config);
        let calls = Arc::new(AtomicUsize::new(0));

        let result = client
            .execute_with_retry({
                let calls = calls.clone();
                move || {
                    let calls = calls.clone();
                    async move {
                        calls.fetch_add(1, Ordering::SeqCst);
                        Err::<String, _>(RetryError::transient("always fails"))
                    }
                }
            })
            .await;

        assert!(result.is_err());
        assert_eq!(calls.load(Ordering::SeqCst), 3);
    }

    #[tokio::test]
    async fn non_transient_errors_not_retried() {
        let config = RetryConfig {
            max_attempts: 3,
            base_delay_ms: 10,
            max_delay_ms: 100,
            backoff_multiplier: 2.0,
            jitter: false,
        };
        let client = RetryableClient::with_config(config);
        let calls = Arc::new(AtomicUsize::new(0));

        let result = client
            .execute_with_retry({
                let calls = calls.clone();
                move || {
                    let calls = calls.clone();
                    async move {
                        calls.fetch_add(1, Ordering::SeqCst);
                        Err::<String, _>(RetryError::permanent("fatal error"))
                    }
                }
            })
            .await;

        assert!(result.is_err());
        assert_eq!(calls.load(Ordering::SeqCst), 1); // Only called once
    }

    #[tokio::test]
    async fn retry_with_zero_max_attempts_succeeds_first_try() {
        let config = RetryConfig {
            max_attempts: 0,
            base_delay_ms: 10,
            max_delay_ms: 100,
            backoff_multiplier: 2.0,
            jitter: false,
        };
        let client = RetryableClient::with_config(config);
        let calls = Arc::new(AtomicUsize::new(0));

        // With max_attempts=0, operation is tried once (initial attempt, no retries)
        let result = client
            .execute_with_retry({
                let calls = calls.clone();
                move || {
                    let calls = calls.clone();
                    async move {
                        calls.fetch_add(1, Ordering::SeqCst);
                        Ok::<_, RetryError>("success")
                    }
                }
            })
            .await;

        assert!(result.is_ok());
        assert_eq!(calls.load(Ordering::SeqCst), 1); // Called once for initial attempt
    }

    #[test]
    fn retry_error_convenience_methods() {
        let transient = RetryError::transient("test");
        assert!(matches!(transient, RetryError::Transient(_)));

        let permanent = RetryError::permanent("test");
        assert!(matches!(permanent, RetryError::Permanent(_)));
    }
}