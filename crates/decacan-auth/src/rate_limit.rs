//! Rate limiting module - prevents brute force attacks

use std::collections::HashMap;
use std::sync::Mutex;
use std::time::{Duration, Instant};

/// Login attempt record
#[derive(Debug, Clone)]
struct AttemptRecord {
    count: u32,
    first_attempt: Instant,
    last_attempt: Instant,
}

impl AttemptRecord {
    fn new() -> Self {
        let now = Instant::now();
        Self {
            count: 1,
            first_attempt: now,
            last_attempt: now,
        }
    }

    fn increment(&mut self) {
        self.count += 1;
        self.last_attempt = Instant::now();
    }

    fn is_expired(&self, window: Duration) -> bool {
        self.last_attempt.elapsed() > window
    }

    fn should_block(&self, max_attempts: u32, window: Duration) -> bool {
        self.count >= max_attempts && !self.is_expired(window)
    }
}

/// In-memory rate limiter
#[derive(Debug)]
pub struct RateLimiter {
    attempts: Mutex<HashMap<String, AttemptRecord>>,
    max_attempts: u32,
    window: Duration,
}

impl RateLimiter {
    /// Create a new rate limiter
    ///
    /// # Arguments
    /// * `max_attempts` - Maximum attempts within the time window
    /// * `window` - Time window duration
    pub fn new(max_attempts: u32, window: Duration) -> Self {
        Self {
            attempts: Mutex::new(HashMap::new()),
            max_attempts,
            window,
        }
    }

    /// Check if the identifier should be allowed
    pub fn check(&self, identifier: &str) -> bool {
        let mut attempts = self.attempts.lock().unwrap_or_else(|e| e.into_inner());

        // Clean expired records
        let expired_keys: Vec<String> = attempts
            .iter()
            .filter(|(_, record)| record.is_expired(self.window))
            .map(|(key, _)| key.clone())
            .collect();

        for key in expired_keys {
            attempts.remove(&key);
        }

        // Check if should block
        if let Some(record) = attempts.get(identifier) {
            !record.should_block(self.max_attempts, self.window)
        } else {
            true
        }
    }

    /// Record an attempt
    pub fn record_attempt(&self, identifier: &str) {
        let mut attempts = self.attempts.lock().unwrap_or_else(|e| e.into_inner());

        attempts
            .entry(identifier.to_string())
            .and_modify(|record| record.increment())
            .or_insert_with(AttemptRecord::new);
    }

    /// Clear record after successful login
    pub fn clear(&self, identifier: &str) {
        let mut attempts = self.attempts.lock().unwrap_or_else(|e| e.into_inner());
        attempts.remove(identifier);
    }

    /// Get remaining attempts
    pub fn remaining_attempts(&self, identifier: &str) -> u32 {
        let attempts = self.attempts.lock().unwrap_or_else(|e| e.into_inner());

        if let Some(record) = attempts.get(identifier) {
            if record.is_expired(self.window) {
                self.max_attempts
            } else {
                self.max_attempts.saturating_sub(record.count)
            }
        } else {
            self.max_attempts
        }
    }
}

impl Clone for RateLimiter {
    fn clone(&self) -> Self {
        // Clone the configuration but start with empty attempts
        Self {
            attempts: Mutex::new(HashMap::new()),
            max_attempts: self.max_attempts,
            window: self.window,
        }
    }
}

impl Default for RateLimiter {
    fn default() -> Self {
        // Default: 5 attempts within 15 minutes
        Self::new(5, Duration::from_secs(15 * 60))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_rate_limiter_allows_within_limit() {
        let limiter = RateLimiter::new(3, Duration::from_secs(60));

        assert!(limiter.check("user1"));
        limiter.record_attempt("user1");
        assert!(limiter.check("user1"));
        limiter.record_attempt("user1");
        assert!(limiter.check("user1"));
    }

    #[test]
    fn test_rate_limiter_blocks_after_limit() {
        let limiter = RateLimiter::new(2, Duration::from_secs(60));

        limiter.record_attempt("user1");
        limiter.record_attempt("user1");

        assert!(!limiter.check("user1"));
    }

    #[test]
    fn test_rate_limiter_clears_on_success() {
        let limiter = RateLimiter::new(2, Duration::from_secs(60));

        limiter.record_attempt("user1");
        limiter.clear("user1");

        assert!(limiter.check("user1"));
    }

    #[test]
    fn test_remaining_attempts() {
        let limiter = RateLimiter::new(5, Duration::from_secs(60));

        assert_eq!(limiter.remaining_attempts("user1"), 5);
        limiter.record_attempt("user1");
        assert_eq!(limiter.remaining_attempts("user1"), 4);
    }
}
