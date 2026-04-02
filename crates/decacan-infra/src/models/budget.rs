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

impl BudgetManager {
    pub fn new(budget: TokenBudget) -> Self {
        Self {
            budget,
            total_used: Arc::new(AtomicU64::new(0)),
        }
    }

    /// 检查请求是否允许
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

        // 检查总预算
        if let Some(max_total) = self.budget.max_total_tokens {
            let current = self.total_used.load(Ordering::Relaxed);
            if current + estimated_tokens > max_total {
                return Err(BudgetError::BudgetExceeded {
                    used: current,
                    limit: max_total,
                });
            }
        }

        Ok(())
    }

    /// 记录实际使用的 Token
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
pub fn estimate_tokens(text: &str) -> u64 {
    (text.len() as f64 / 4.0).ceil() as u64
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_token_estimation() {
        assert_eq!(estimate_tokens("hello"), 2); // 5/4 = 1.25 -> 2
        assert_eq!(estimate_tokens("hello world"), 3); // 11/4 = 2.75 -> 3
        assert_eq!(estimate_tokens(""), 0);
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
}
