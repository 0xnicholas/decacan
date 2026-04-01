use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use uuid::Uuid;

pub use super::lifecycle::{
    DraftHealthIssue, DraftHealthIssueDomain, DraftHealthIssueSeverity, DraftHealthReport,
    DraftValidationState, PlaybookDraft, PlaybookHandle, PlaybookHandleOrigin, PlaybookOwnerScope,
    PlaybookVersion, StoreEntry,
};
use super::modes::PlaybookMode;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PlaybookStatus {
    Draft,
    Published,
    Retired,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Playbook {
    pub id: String,
    pub workspace_id: String,
    pub key: String,
    pub title: String,
    pub mode: PlaybookMode,
    pub status: PlaybookStatus,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
    pub version_id: Uuid,
}

impl Playbook {
    pub fn new_for_test(id: &str, workspace_id: &str, key: &str, mode: PlaybookMode) -> Self {
        let now = OffsetDateTime::now_utc();
        Self {
            id: id.to_owned(),
            workspace_id: workspace_id.to_owned(),
            key: key.to_owned(),
            title: key.to_owned(),
            mode,
            status: PlaybookStatus::Draft,
            created_at: now,
            updated_at: now,
            version_id: Uuid::new_v4(),
        }
    }
}
