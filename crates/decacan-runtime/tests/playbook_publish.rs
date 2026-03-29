use decacan_runtime::playbook::authoring::{save_draft, SaveDraftCommand};
use decacan_runtime::playbook::entity::{
    DraftHealthIssueDomain, DraftHealthIssueSeverity, DraftValidationState, PlaybookDraft,
};
use time::OffsetDateTime;

#[test]
fn draft_save_replaces_the_full_document() {
    let existing_draft = sample_draft(
        "metadata:\n  title: old draft\ncapability_refs:\n  routines:\n    - builtin.scan_markdown_files\n",
        DraftValidationState::NeedsReview,
    );
    let saved_at = OffsetDateTime::from_unix_timestamp(1_743_300_000)
        .expect("fixture timestamp should be valid");
    let replacement_spec = valid_spec_document();

    let result = save_draft(SaveDraftCommand {
        draft: existing_draft,
        spec_document: replacement_spec.to_owned(),
        saved_at,
    });

    assert_eq!(result.draft.spec_document, replacement_spec);
    assert!(!result.draft.spec_document.contains("old draft"));
    assert_eq!(result.draft.last_saved_at, saved_at);
}

#[test]
fn draft_save_recomputes_health_when_document_becomes_valid() {
    let existing_draft = sample_draft(
        invalid_spec_document(),
        DraftValidationState::Blocked,
    );
    let saved_at = OffsetDateTime::from_unix_timestamp(1_743_300_060)
        .expect("fixture timestamp should be valid");

    let result = save_draft(SaveDraftCommand {
        draft: existing_draft,
        spec_document: valid_spec_document().to_owned(),
        saved_at,
    });

    assert!(result.health_report.publishable);
    assert_eq!(result.health_report.issues.len(), 0);
    assert_eq!(result.draft.validation_state, DraftValidationState::Validated);
    assert_eq!(result.draft.last_validated_at, Some(saved_at));
}

#[test]
fn draft_save_reports_unresolved_builtin_only_capability_refs() {
    let existing_draft = sample_draft(valid_spec_document(), DraftValidationState::Validated);
    let saved_at = OffsetDateTime::from_unix_timestamp(1_743_300_120)
        .expect("fixture timestamp should be valid");

    let result = save_draft(SaveDraftCommand {
        draft: existing_draft,
        spec_document: invalid_spec_document().to_owned(),
        saved_at,
    });

    assert!(!result.health_report.publishable);
    assert_eq!(result.draft.validation_state, DraftValidationState::Blocked);
    assert_eq!(result.health_report.issues.len(), 1);
    assert_eq!(
        result.health_report.issues[0].severity,
        DraftHealthIssueSeverity::Error
    );
    assert_eq!(
        result.health_report.issues[0].domain,
        DraftHealthIssueDomain::Capabilities
    );
    assert_eq!(result.health_report.issues[0].kind, "unresolved");
    assert_eq!(
        result.health_report.issues[0].related_ref.as_deref(),
        Some("ext.acme.topic_cluster")
    );
}

fn sample_draft(spec_document: &str, validation_state: DraftValidationState) -> PlaybookDraft {
    let saved_at = OffsetDateTime::from_unix_timestamp(1_743_299_000)
        .expect("fixture timestamp should be valid");
    PlaybookDraft {
        draft_id: "draft-1".to_owned(),
        playbook_handle_id: "handle-1".to_owned(),
        spec_document: spec_document.to_owned(),
        last_saved_at: saved_at,
        last_validated_at: Some(saved_at),
        validation_state,
    }
}

fn valid_spec_document() -> &'static str {
    "metadata:\n  title: valid draft\ncapability_refs:\n  routines:\n    - builtin.scan_markdown_files\n  tools:\n    - builtin.workspace.read\n    - builtin.artifact.write\n  validators:\n    - builtin.output_contract.summary\n"
}

fn invalid_spec_document() -> &'static str {
    "metadata:\n  title: invalid draft\ncapability_refs:\n  routines:\n    - ext.acme.topic_cluster\n"
}
