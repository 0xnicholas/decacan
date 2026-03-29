use decacan_runtime::playbook::authoring::{save_draft, SaveDraftCommand};
use decacan_runtime::playbook::entity::{
    DraftHealthIssueDomain, DraftHealthIssueSeverity, DraftValidationState, PlaybookDraft,
};
use decacan_runtime::playbook::publish::{publish_draft, PublishDraftCommand};
use time::OffsetDateTime;
use uuid::Uuid;

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

#[test]
fn publish_success_creates_immutable_playbook_version() {
    let published_at = OffsetDateTime::from_unix_timestamp(1_743_300_180)
        .expect("fixture timestamp should be valid");

    let result = publish_draft(PublishDraftCommand {
        draft: sample_draft(valid_publish_spec_document(), DraftValidationState::Validated),
        playbook_version_id: Uuid::parse_str("2f7aebaf-4c0e-4ca2-a1ad-f2dc40610b8c")
            .expect("fixture uuid should be valid"),
        version_number: 2,
        published_at,
    });

    assert!(result.health_report.publishable);
    assert_eq!(result.resolved_refs.len(), 4);
    assert_eq!(result.resolved_refs[0], "builtin.scan_markdown_files");

    let version = result
        .version
        .expect("publish success should create a version");
    assert_eq!(version.playbook_handle_id, "handle-1");
    assert_eq!(version.version_number, 2);
    assert_eq!(version.published_at, published_at);
    assert_eq!(version.spec_document, valid_publish_spec_document());
}

#[test]
fn publish_failure_returns_structured_issues() {
    let published_at = OffsetDateTime::from_unix_timestamp(1_743_300_240)
        .expect("fixture timestamp should be valid");

    let result = publish_draft(PublishDraftCommand {
        draft: sample_draft(invalid_publish_spec_document(), DraftValidationState::Blocked),
        playbook_version_id: Uuid::parse_str("f83a7bd5-15c3-47cb-8097-4aa0f09f4d22")
            .expect("fixture uuid should be valid"),
        version_number: 1,
        published_at,
    });

    assert!(!result.health_report.publishable);
    assert_eq!(result.health_report.issues.len(), 2);
    assert!(result.version.is_none());
    assert_eq!(
        result.health_report.issues[0].domain,
        DraftHealthIssueDomain::Capabilities
    );
    assert_eq!(
        result.health_report.issues[1].domain,
        DraftHealthIssueDomain::Execution
    );
}

#[test]
fn publish_failure_creates_no_half_version_object() {
    let published_at = OffsetDateTime::from_unix_timestamp(1_743_300_300)
        .expect("fixture timestamp should be valid");

    let result = publish_draft(PublishDraftCommand {
        draft: sample_draft(invalid_publish_spec_document(), DraftValidationState::Blocked),
        playbook_version_id: Uuid::parse_str("fa9ff8ef-0e1f-4351-b522-d55e5c89ae6f")
            .expect("fixture uuid should be valid"),
        version_number: 5,
        published_at,
    });

    assert!(result.version.is_none());
    assert!(result.resolved_refs.is_empty());
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

fn valid_publish_spec_document() -> &'static str {
    "metadata:\n  title: valid publish draft\ncapability_refs:\n  routines:\n    - builtin.scan_markdown_files\n  tools:\n    - builtin.workspace.read\n    - builtin.artifact.write\n  validators:\n    - builtin.output_contract.summary\nexecution_profile: single\n"
}

fn invalid_publish_spec_document() -> &'static str {
    "metadata:\n  title: invalid publish draft\ncapability_refs:\n  routines:\n    - ext.acme.topic_cluster\nexecution_profile: team(core)\n"
}
