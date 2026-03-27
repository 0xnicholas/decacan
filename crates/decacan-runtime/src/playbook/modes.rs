use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PlaybookMode {
    Discovery,
    Standard,
}

impl PlaybookMode {
    pub fn display_name(self) -> &'static str {
        match self {
            Self::Discovery => "发现模式",
            Self::Standard => "标准模式",
        }
    }
}
