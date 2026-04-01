use super::{SecretsError, SecretsPort};
use async_trait::async_trait;

/// HashiCorp Vault 集成（预留接口，将来实现）
pub struct VaultSecretsSource {
    address: String,
    token: String,
    mount_path: String,
}

impl VaultSecretsSource {
    /// 创建新的 Vault 来源（预留，当前返回错误）
    pub fn new(
        _address: impl Into<String>,
        _token: impl Into<String>,
    ) -> Result<Self, SecretsError> {
        // 将来实现：验证连接和认证
        Ok(Self {
            address: _address.into(),
            token: _token.into(),
            mount_path: "secret".to_string(),
        })
    }

    pub fn with_mount_path(mut self, path: impl Into<String>) -> Self {
        self.mount_path = path.into();
        self
    }
}

#[async_trait]
impl SecretsPort for VaultSecretsSource {
    type Error = SecretsError;

    async fn get(&self, _key: &str) -> Result<Option<String>, Self::Error> {
        // 预留：将来实现 Vault API 调用
        Err(SecretsError::VaultError(
            "Vault integration not yet implemented".to_string(),
        ))
    }

    async fn get_required(&self, key: &str) -> Result<String, Self::Error> {
        match self.get(key).await? {
            Some(value) => Ok(value),
            None => Err(SecretsError::NotFound(key.to_string())),
        }
    }
}
