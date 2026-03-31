use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub owner_id: String,
    pub email: String,
    pub name: String,
    pub avatar_url: Option<String>,
    pub status: UserStatus,
    pub created_at: OffsetDateTime,
    pub last_login_at: Option<OffsetDateTime>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum UserStatus {
    Active,
    Suspended,
    Deleted,
}

impl User {
    pub fn new(
        id: impl Into<String>,
        owner_id: impl Into<String>,
        email: impl Into<String>,
        name: impl Into<String>,
        avatar_url: Option<String>,
    ) -> Self {
        let now = OffsetDateTime::now_utc();
        Self {
            id: id.into(),
            owner_id: owner_id.into(),
            email: email.into(),
            name: name.into(),
            avatar_url,
            status: UserStatus::Active,
            created_at: now,
            last_login_at: None,
        }
    }

    pub fn new_for_test(id: &str, owner_id: &str) -> Self {
        Self::new(id, owner_id, "test@example.com", "Test User", None)
    }
}
