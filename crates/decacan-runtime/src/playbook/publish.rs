use time::OffsetDateTime;
use uuid::Uuid;

use super::authoring::compute_draft_health;
use super::capability_refs::resolved_builtin_capability_refs;
use super::entity::{
    DraftHealthIssue, DraftHealthIssueDomain, DraftHealthIssueSeverity, DraftHealthReport,
    PlaybookDraft, PlaybookVersion,
};

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PublishDraftCommand {
    pub draft: PlaybookDraft,
    pub playbook_version_id: Uuid,
    pub version_number: u32,
    pub published_at: OffsetDateTime,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PublishDraftResult {
    pub version: Option<PlaybookVersion>,
    pub health_report: DraftHealthReport,
    pub resolved_refs: Vec<String>,
}

pub fn publish_draft(command: PublishDraftCommand) -> PublishDraftResult {
    let health_report = compute_publish_health(&command.draft.spec_document);

    if !health_report.publishable {
        return PublishDraftResult {
            version: None,
            health_report,
            resolved_refs: Vec::new(),
        };
    }

    let resolved_refs = resolved_builtin_capability_refs(&command.draft.spec_document);
    let version = PlaybookVersion {
        playbook_version_id: command.playbook_version_id,
        playbook_handle_id: command.draft.playbook_handle_id,
        version_number: command.version_number,
        spec_document: command.draft.spec_document,
        published_at: command.published_at,
        validation_report: health_report.clone(),
    };

    PublishDraftResult {
        version: Some(version),
        health_report,
        resolved_refs,
    }
}

fn compute_publish_health(spec_document: &str) -> DraftHealthReport {
    let mut issues = compute_draft_health(spec_document).issues;

    if !has_single_execution_profile(spec_document) {
        issues.push(DraftHealthIssue {
            severity: DraftHealthIssueSeverity::Error,
            domain: DraftHealthIssueDomain::Execution,
            kind: "unsupported_execution_profile".to_owned(),
            location: Some("execution_profile".to_owned()),
            message: "execution profile must be single".to_owned(),
            related_ref: None,
        });
    }

    let publishable = issues.is_empty();
    let summary = if publishable {
        "publish is ready".to_owned()
    } else {
        format!("publish blocked by {} issue(s)", issues.len())
    };

    DraftHealthReport {
        publishable,
        summary,
        issues,
    }
}

fn has_single_execution_profile(spec_document: &str) -> bool {
    spec_document
        .lines()
        .map(str::trim)
        .any(|line| line == "execution_profile: single")
}
