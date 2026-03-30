use decacan_runtime::workspace::rbac::{ActionType, Permission, ResourceType, WorkspaceRole};

#[test]
fn owner_has_all_permissions() {
    let owner_perms = WorkspaceRole::Owner.permissions();

    for resource in [
        ResourceType::Workspace,
        ResourceType::Playbook,
        ResourceType::Task,
    ] {
        for action in [
            ActionType::Create,
            ActionType::Read,
            ActionType::Update,
            ActionType::Delete,
        ] {
            let required = Permission::new(resource, action);
            assert!(
                owner_perms.iter().any(|p| p.covers(&required)),
                "Owner should have {:?} on {:?}",
                action,
                resource
            );
        }
    }
}

#[test]
fn viewer_has_only_read_permissions() {
    let viewer_perms = WorkspaceRole::Viewer.permissions();
    assert!(viewer_perms.iter().all(|p| p.action == ActionType::Read));
    assert!(!viewer_perms.iter().any(|p| p.action == ActionType::Create));
}

#[test]
fn permission_covers_works_correctly() {
    let specific = Permission::new(ResourceType::Playbook, ActionType::Read);
    let general = Permission::new(ResourceType::Any, ActionType::Read);

    assert!(general.covers(&specific));
    assert!(!specific.covers(&general));
}

#[test]
fn editor_cannot_delete_workspace() {
    let editor_perms = WorkspaceRole::Editor.permissions();
    let delete_workspace = Permission::new(ResourceType::Workspace, ActionType::Delete);

    assert!(!editor_perms.iter().any(|p| p.covers(&delete_workspace)));
}
