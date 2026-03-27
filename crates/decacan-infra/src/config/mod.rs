#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct InfraConfig {
    pub profile: String,
}

impl InfraConfig {
    pub fn new(profile: impl Into<String>) -> Self {
        Self {
            profile: profile.into(),
        }
    }
}
