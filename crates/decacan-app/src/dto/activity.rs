use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ActivityDto {
    pub id: String,
    pub message: String,
    pub relative_time: String,
}
