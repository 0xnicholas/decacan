use std::fmt::Debug;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ToolCall {
    pub name: String,
    pub action: String,
    pub target_path: Option<PathBuf>,
    pub overwrite_existing: bool,
}

impl ToolCall {
    pub fn new(name: impl Into<String>, action: impl Into<String>) -> Self {
        Self {
            name: name.into(),
            action: action.into(),
            target_path: None,
            overwrite_existing: false,
        }
    }

    pub fn with_target_path(mut self, target_path: impl Into<PathBuf>) -> Self {
        self.target_path = Some(target_path.into());
        self
    }

    pub fn with_overwrite_existing(mut self, overwrite_existing: bool) -> Self {
        self.overwrite_existing = overwrite_existing;
        self
    }
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(tag = "status", rename_all = "snake_case")]
pub enum ToolCallResult {
    Allowed { reason: String },
    ApprovalRequired { reason: String },
    Denied { reason: String },
}

pub trait ToolProtocol {
    type Error: Debug;

    fn invoke(&self, request: ToolCall) -> Result<ToolCallResult, Self::Error>;
}
