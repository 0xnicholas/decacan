use decacan_infra::models::retry::{RetryConfig, RetryableError};
use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;

#[derive(Debug, Clone)]
struct TestError {
    retryable: bool,
}

impl RetryableError for TestError {
    fn is_retryable(&self) -> bool {
        self.retryable
    }
}

#[tokio::test]
async fn test_retry_success_after_failures() {
    let config = RetryConfig {
        max_retries: 3,
        initial_backoff_ms: 10,
        max_backoff_ms: 100,
        backoff_multiplier: 1.5,
    };
    
    let attempts = Arc::new(AtomicUsize::new(0));
    let attempts_clone = attempts.clone();
    
    let result = config.execute(|| async {
        let count = attempts_clone.fetch_add(1, Ordering::SeqCst);
        if count < 2 {
            Err(TestError { retryable: true })
        } else {
            Ok("success")
        }
    }).await;
    
    assert_eq!(result.unwrap(), "success");
    assert_eq!(attempts.load(Ordering::SeqCst), 3);
}

#[tokio::test]
async fn test_no_retry_for_non_retryable_error() {
    let config = RetryConfig::default();
    let attempts = Arc::new(AtomicUsize::new(0));
    let attempts_clone = attempts.clone();
    
    let result: Result<(), TestError> = config.execute(|| async {
        attempts_clone.fetch_add(1, Ordering::SeqCst);
        Err(TestError { retryable: false })
    }).await;
    
    assert!(result.is_err());
    assert_eq!(attempts.load(Ordering::SeqCst), 1); // 只尝试一次
}
