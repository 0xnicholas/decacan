#[derive(Debug, Clone, Default, PartialEq, Eq)]
pub struct LoggingConfig {
    pub enabled: bool,
}

impl LoggingConfig {
    pub fn new(enabled: bool) -> Self {
        Self { enabled }
    }
}
