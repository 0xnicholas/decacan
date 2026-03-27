use std::convert::Infallible;

use decacan_runtime::ports::model::ModelPort;

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct MockModel {
    response: String,
}

impl MockModel {
    pub fn new(response: impl Into<String>) -> Self {
        Self {
            response: response.into(),
        }
    }
}

impl ModelPort for MockModel {
    type Error = Infallible;

    fn complete(&self, _prompt: &str) -> Result<String, Self::Error> {
        Ok(self.response.clone())
    }
}
