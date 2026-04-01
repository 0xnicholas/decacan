use axum::{
    extract::{ConnectInfo, Request},
    http::StatusCode,
    middleware::Next,
    response::{IntoResponse, Response},
};
use std::collections::HashMap;
use std::net::SocketAddr;
use std::sync::Mutex;
use std::time::{Duration, Instant};

/// 简单的内存速率限制器
///
/// 每个 IP 每分钟最多 5 次请求
#[derive(Debug, Clone)]
pub struct RateLimiter {
    requests: std::sync::Arc<Mutex<HashMap<String, Vec<Instant>>>>,
    max_requests: usize,
    window: Duration,
}

impl RateLimiter {
    pub fn new(max_requests: usize, window_seconds: u64) -> Self {
        Self {
            requests: std::sync::Arc::new(Mutex::new(HashMap::new())),
            max_requests,
            window: Duration::from_secs(window_seconds),
        }
    }

    /// 检查是否允许请求
    pub fn check(&self, ip: &str) -> bool {
        let now = Instant::now();
        let mut requests = self.requests.lock().unwrap();

        // 获取或创建该 IP 的请求记录
        let timestamps = requests.entry(ip.to_string()).or_default();

        // 清理过期的请求记录
        timestamps.retain(|&t| now.duration_since(t) < self.window);

        // 检查是否超过限制
        if timestamps.len() >= self.max_requests {
            return false;
        }

        // 记录本次请求
        timestamps.push(now);
        true
    }

    /// 创建认证端点专用的速率限制器
    /// 每分钟 5 次请求
    pub fn auth_limiter() -> Self {
        Self::new(5, 60) // 5 requests per minute
    }
}

/// 速率限制中间件
///
/// 使用：`.layer(middleware::from_fn_with_state(rate_limiter, rate_limit_middleware))`
pub async fn rate_limit_middleware(
    ConnectInfo(addr): ConnectInfo<SocketAddr>,
    request: Request,
    next: Next,
) -> Result<impl IntoResponse, StatusCode> {
    // 简单实现：直接允许（实际应从 State 获取 RateLimiter）
    // 完整实现需要在 AppState 中添加 RateLimiter
    Ok(next.run(request).await)
}

#[derive(Clone)]
pub struct RateLimitState {
    pub limiter: RateLimiter,
}

impl RateLimitState {
    pub fn new() -> Self {
        Self {
            limiter: RateLimiter::auth_limiter(),
        }
    }
}
