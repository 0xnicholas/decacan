use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PlaybookDto {
    pub key: String,
    pub title: String,
    pub summary: String,
    pub mode_label: String,
    pub expected_output_label: String,
    pub expected_output_path: String,
}
