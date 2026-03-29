use time::OffsetDateTime;

use super::capability_refs::unresolved_capability_ref_issues;
use super::entity::{DraftHealthReport, DraftValidationState, PlaybookDraft};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SaveDraftCommand {
    pub draft: PlaybookDraft,
    pub spec_document: String,
    pub saved_at: OffsetDateTime,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct SaveDraftResult {
    pub draft: PlaybookDraft,
    pub health_report: DraftHealthReport,
}

pub fn save_draft(command: SaveDraftCommand) -> SaveDraftResult {
    let health_report = compute_draft_health(&command.spec_document);
    let validation_state = if health_report.publishable {
        DraftValidationState::Validated
    } else {
        DraftValidationState::Blocked
    };

    SaveDraftResult {
        draft: PlaybookDraft {
            draft_id: command.draft.draft_id,
            playbook_handle_id: command.draft.playbook_handle_id,
            spec_document: command.spec_document,
            last_saved_at: command.saved_at,
            last_validated_at: Some(command.saved_at),
            validation_state,
        },
        health_report,
    }
}

fn compute_draft_health(spec_document: &str) -> DraftHealthReport {
    let issues = unresolved_capability_ref_issues(spec_document);
    let publishable = issues.is_empty();
    let summary = if publishable {
        "draft is publishable".to_owned()
    } else {
        format!("{} unresolved capability ref(s)", issues.len())
    };

    DraftHealthReport {
        publishable,
        summary,
        issues,
    }
}
