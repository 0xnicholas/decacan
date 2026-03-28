use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PlaybookDto {
    pub key: String,
    pub title: String,
    pub mode: String,
}
