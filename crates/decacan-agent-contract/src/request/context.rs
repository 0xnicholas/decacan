use crate::events::StepOutput;
use serde::{Deserialize, Serialize};
use std::collections::HashMap;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionContext {
    pub input_payload: String,
    pub prior_outputs: Vec<StepOutput>,
    pub user_preferences: Option<serde_json::Value>,
    pub environment: Option<HashMap<String, String>>,
}

impl ExecutionContext {
    pub fn new(input_payload: impl Into<String>) -> Self {
        Self {
            input_payload: input_payload.into(),
            prior_outputs: Vec::new(),
            user_preferences: None,
            environment: None,
        }
    }
}
