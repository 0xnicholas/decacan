use decacan_runtime::workspace::entity::{
    StorageConfig, WorkspaceSettings, WorkspaceStatus, WorkspaceVisibility,
};
use decacan_runtime::workspace::service::workspace_service::{
    CreateWorkspaceInput, WorkspaceService, WorkspaceServiceError,
};

#[tokio::test]
async fn test_create_workspace() {
    let service = WorkspaceService::new();

    let input = CreateWorkspaceInput {
        owner_id: "tenant-1".to_string(),
        slug: "my-workspace".to_string(),
        name: "My Workspace".to_string(),
        description: Some("Test description".to_string()),
        storage_config: StorageConfig::local("/data/ws-1"),
        visibility: WorkspaceVisibility::Private,
        settings: WorkspaceSettings::default(),
        created_by: "user-1".to_string(),
    };

    let result = service.create_workspace(input).await;
    assert!(result.is_ok());

    let workspace = result.unwrap();
    assert_eq!(workspace.owner_id, "tenant-1");
    assert_eq!(workspace.slug, "my-workspace");
    assert_eq!(workspace.name, "My Workspace");
    assert_eq!(workspace.description, Some("Test description".to_string()));
    assert!(matches!(workspace.status, WorkspaceStatus::Draft));
}

#[tokio::test]
async fn test_enforce_unique_slug_per_tenant() {
    let service = WorkspaceService::new();

    let input1 = CreateWorkspaceInput {
        owner_id: "tenant-1".to_string(),
        slug: "my-workspace".to_string(),
        name: "My Workspace 1".to_string(),
        description: None,
        storage_config: StorageConfig::local("/data/ws-1"),
        visibility: WorkspaceVisibility::Private,
        settings: WorkspaceSettings::default(),
        created_by: "user-1".to_string(),
    };

    let result1 = service.create_workspace(input1).await;
    assert!(result1.is_ok());

    let input2 = CreateWorkspaceInput {
        owner_id: "tenant-1".to_string(),
        slug: "my-workspace".to_string(),
        name: "My Workspace 2".to_string(),
        description: None,
        storage_config: StorageConfig::local("/data/ws-2"),
        visibility: WorkspaceVisibility::Private,
        settings: WorkspaceSettings::default(),
        created_by: "user-1".to_string(),
    };

    let result2 = service.create_workspace(input2).await;
    assert!(result2.is_err());
    assert!(matches!(
        result2.unwrap_err(),
        WorkspaceServiceError::AlreadyExists { .. }
    ));
}

#[tokio::test]
async fn test_same_slug_different_tenant() {
    let service = WorkspaceService::new();

    let input1 = CreateWorkspaceInput {
        owner_id: "tenant-1".to_string(),
        slug: "my-workspace".to_string(),
        name: "My Workspace 1".to_string(),
        description: None,
        storage_config: StorageConfig::local("/data/ws-1"),
        visibility: WorkspaceVisibility::Private,
        settings: WorkspaceSettings::default(),
        created_by: "user-1".to_string(),
    };

    let result1 = service.create_workspace(input1).await;
    assert!(result1.is_ok());

    let input2 = CreateWorkspaceInput {
        owner_id: "tenant-2".to_string(),
        slug: "my-workspace".to_string(),
        name: "My Workspace 2".to_string(),
        description: None,
        storage_config: StorageConfig::local("/data/ws-2"),
        visibility: WorkspaceVisibility::Private,
        settings: WorkspaceSettings::default(),
        created_by: "user-2".to_string(),
    };

    let result2 = service.create_workspace(input2).await;
    assert!(result2.is_ok());
}

#[tokio::test]
async fn test_get_workspace() {
    let service = WorkspaceService::new();

    let input = CreateWorkspaceInput {
        owner_id: "tenant-1".to_string(),
        slug: "my-workspace".to_string(),
        name: "My Workspace".to_string(),
        description: None,
        storage_config: StorageConfig::local("/data/ws-1"),
        visibility: WorkspaceVisibility::Private,
        settings: WorkspaceSettings::default(),
        created_by: "user-1".to_string(),
    };

    let created = service.create_workspace(input).await.unwrap();

    let result = service.get_workspace(&created.id).await;
    assert!(result.is_ok());
    assert_eq!(result.unwrap().slug, "my-workspace");

    let result = service.get_workspace("non-existent-id").await;
    assert!(result.is_err());
    assert!(matches!(
        result.unwrap_err(),
        WorkspaceServiceError::NotFound
    ));
}

#[tokio::test]
async fn test_list_workspaces() {
    let service = WorkspaceService::new();

    let workspaces = service.list_workspaces("tenant-1").await;
    assert!(workspaces.is_empty());

    let input1 = CreateWorkspaceInput {
        owner_id: "tenant-1".to_string(),
        slug: "workspace-1".to_string(),
        name: "Workspace 1".to_string(),
        description: None,
        storage_config: StorageConfig::local("/data/ws-1"),
        visibility: WorkspaceVisibility::Private,
        settings: WorkspaceSettings::default(),
        created_by: "user-1".to_string(),
    };

    let input2 = CreateWorkspaceInput {
        owner_id: "tenant-1".to_string(),
        slug: "workspace-2".to_string(),
        name: "Workspace 2".to_string(),
        description: None,
        storage_config: StorageConfig::local("/data/ws-2"),
        visibility: WorkspaceVisibility::Private,
        settings: WorkspaceSettings::default(),
        created_by: "user-1".to_string(),
    };

    service.create_workspace(input1).await.unwrap();
    service.create_workspace(input2).await.unwrap();

    let workspaces = service.list_workspaces("tenant-1").await;
    assert_eq!(workspaces.len(), 2);
}

