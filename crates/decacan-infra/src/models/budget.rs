use serde::{Deserialize, Serialize};
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::Arc;
use thiserror::Error;

/// Token 预算配置
#[derive(Debug, Clone, Copy, PartialEq, Eq, Deserialize, Serialize)]
pub struct TokenBudget {
    /// 单次请求最大 Token 数
    pub max_request_tokens: Option<u64>,
    /// 会话/运行最大总 Token 数
    pub max_total_tokens: Option<u64>,
}

impl Default for TokenBudget {
    fn default() -> Self {
        Self {
            max_request_tokens: None,
            max_total_tokens: None,
        }
    }
}

impl TokenBudget {
    /// 创建无限预算
    pub fn unlimited() -> Self {
        Self::default()
    }

    /// 创建严格预算
    pub fn strict(max_request: u64, max_total: u64) -> Self {
        Self {
            max_request_tokens: Some(max_request),
            max_total_tokens: Some(max_total),
        }
    }

    /// 仅限制单次请求
    pub fn per_request_limit(max: u64) -> Self {
        Self {
            max_request_tokens: Some(max),
            max_total_tokens: None,
        }
    }
}

/// Token 预算管理器
#[derive(Debug, Clone)]
pub struct BudgetManager {
    budget: TokenBudget,
    total_used: Arc<AtomicU64>,
}

#[derive(Debug, Error, Clone, PartialEq, Eq)]
pub enum BudgetError {
    #[error("Request exceeds maximum allowed tokens: requested {requested}, limit {limit}")]
    RequestTooLarge { requested: u64, limit: u64 },
    #[error("Total budget exceeded: used {used}, limit {limit}")]
    BudgetExceeded { used: u64, limit: u64 },
}

/// Token 预留凭证，用于确认或释放预留的 Token
#[derive(Debug)]
pub struct TokenReservation {
    reserved: u64,
}

impl TokenReservation {
    pub fn reserved(&self) -> u64 {
        self.reserved
    }
}

impl BudgetManager {
    pub fn new(budget: TokenBudget) -> Self {
        Self {
            budget,
            total_used: Arc::new(AtomicU64::new(0)),
        }
    }

    /// 检查请求是否允许（不预留 Token，仅检查）
    pub fn check_request(&self, estimated_tokens: u64) -> Result<(), BudgetError> {
        // 检查单次请求限制
        if let Some(max_request) = self.budget.max_request_tokens {
            if estimated_tokens > max_request {
                return Err(BudgetError::RequestTooLarge {
                    requested: estimated_tokens,
                    limit: max_request,
                });
            }
        }

        // 检查总预算（使用 saturating_sub 防止溢出）
        if let Some(max_total) = self.budget.max_total_tokens {
            let current = self.total_used.load(Ordering::Relaxed);
            if current > max_total.saturating_sub(estimated_tokens) {
                return Err(BudgetError::BudgetExceeded {
                    used: current,
                    limit: max_total,
                });
            }
        }

        Ok(())
    }

    /// 原子性地检查并预留 Token
    /// 返回预留凭证，成功后会自动预留预算
    pub fn reserve(&self, estimated_tokens: u64) -> Result<TokenReservation, BudgetError> {
        // 首先检查单次请求限制
        if let Some(max_request) = self.budget.max_request_tokens {
            if estimated_tokens > max_request {
                return Err(BudgetError::RequestTooLarge {
                    requested: estimated_tokens,
                    limit: max_request,
                });
            }
        }

        // 原子性地检查和预留总预算
        if let Some(max_total) = self.budget.max_total_tokens {
            loop {
                let current = self.total_used.load(Ordering::Relaxed);
                if current.saturating_add(estimated_tokens) > max_total {
                    return Err(BudgetError::BudgetExceeded {
                        used: current,
                        limit: max_total,
                    });
                }

                // 尝试原子更新
                match self.total_used.compare_exchange(
                    current,
                    current + estimated_tokens,
                    Ordering::Relaxed,
                    Ordering::Relaxed,
                ) {
                    Ok(_) => break,     // 成功预留
                    Err(_) => continue, // 重试
                }
            }
        }

        Ok(TokenReservation {
            reserved: estimated_tokens,
        })
    }

