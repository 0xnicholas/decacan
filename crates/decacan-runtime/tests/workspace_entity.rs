use decacan_runtime::workspace::entity::storage::{StorageConfig, StorageProvider};
use decacan_runtime::workspace::entity::workspace::{
    Workspace, WorkspaceFeatures, WorkspaceSettings, WorkspaceStatus, WorkspaceVisibility,
};
use decacan_runtime::workspace::entity::{User, UserStatus, WorkspaceMembership, WorkspaceRole};
use time::OffsetDateTime;

#[test]
fn workspace_has_all_required_fields() {
    let workspace = Workspace::new_for_test("ws-1", "My Workspace", "/data/ws-1");

    assert_eq!(workspace.id, "ws-1");
    assert_eq!(workspace.owner_id, "default");
    assert_eq!(workspace.slug, "ws-1");
    assert_eq!(workspace.name, "My Workspace");
    assert_eq!(workspace.description, None);
    assert_eq!(workspace.icon_url, None);
    assert_eq!(workspace.status, WorkspaceStatus::Active);
    assert_eq!(workspace.visibility, WorkspaceVisibility::Private);

    assert!(workspace.created_at <= OffsetDateTime::now_utc());
    assert!(workspace.updated_at <= OffsetDateTime::now_utc());
    assert_eq!(workspace.archived_at, None);

    assert!(
        !workspace.version_id.to_string().is_empty(),
        "version_id should be a valid UUID"
    );

    assert_eq!(workspace.storage_config.provider, StorageProvider::Local);
}

#[test]
fn workspace_status_transitions() {
    assert!(WorkspaceStatus::Draft.can_transition_to(WorkspaceStatus::Active));
    assert!(WorkspaceStatus::Active.can_transition_to(WorkspaceStatus::Archived));
    assert!(WorkspaceStatus::Active.can_transition_to(WorkspaceStatus::Deleted));
    assert!(WorkspaceStatus::Archived.can_transition_to(WorkspaceStatus::Active));
    assert!(WorkspaceStatus::Archived.can_transition_to(WorkspaceStatus::Deleted));

    assert!(!WorkspaceStatus::Draft.can_transition_to(WorkspaceStatus::Archived));
    assert!(!WorkspaceStatus::Draft.can_transition_to(WorkspaceStatus::Deleted));
    assert!(!WorkspaceStatus::Active.can_transition_to(WorkspaceStatus::Draft));
    assert!(!WorkspaceStatus::Deleted.can_transition_to(WorkspaceStatus::Active));
    assert!(!WorkspaceStatus::Deleted.can_transition_to(WorkspaceStatus::Draft));
    assert!(!WorkspaceStatus::Deleted.can_transition_to(WorkspaceStatus::Archived));
}

#[test]
fn workspace_archive_and_restore() {
    let mut workspace = Workspace::new_for_test("ws-1", "My Workspace", "/data/ws-1");

    workspace.activate();
    assert_eq!(workspace.status, WorkspaceStatus::Active);

    workspace.archive();
    assert_eq!(workspace.status, WorkspaceStatus::Archived);
    assert!(workspace.archived_at.is_some());

    workspace.restore();
    assert_eq!(workspace.status, WorkspaceStatus::Active);
    assert_eq!(workspace.archived_at, None);
}

#[test]
fn storage_config_serialization() {
    let local_config = StorageConfig::local("/data/workspaces");
    let json = serde_json::to_string(&local_config).unwrap();
    assert!(json.contains("local"));
    assert!(json.contains("/data/workspaces"));

    let deserialized: StorageConfig = serde_json::from_str(&json).unwrap();
    assert_eq!(local_config, deserialized);

    let s3_config = StorageConfig::s3("my-bucket", "us-west-2");
    let json = serde_json::to_string(&s3_config).unwrap();
    assert!(json.contains("s3"));
    assert!(json.contains("my-bucket"));
    assert!(json.contains("us-west-2"));

    let deserialized: StorageConfig = serde_json::from_str(&json).unwrap();
    assert_eq!(s3_config, deserialized);
}

