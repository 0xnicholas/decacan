use decacan_runtime::playbook::entity::{
    DraftHealthIssueDomain, DraftHealthIssueSeverity, DraftValidationState, PlaybookHandleOrigin,
    PlaybookOwnerScope,
};
use decacan_runtime::playbook::modes::PlaybookMode;
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

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct StoreEntryDto {
    pub store_entry_id: String,
    pub title: String,
    pub summary: String,
    pub category: String,
    pub tags: Vec<String>,
    pub mode: PlaybookMode,
    pub official_version: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PlaybookHandleDto {
    pub playbook_handle_id: String,
    pub owner_scope: PlaybookOwnerScope,
    pub origin: PlaybookHandleOrigin,
    pub source_store_entry_id: Option<String>,
    pub title: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PlaybookDraftDto {
    pub draft_id: String,
    pub playbook_handle_id: String,
    pub spec_document: String,
    pub validation_state: DraftValidationState,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DraftHealthIssueDto {
    pub severity: DraftHealthIssueSeverity,
    pub domain: DraftHealthIssueDomain,
    pub kind: String,
    pub location: Option<String>,
    pub message: String,
    pub related_ref: Option<String>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct DraftHealthReportDto {
    pub publishable: bool,
    pub summary: String,
    pub issues: Vec<DraftHealthIssueDto>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PlaybookVersionDto {
    pub playbook_version_id: String,
    pub playbook_handle_id: String,
    pub version_number: u32,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ForkPlaybookRequestDto {
    pub store_entry_id: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ForkPlaybookResponseDto {
    pub handle: PlaybookHandleDto,
    pub draft: PlaybookDraftDto,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PlaybookDetailDto {
    pub handle: PlaybookHandleDto,
    pub draft: PlaybookDraftDto,
    pub versions: Vec<PlaybookVersionDto>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SavePlaybookDraftRequestDto {
    pub spec_document: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct SavePlaybookDraftResponseDto {
    pub draft: PlaybookDraftDto,
    pub health_report: DraftHealthReportDto,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PublishPlaybookResponseDto {
    pub version: Option<PlaybookVersionDto>,
    pub health_report: DraftHealthReportDto,
    pub resolved_refs: Vec<String>,
}

#[derive(Debug, Clone, Deserialize)]
pub struct CreatePlaybookRequestDto {
    pub title: String,
    pub description: String,
    pub mode: String,
}

#[derive(Debug, Clone, Serialize)]
pub struct CreatePlaybookResponseDto {
    pub handle: PlaybookHandleDto,
    pub draft: PlaybookDraftDto,
}

#[derive(Debug, Clone, Deserialize)]
pub struct UpdatePlaybookRequestDto {
    pub title: Option<String>,
    pub description: Option<String>,
    pub mode: Option<String>,
    pub tags: Option<Vec<String>>,
}

#[derive(Debug, Clone, Serialize)]
pub struct UpdatePlaybookResponseDto {
    pub handle: PlaybookHandleDto,
}
