use decacan_runtime::ports::model::ModelPort;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct OpenAiCompatibleModel {
    base_url: String,
    model: String,
}

impl OpenAiCompatibleModel {
    pub fn new(base_url: impl Into<String>, model: impl Into<String>) -> Self {
        Self {
            base_url: base_url.into(),
            model: model.into(),
        }
    }

    pub fn base_url(&self) -> &str {
        &self.base_url
    }

    pub fn model(&self) -> &str {
        &self.model
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum OpenAiCompatibleModelError {
    NotConfigured,
}

impl std::fmt::Display for OpenAiCompatibleModelError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::NotConfigured => f.write_str("OpenAI-compatible adapter is not configured"),
        }
    }
}

impl std::error::Error for OpenAiCompatibleModelError {}

impl ModelPort for OpenAiCompatibleModel {
    type Error = OpenAiCompatibleModelError;

    fn complete(&self, _prompt: &str) -> Result<String, Self::Error> {
        Err(OpenAiCompatibleModelError::NotConfigured)
    }
}