#[test]
fn workspace_settings_enforce_limits() {
    let settings = WorkspaceSettings {
        max_members: 10,
        storage_quota_mb: 1024,
        max_tasks_per_day: 100,
        retention_days: 30,
        features: WorkspaceFeatures {
            enable_team_execution: true,
            enable_custom_extensions: false,
            enable_api_access: true,
            enable_audit_logs: true,
        },
    };

    assert!(settings.is_within_quota(512));
    assert!(settings.is_within_quota(1024));
    assert!(!settings.is_within_quota(1025));
    assert!(!settings.is_within_quota(2048));
}

#[test]
fn workspace_settings_default() {
    let settings: WorkspaceSettings = Default::default();

    assert_eq!(settings.max_members, 100);
    assert_eq!(settings.storage_quota_mb, 10_240);
    assert_eq!(settings.max_tasks_per_day, 1000);
    assert_eq!(settings.retention_days, 90);
    assert!(!settings.features.enable_custom_extensions);
}

#[test]
fn workspace_features_default() {
    let features: WorkspaceFeatures = Default::default();

    assert!(!features.enable_team_execution);
    assert!(!features.enable_custom_extensions);
    assert!(!features.enable_api_access);
    assert!(!features.enable_audit_logs);
}

#[test]
fn workspace_new_sets_timestamps() {
    let before = OffsetDateTime::now_utc();
    let workspace = Workspace::new_with_config(
        "ws-1",
        "tenant-1",
        "my-workspace",
        "My Workspace",
        Some("Description"),
        None::<String>,
        StorageConfig::local("/data/ws"),
        WorkspaceVisibility::Organization,
        WorkspaceSettings::default(),
        "user-1",
    );
    let after = OffsetDateTime::now_utc();

    assert!(workspace.created_at >= before);
    assert!(workspace.created_at <= after);
    assert!(workspace.updated_at >= before);
    assert!(workspace.updated_at <= after);
    assert_eq!(workspace.created_at, workspace.updated_at);
}

#[test]
fn workspace_visibility_serialization() {
    let private = WorkspaceVisibility::Private;
    let org = WorkspaceVisibility::Organization;
    let public = WorkspaceVisibility::Public;

    let private_json = serde_json::to_string(&private).unwrap();
    let org_json = serde_json::to_string(&org).unwrap();
    let public_json = serde_json::to_string(&public).unwrap();

    assert_eq!(private_json, "\"private\"");
    assert_eq!(org_json, "\"organization\"");
    assert_eq!(public_json, "\"public\"");

    assert_eq!(
        serde_json::from_str::<WorkspaceVisibility>(&private_json).unwrap(),
        WorkspaceVisibility::Private
    );
    assert_eq!(
        serde_json::from_str::<WorkspaceVisibility>(&org_json).unwrap(),
        WorkspaceVisibility::Organization
    );
    assert_eq!(
        serde_json::from_str::<WorkspaceVisibility>(&public_json).unwrap(),
        WorkspaceVisibility::Public
    );
}

#[test]
fn workspace_status_serialization() {
    let draft = WorkspaceStatus::Draft;
    let active = WorkspaceStatus::Active;
    let archived = WorkspaceStatus::Archived;
    let deleted = WorkspaceStatus::Deleted;

    assert_eq!(serde_json::to_string(&draft).unwrap(), "\"draft\"");
    assert_eq!(serde_json::to_string(&active).unwrap(), "\"active\"");
    assert_eq!(serde_json::to_string(&archived).unwrap(), "\"archived\"");
    assert_eq!(serde_json::to_string(&deleted).unwrap(), "\"deleted\"");

    assert_eq!(
        serde_json::from_str::<WorkspaceStatus>("\"draft\"").unwrap(),
        WorkspaceStatus::Draft
    );
    assert_eq!(
        serde_json::from_str::<WorkspaceStatus>("\"active\"").unwrap(),
        WorkspaceStatus::Active
    );
    assert_eq!(
        serde_json::from_str::<WorkspaceStatus>("\"archived\"").unwrap(),
        WorkspaceStatus::Archived
    );
    assert_eq!(
        serde_json::from_str::<WorkspaceStatus>("\"deleted\"").unwrap(),
        WorkspaceStatus::Deleted
    );
}

