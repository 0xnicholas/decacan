use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use uuid::Uuid;

use super::modes::PlaybookMode;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct StoreEntry {
    pub store_entry_id: String,
    pub title: String,
    pub summary: String,
    pub category: String,
    pub tags: Vec<String>,
    pub mode: PlaybookMode,
    pub official_version: String,
    pub embedded_spec_ref: String,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PlaybookOwnerScope {
    LocalPrivate,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum PlaybookHandleOrigin {
    OfficialFork,
    LocalCopy,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PlaybookHandle {
    pub playbook_handle_id: String,
    pub owner_scope: PlaybookOwnerScope,
    pub origin: PlaybookHandleOrigin,
    pub source_store_entry_id: Option<String>,
    pub title: String,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DraftValidationState {
    NeedsReview,
    Validated,
    Blocked,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DraftHealthIssueSeverity {
    Warning,
    Error,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum DraftHealthIssueDomain {
    Schema,
    Capabilities,
    Workflow,
    Contracts,
    Execution,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DraftHealthIssue {
    pub severity: DraftHealthIssueSeverity,
    pub domain: DraftHealthIssueDomain,
    pub kind: String,
    pub location: Option<String>,
    pub message: String,
    pub related_ref: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DraftHealthReport {
    pub publishable: bool,
    pub summary: String,
    pub issues: Vec<DraftHealthIssue>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PlaybookDraft {
    pub draft_id: String,
    pub playbook_handle_id: String,
    pub spec_document: String,
    pub last_saved_at: OffsetDateTime,
    pub last_validated_at: Option<OffsetDateTime>,
    pub validation_state: DraftValidationState,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PlaybookVersion {
    pub playbook_version_id: Uuid,
    pub playbook_handle_id: String,
    pub version_number: u32,
    pub spec_document: String,
    pub published_at: OffsetDateTime,
    pub validation_report: DraftHealthReport,
}
