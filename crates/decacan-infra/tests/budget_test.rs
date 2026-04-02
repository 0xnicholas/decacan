use decacan_infra::models::budget::{estimate_tokens, BudgetError, BudgetManager, TokenBudget};

#[test]
fn test_unlimited_budget_allows_any_request() {
    let manager = BudgetManager::new(TokenBudget::unlimited());
    assert!(manager.check_request(1000000).is_ok());
}

#[test]
fn test_request_limit_enforced() {
    let manager = BudgetManager::new(TokenBudget::per_request_limit(100));

    assert!(manager.check_request(50).is_ok());
    assert!(manager.check_request(100).is_ok());

    let result = manager.check_request(101);
    assert!(matches!(
        result,
        Err(BudgetError::RequestTooLarge {
            requested: 101,
            limit: 100
        })
    ));
}

#[test]
fn test_total_budget_tracking() {
    let budget = TokenBudget::strict(100, 200); // max_request=100, max_total=200
    let manager = BudgetManager::new(budget);

    // 第一次请求 50 tokens
    assert!(manager.check_request(50).is_ok());
    manager.record_usage(50);
    assert_eq!(manager.total_used(), 50);

    // 第二次请求 100 tokens，累计 150 < 200
    assert!(manager.check_request(100).is_ok());
    manager.record_usage(100);
    assert_eq!(manager.total_used(), 150);

    // 第三次请求 100 tokens，累计 250 > 200
    let result = manager.check_request(100);
    assert!(matches!(
        result,
        Err(BudgetError::BudgetExceeded {
            used: 150,
            limit: 200
        })
    ));
}

#[test]
fn test_remaining_budget() {
    let budget = TokenBudget::strict(50, 100);
    let manager = BudgetManager::new(budget);

    assert_eq!(manager.remaining_budget(), Some(100));

    manager.record_usage(30);
    assert_eq!(manager.remaining_budget(), Some(70));

    manager.record_usage(80);
    assert_eq!(manager.remaining_budget(), Some(0));
}

#[test]
fn test_token_estimation() {
    assert_eq!(estimate_tokens("test"), 1);
    assert_eq!(estimate_tokens("hello world"), 3); // 11/4 = 2.75 -> 3
    assert_eq!(
        estimate_tokens("this is a longer piece of text for testing"),
        11
    );
}