    /// 调整预留的 Token 数量（用于实际使用量与估算不同的情况）
    /// actual_used 是实际使用的 Token 数
    pub fn adjust_usage(&self, reservation: TokenReservation, actual_used: u64) {
        let reserved = reservation.reserved;
        if actual_used < reserved {
            // 实际使用少于预留，释放多余的
            let to_release = reserved - actual_used;
            self.total_used.fetch_sub(to_release, Ordering::Relaxed);
        } else if actual_used > reserved {
            // 实际使用多于预留，追加差额
            let additional = actual_used - reserved;
            self.total_used.fetch_add(additional, Ordering::Relaxed);
        }
        // 如果相等，无需调整
    }

    /// 释放预留的 Token（请求失败时使用）
    pub fn release(&self, reservation: TokenReservation) {
        self.total_used
            .fetch_sub(reservation.reserved, Ordering::Relaxed);
    }

    /// 记录实际使用的 Token（传统方式，无预留机制）
    pub fn record_usage(&self, tokens: u64) {
        self.total_used.fetch_add(tokens, Ordering::Relaxed);
    }

    /// 获取已使用的总 Token 数
    pub fn total_used(&self) -> u64 {
        self.total_used.load(Ordering::Relaxed)
    }

    /// 获取剩余预算
    pub fn remaining_budget(&self) -> Option<u64> {
        self.budget
            .max_total_tokens
            .map(|max| max.saturating_sub(self.total_used.load(Ordering::Relaxed)))
    }
}

/// 估算文本的 Token 数量（简单估算：约 4 字符 = 1 token）
/// 使用 chars().count() 而非 len() 以正确处理 UTF-8 字符
pub fn estimate_tokens(text: &str) -> u64 {
    ((text.chars().count() as f64) / 4.0).ceil() as u64
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_token_estimation() {
        // 测试基本 ASCII
        assert_eq!(estimate_tokens("hello"), 2); // 5 字符 / 4 = 1.25 -> 2
        assert_eq!(estimate_tokens("hello world"), 3); // 11 字符 / 4 = 2.75 -> 3
        assert_eq!(estimate_tokens(""), 0);

        // 测试 UTF-8 字符（中文字符）
        let chinese = "你好世界"; // 4 个中文字符
        assert_eq!(estimate_tokens(chinese), 1); // 4 / 4 = 1

        // 测试 emoji（每个 emoji 可能占用多个字节，但按字符计数）
        let emoji = "👋🌍"; // 2 个 emoji 字符
        assert_eq!(estimate_tokens(emoji), 1); // 2 / 4 = 0.5 -> 1
    }

    #[test]
    fn test_budget_unlimited() {
        let budget = TokenBudget::unlimited();
        assert!(budget.max_request_tokens.is_none());
        assert!(budget.max_total_tokens.is_none());
    }

    #[test]
    fn test_budget_strict() {
        let budget = TokenBudget::strict(1000, 10000);
        assert_eq!(budget.max_request_tokens, Some(1000));
        assert_eq!(budget.max_total_tokens, Some(10000));
    }

    #[test]
    fn test_budget_per_request() {
        let budget = TokenBudget::per_request_limit(500);
        assert_eq!(budget.max_request_tokens, Some(500));
        assert!(budget.max_total_tokens.is_none());
    }

    #[test]
    fn test_reserve_and_adjust() {
        let budget = TokenBudget::strict(100, 200);
        let manager = BudgetManager::new(budget);

        // 预留 50 tokens
        let reservation = manager.reserve(50).unwrap();
        assert_eq!(manager.total_used(), 50);

        // 实际使用 30，调整
        manager.adjust_usage(reservation, 30);
        assert_eq!(manager.total_used(), 30);
    }

    #[test]
    fn test_reserve_and_release() {
        let budget = TokenBudget::strict(100, 200);
        let manager = BudgetManager::new(budget);

        // 预留 50 tokens
        let reservation = manager.reserve(50).unwrap();
        assert_eq!(manager.total_used(), 50);

        // 失败时释放
        manager.release(reservation);
        assert_eq!(manager.total_used(), 0);
    }

    #[test]
    fn test_overflow_protection() {
        let budget = TokenBudget::strict(100, u64::MAX);
        let manager = BudgetManager::new(budget);

        // 使用接近最大值的预算
        manager.record_usage(u64::MAX - 10);

        // 检查是否不会溢出
        let result = manager.check_request(100);
        assert!(result.is_err()); // 应该失败，但不会 panic
    }
}
