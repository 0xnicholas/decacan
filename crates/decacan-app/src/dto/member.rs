use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct MemberDto {
    pub id: String,
    pub name: String,
    pub role: String,
    pub focus: String,
    pub status: String,
}
