pub mod sources;

pub use sources::{ConfigError, InfraConfig};

// 保留向后兼容的简单配置
#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct InfraConfigLegacy {
    pub profile: String,
}

impl InfraConfigLegacy {
    pub fn new(profile: impl Into<String>) -> Self {
        Self {
            profile: profile.into(),
        }
    }
}