#[test]
fn storage_provider_serialization() {
    let local = StorageProvider::Local;
    let s3 = StorageProvider::S3;
    let gcs = StorageProvider::Gcs;
    let azure = StorageProvider::AzureBlob;

    assert_eq!(serde_json::to_string(&local).unwrap(), "\"local\"");
    assert_eq!(serde_json::to_string(&s3).unwrap(), "\"s3\"");
    assert_eq!(serde_json::to_string(&gcs).unwrap(), "\"gcs\"");
    assert_eq!(serde_json::to_string(&azure).unwrap(), "\"azure_blob\"");

    assert_eq!(
        serde_json::from_str::<StorageProvider>("\"local\"").unwrap(),
        StorageProvider::Local
    );
    assert_eq!(
        serde_json::from_str::<StorageProvider>("\"s3\"").unwrap(),
        StorageProvider::S3
    );
    assert_eq!(
        serde_json::from_str::<StorageProvider>("\"gcs\"").unwrap(),
        StorageProvider::Gcs
    );
    assert_eq!(
        serde_json::from_str::<StorageProvider>("\"azure_blob\"").unwrap(),
        StorageProvider::AzureBlob
    );
}

#[test]
fn workspace_complete_roundtrip() {
    let workspace = Workspace::new_with_config(
        "ws-123",
        "tenant-456",
        "my-awesome-workspace",
        "My Awesome Workspace",
        Some("A great workspace"),
        Some("https://example.com/icon.png".to_string()),
        StorageConfig::s3("my-bucket", "us-east-1"),
        WorkspaceVisibility::Public,
        WorkspaceSettings {
            max_members: 50,
            storage_quota_mb: 5000,
            max_tasks_per_day: 500,
            retention_days: 60,
            features: WorkspaceFeatures {
                enable_team_execution: true,
                enable_custom_extensions: true,
                enable_api_access: true,
                enable_audit_logs: false,
            },
        },
        "user-789",
    );

    let json = serde_json::to_string(&workspace).unwrap();
    let deserialized: Workspace = serde_json::from_str(&json).unwrap();

    assert_eq!(workspace.id, deserialized.id);
    assert_eq!(workspace.owner_id, deserialized.owner_id);
    assert_eq!(workspace.slug, deserialized.slug);
    assert_eq!(workspace.name, deserialized.name);
    assert_eq!(workspace.description, deserialized.description);
    assert_eq!(workspace.icon_url, deserialized.icon_url);
    assert_eq!(workspace.status, deserialized.status);
    assert_eq!(workspace.visibility, deserialized.visibility);
    assert_eq!(workspace.storage_config, deserialized.storage_config);
    assert_eq!(
        workspace.settings.max_members,
        deserialized.settings.max_members
    );
    assert_eq!(
        workspace.settings.storage_quota_mb,
        deserialized.settings.storage_quota_mb
    );
    assert_eq!(
        workspace.settings.features.enable_team_execution,
        deserialized.settings.features.enable_team_execution
    );
}

#[test]
fn user_has_required_fields() {
    let user = User::new("user-1", "tenant-1", "user@example.com", "John Doe", None);

    assert_eq!(user.id, "user-1");
    assert_eq!(user.owner_id, "tenant-1");
    assert_eq!(user.email, "user@example.com");
    assert_eq!(user.name, "John Doe");
    assert!(matches!(user.status, UserStatus::Active));
}

#[test]
fn workspace_membership_has_role() {
    let membership =
        WorkspaceMembership::new("member-1", "ws-1", "user-1", WorkspaceRole::Editor, None);

    assert_eq!(membership.workspace_id, "ws-1");
    assert_eq!(membership.user_id, "user-1");
    assert!(matches!(membership.role, WorkspaceRole::Editor));
}
