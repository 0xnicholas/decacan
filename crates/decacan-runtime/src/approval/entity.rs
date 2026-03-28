use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use uuid::Uuid;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum ApprovalStatus {
    Pending,
    Approved,
    Rejected,
    Expired,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Approval {
    pub id: String,
    pub task_id: String,
    pub status: ApprovalStatus,
    pub requested_at: OffsetDateTime,
    pub resolved_at: Option<OffsetDateTime>,
    pub token_id: Uuid,
}

impl Approval {
    pub fn new_for_test(id: &str, task_id: &str) -> Self {
        Self {
            id: id.to_owned(),
            task_id: task_id.to_owned(),
            status: ApprovalStatus::Pending,
            requested_at: OffsetDateTime::now_utc(),
            resolved_at: None,
            token_id: Uuid::new_v4(),
        }
    }
}
