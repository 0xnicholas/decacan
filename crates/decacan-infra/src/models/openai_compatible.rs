use decacan_runtime::ports::model::ModelPort;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct OpenAiCompatibleModelPlaceholder {
    reason: String,
}

impl OpenAiCompatibleModelPlaceholder {
    pub fn new(reason: impl Into<String>) -> Self {
        Self {
            reason: reason.into(),
        }
    }

    pub fn reason(&self) -> &str {
        &self.reason
    }
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum OpenAiCompatibleModelPlaceholderError {
    Placeholder(String),
}

impl std::fmt::Display for OpenAiCompatibleModelPlaceholderError {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        match self {
            Self::Placeholder(reason) => write!(
                f,
                "OpenAI-compatible adapter placeholder cannot be used yet: {reason}"
            ),
        }
    }
}

impl std::error::Error for OpenAiCompatibleModelPlaceholderError {}

impl ModelPort for OpenAiCompatibleModelPlaceholder {
    type Error = OpenAiCompatibleModelPlaceholderError;

    fn complete(&self, _prompt: &str) -> Result<String, Self::Error> {
        Err(OpenAiCompatibleModelPlaceholderError::Placeholder(
            self.reason.clone(),
        ))
    }
}

#[cfg(test)]
mod tests {
    use super::OpenAiCompatibleModelPlaceholder;
    use super::OpenAiCompatibleModelPlaceholderError;
    use decacan_runtime::ports::model::ModelPort;

    #[test]
    fn placeholder_model_returns_explicit_placeholder_error() {
        let model = OpenAiCompatibleModelPlaceholder::new("placeholder only");

        assert_eq!(
            model.complete("prompt"),
            Err(OpenAiCompatibleModelPlaceholderError::Placeholder(
                "placeholder only".to_string()
            ))
        );
    }
}
