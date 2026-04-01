use decacan_runtime::playbook::entity::{
    DraftHealthIssue, DraftHealthIssueDomain, DraftHealthIssueSeverity, DraftHealthReport,
    DraftValidationState, PlaybookDraft, PlaybookHandle, PlaybookHandleOrigin, PlaybookOwnerScope,
    PlaybookVersion, StoreEntry,
};
use decacan_runtime::playbook::modes::PlaybookMode;
use serde_json::{from_str, to_string};
use time::OffsetDateTime;
use uuid::Uuid;

#[test]
fn store_entry_roundtrips_through_serde_with_basic_fields() {
    let entry = StoreEntry {
        store_entry_id: "store-entry-1".to_owned(),
        title: "官方总结模板".to_owned(),
        summary: "用于标准总结场景".to_owned(),
        category: "summary".to_owned(),
        tags: vec!["official".to_owned(), "builtin".to_owned()],
        mode: PlaybookMode::Standard,
        official_version: "2026.03".to_owned(),
        embedded_spec_ref: "builtin://summary-playbook".to_owned(),
    };

    let encoded = to_string(&entry).expect("store entry should serialize");
    let decoded: StoreEntry = from_str(&encoded).expect("store entry should deserialize");

    assert_eq!(decoded.store_entry_id, "store-entry-1");
    assert_eq!(decoded.mode, PlaybookMode::Standard);
    assert_eq!(decoded.official_version, "2026.03");
}

#[test]
fn playbook_handle_roundtrips_through_serde_with_basic_fields() {
    let created_at = OffsetDateTime::from_unix_timestamp(1_743_206_400)
        .expect("fixture timestamp should be valid");
    let updated_at = OffsetDateTime::from_unix_timestamp(1_743_206_460)
        .expect("fixture timestamp should be valid");
    let handle = PlaybookHandle {
        playbook_handle_id: "handle-1".to_owned(),
        owner_scope: PlaybookOwnerScope::LocalPrivate,
        origin: PlaybookHandleOrigin::OfficialFork,
        source_store_entry_id: Some("store-entry-1".to_owned()),
        title: "我的总结模板".to_owned(),
        created_at,
        updated_at,
    };

    let encoded = to_string(&handle).expect("playbook handle should serialize");
    let decoded: PlaybookHandle = from_str(&encoded).expect("playbook handle should deserialize");

    assert_eq!(decoded.playbook_handle_id, "handle-1");
    assert_eq!(decoded.origin, PlaybookHandleOrigin::OfficialFork);
    assert_eq!(
        decoded.source_store_entry_id.as_deref(),
        Some("store-entry-1")
    );
}

#[test]
fn playbook_draft_roundtrips_through_serde_with_basic_fields() {
    let last_saved_at = OffsetDateTime::from_unix_timestamp(1_743_206_500)
        .expect("fixture timestamp should be valid");
    let last_validated_at = OffsetDateTime::from_unix_timestamp(1_743_206_560)
        .expect("fixture timestamp should be valid");
    let draft = PlaybookDraft {
        draft_id: "draft-1".to_owned(),
        playbook_handle_id: "handle-1".to_owned(),
        spec_document: "metadata:\n  title: 我的总结模板\n".to_owned(),
        last_saved_at,
        last_validated_at: Some(last_validated_at),
        validation_state: DraftValidationState::NeedsReview,
    };

    let encoded = to_string(&draft).expect("playbook draft should serialize");
    let decoded: PlaybookDraft = from_str(&encoded).expect("playbook draft should deserialize");

    assert_eq!(decoded.draft_id, "draft-1");
    assert_eq!(decoded.playbook_handle_id, "handle-1");
    assert_eq!(decoded.validation_state, DraftValidationState::NeedsReview);
}

#[test]
fn playbook_version_roundtrips_through_serde_with_basic_fields() {
    let published_at = OffsetDateTime::from_unix_timestamp(1_743_206_620)
        .expect("fixture timestamp should be valid");
    let version = PlaybookVersion {
        playbook_version_id: Uuid::parse_str("0f9f4f2b-6b93-4d58-a9d8-d8b8684f7350")
            .expect("fixture uuid should be valid"),
        playbook_handle_id: "handle-1".to_owned(),
        version_number: 3,
        spec_document: "metadata:\n  title: 已发布总结模板\n".to_owned(),
        published_at,
        validation_report: sample_health_report(),
    };

    let encoded = to_string(&version).expect("playbook version should serialize");
    let decoded: PlaybookVersion = from_str(&encoded).expect("playbook version should deserialize");

    assert_eq!(decoded.playbook_handle_id, "handle-1");
    assert_eq!(decoded.version_number, 3);
    assert!(decoded.validation_report.publishable);
}

#[test]
fn draft_health_report_roundtrips_through_serde_with_basic_fields() {
    let report = DraftHealthReport {
        publishable: false,
        summary: "缺少能力引用".to_owned(),
        issues: vec![DraftHealthIssue {
            severity: DraftHealthIssueSeverity::Error,
            domain: DraftHealthIssueDomain::Capabilities,
            kind: "missing_capability_ref".to_owned(),
            location: Some("capabilities[0]".to_owned()),
            message: "引用的 capability 不存在".to_owned(),
            related_ref: Some("builtin:missing".to_owned()),
        }],
    };

    let encoded = to_string(&report).expect("health report should serialize");
    let decoded: DraftHealthReport = from_str(&encoded).expect("health report should deserialize");

    assert!(!decoded.publishable);
    assert_eq!(decoded.summary, "缺少能力引用");
    assert_eq!(decoded.issues.len(), 1);
    assert_eq!(
        decoded.issues[0].domain,
        DraftHealthIssueDomain::Capabilities
    );
}

fn sample_health_report() -> DraftHealthReport {
    DraftHealthReport {
        publishable: true,
        summary: "可以发布".to_owned(),
        issues: Vec::new(),
    }
}
