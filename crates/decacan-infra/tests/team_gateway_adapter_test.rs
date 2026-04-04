use std::sync::atomic::{AtomicUsize, Ordering};
use std::sync::Arc;
use std::time::Duration;
use decacan_infra::team::retry::{RetryConfig, RetryableClient, RetryError};

#[tokio::test]
async fn retry_succeeds_on_second_attempt() {
    let config = RetryConfig {
        max_attempts: 3,
        base_delay_ms: 10,
        max_delay_ms: 100,
        backoff_multiplier: 2.0,
    };
    
    let attempts = Arc::new(AtomicUsize::new(0));
    let attempts_clone = attempts.clone();
    
    let result = RetryableClient::with_config(config).execute_with_retry(move || {
        let attempts = attempts_clone.clone();
        async move {
            let count = attempts.fetch_add(1, Ordering::SeqCst) + 1;
            if count < 2 {
                Err(RetryError::Transient("temporary failure".to_string()))
            } else {
                Ok("success")
            }
        }
    }).await;
    
    assert!(result.is_ok());
    assert_eq!(attempts.load(Ordering::SeqCst), 2);
}

#[tokio::test]
async fn retry_exhausts_max_attempts() {
    let config = RetryConfig {
        max_attempts: 3,
        base_delay_ms: 10,
        max_delay_ms: 100,
        backoff_multiplier: 2.0,
    };
    
    let attempts = Arc::new(AtomicUsize::new(0));
    let attempts_clone = attempts.clone();
    
    let result = RetryableClient::with_config(config).execute_with_retry(move || {
        let attempts = attempts_clone.clone();
        async move {
            attempts.fetch_add(1, Ordering::SeqCst);
            Err::<String, _>(RetryError::Transient("always fails".to_string()))
        }
    }).await;
    
    assert!(result.is_err());
    assert_eq!(attempts.load(Ordering::SeqCst), 3);
}

#[tokio::test]
async fn non_transient_errors_not_retried() {
    let config = RetryConfig {
        max_attempts: 3,
        base_delay_ms: 10,
        max_delay_ms: 100,
        backoff_multiplier: 2.0,
    };
    
    let attempts = Arc::new(AtomicUsize::new(0));
    let attempts_clone = attempts.clone();
    
    let result = RetryableClient::with_config(config).execute_with_retry(move || {
        let attempts = attempts_clone.clone();
        async move {
            attempts.fetch_add(1, Ordering::SeqCst);
            Err::<String, _>(RetryError::Permanent("fatal error".to_string()))
        }
    }).await;
    
    assert!(result.is_err());
    assert_eq!(attempts.load(Ordering::SeqCst), 1);
}