use std::path::PathBuf;

use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ToolRequest {
    pub tool_name: String,
    pub action: String,
    pub target_path: Option<PathBuf>,
    pub overwrite_existing: bool,
}

impl ToolRequest {
    pub fn new(tool_name: impl Into<String>, action: impl Into<String>) -> Self {
        Self {
            tool_name: tool_name.into(),
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