#[tokio::test]
async fn test_activate_workspace() {
    let service = WorkspaceService::new();

    let input = CreateWorkspaceInput {
        owner_id: "tenant-1".to_string(),
        slug: "my-workspace".to_string(),
        name: "My Workspace".to_string(),
        description: None,
        storage_config: StorageConfig::local("/data/ws-1"),
        visibility: WorkspaceVisibility::Private,
        settings: WorkspaceSettings::default(),
        created_by: "user-1".to_string(),
    };

    let created = service.create_workspace(input).await.unwrap();
    assert!(matches!(created.status, WorkspaceStatus::Draft));

    let result = service.activate_workspace(&created.id).await;
    assert!(result.is_ok());

    let workspace = service.get_workspace(&created.id).await.unwrap();
    assert!(matches!(workspace.status, WorkspaceStatus::Active));
}

#[tokio::test]
async fn test_archive_workspace() {
    let service = WorkspaceService::new();

    let input = CreateWorkspaceInput {
        owner_id: "tenant-1".to_string(),
        slug: "my-workspace".to_string(),
        name: "My Workspace".to_string(),
        description: None,
        storage_config: StorageConfig::local("/data/ws-1"),
        visibility: WorkspaceVisibility::Private,
        settings: WorkspaceSettings::default(),
        created_by: "user-1".to_string(),
    };

    let created = service.create_workspace(input).await.unwrap();

    service.activate_workspace(&created.id).await.unwrap();

    let result = service.archive_workspace(&created.id).await;
    assert!(result.is_ok());

    let workspace = service.get_workspace(&created.id).await.unwrap();
    assert!(matches!(workspace.status, WorkspaceStatus::Archived));
    assert!(workspace.archived_at.is_some());
}

#[tokio::test]
async fn test_restore_workspace() {
    let service = WorkspaceService::new();

    let input = CreateWorkspaceInput {
        owner_id: "tenant-1".to_string(),
        slug: "my-workspace".to_string(),
        name: "My Workspace".to_string(),
        description: None,
        storage_config: StorageConfig::local("/data/ws-1"),
        visibility: WorkspaceVisibility::Private,
        settings: WorkspaceSettings::default(),
        created_by: "user-1".to_string(),
    };

    let created = service.create_workspace(input).await.unwrap();
    service.activate_workspace(&created.id).await.unwrap();
    service.archive_workspace(&created.id).await.unwrap();

    let result = service.restore_workspace(&created.id).await;
    assert!(result.is_ok());

    let workspace = service.get_workspace(&created.id).await.unwrap();
    assert!(matches!(workspace.status, WorkspaceStatus::Active));
    assert!(workspace.archived_at.is_none());
}

#[tokio::test]
async fn test_delete_workspace() {
    let service = WorkspaceService::new();

    let input = CreateWorkspaceInput {
        owner_id: "tenant-1".to_string(),
        slug: "my-workspace".to_string(),
        name: "My Workspace".to_string(),
        description: None,
        storage_config: StorageConfig::local("/data/ws-1"),
        visibility: WorkspaceVisibility::Private,
        settings: WorkspaceSettings::default(),
        created_by: "user-1".to_string(),
    };

    let created = service.create_workspace(input).await.unwrap();

    service.activate_workspace(&created.id).await.unwrap();
    service.archive_workspace(&created.id).await.unwrap();

    let result = service.delete_workspace(&created.id).await;
    assert!(result.is_ok());

    let result = service.get_workspace(&created.id).await;
    assert!(result.is_err());
    assert!(matches!(
        result.unwrap_err(),
        WorkspaceServiceError::NotFound
    ));
}

#[tokio::test]
async fn test_invalid_state_transition_archive_draft() {
    let service = WorkspaceService::new();

    let input = CreateWorkspaceInput {
        owner_id: "tenant-1".to_string(),
        slug: "my-workspace".to_string(),
        name: "My Workspace".to_string(),
        description: None,
        storage_config: StorageConfig::local("/data/ws-1"),
        visibility: WorkspaceVisibility::Private,
        settings: WorkspaceSettings::default(),
        created_by: "user-1".to_string(),
    };

    let created = service.create_workspace(input).await.unwrap();

    let result = service.archive_workspace(&created.id).await;
    assert!(result.is_err());
    assert!(matches!(
        result.unwrap_err(),
        WorkspaceServiceError::InvalidStateTransition { .. }
    ));
}

#[tokio::test]
async fn test_invalid_state_transition_activate_deleted() {
    let service = WorkspaceService::new();

    let input = CreateWorkspaceInput {
        owner_id: "tenant-1".to_string(),
        slug: "my-workspace".to_string(),
        name: "My Workspace".to_string(),
        description: None,
        storage_config: StorageConfig::local("/data/ws-1"),
        visibility: WorkspaceVisibility::Private,
        settings: WorkspaceSettings::default(),
        created_by: "user-1".to_string(),
    };

    let created = service.create_workspace(input).await.unwrap();
    service.activate_workspace(&created.id).await.unwrap();
    service.archive_workspace(&created.id).await.unwrap();
    service.delete_workspace(&created.id).await.unwrap();

    let result = service.activate_workspace(&created.id).await;
    assert!(result.is_err());
    assert!(matches!(
        result.unwrap_err(),
        WorkspaceServiceError::NotFound
    ));
}
