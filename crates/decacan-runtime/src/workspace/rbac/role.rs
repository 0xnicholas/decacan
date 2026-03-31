use super::permission::{ActionType, Permission, ResourceType};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkspaceRole {
    Owner,
    Admin,
    Editor,
    Viewer,
    Guest,
}

impl WorkspaceRole {
    pub fn as_str(&self) -> &'static str {
        match self {
            Self::Owner => "owner",
            Self::Admin => "admin",
            Self::Editor => "editor",
            Self::Viewer => "viewer",
            Self::Guest => "guest",
        }
    }

    pub fn permissions(&self) -> Vec<Permission> {
        match self {
            WorkspaceRole::Owner => Self::owner_permissions(),
            WorkspaceRole::Admin => Self::admin_permissions(),
            WorkspaceRole::Editor => Self::editor_permissions(),
            WorkspaceRole::Viewer => Self::viewer_permissions(),
            WorkspaceRole::Guest => Self::guest_permissions(),
        }
    }

    fn owner_permissions() -> Vec<Permission> {
        vec![
            Permission::all_actions(ResourceType::Workspace),
            Permission::all_actions(ResourceType::Playbook),
            Permission::all_actions(ResourceType::Task),
            Permission::all_actions(ResourceType::Artifact),
            Permission::all_actions(ResourceType::Member),
            Permission::all_actions(ResourceType::Policy),
            Permission::all_actions(ResourceType::Setting),
        ]
    }

    fn admin_permissions() -> Vec<Permission> {
        // Full control on Playbook/Task/Artifact
        // CRU on Member/Policy/Setting (no Delete)
        vec![
            Permission::all_actions(ResourceType::Playbook),
            Permission::all_actions(ResourceType::Task),
            Permission::all_actions(ResourceType::Artifact),
            Permission::new(ResourceType::Member, ActionType::Create),
            Permission::new(ResourceType::Member, ActionType::Read),
            Permission::new(ResourceType::Member, ActionType::Update),
            Permission::new(ResourceType::Policy, ActionType::Create),
            Permission::new(ResourceType::Policy, ActionType::Read),
            Permission::new(ResourceType::Policy, ActionType::Update),
            Permission::new(ResourceType::Setting, ActionType::Create),
            Permission::new(ResourceType::Setting, ActionType::Read),
            Permission::new(ResourceType::Setting, ActionType::Update),
        ]
    }

    fn editor_permissions() -> Vec<Permission> {
        // CRU on Playbook/Task/Artifact + Execute
        // Read on Setting
        vec![
            Permission::new(ResourceType::Playbook, ActionType::Create),
            Permission::new(ResourceType::Playbook, ActionType::Read),
            Permission::new(ResourceType::Playbook, ActionType::Update),
            Permission::new(ResourceType::Playbook, ActionType::Execute),
            Permission::new(ResourceType::Task, ActionType::Create),
            Permission::new(ResourceType::Task, ActionType::Read),
            Permission::new(ResourceType::Task, ActionType::Update),
            Permission::new(ResourceType::Task, ActionType::Execute),
            Permission::new(ResourceType::Artifact, ActionType::Create),
            Permission::new(ResourceType::Artifact, ActionType::Read),
            Permission::new(ResourceType::Artifact, ActionType::Update),
            Permission::new(ResourceType::Artifact, ActionType::Execute),
            Permission::new(ResourceType::Setting, ActionType::Read),
        ]
    }

    fn viewer_permissions() -> Vec<Permission> {
        // Read on Playbook/Task/Artifact/Setting
        vec![
            Permission::new(ResourceType::Playbook, ActionType::Read),
            Permission::new(ResourceType::Task, ActionType::Read),
            Permission::new(ResourceType::Artifact, ActionType::Read),
            Permission::new(ResourceType::Setting, ActionType::Read),
        ]
    }

    fn guest_permissions() -> Vec<Permission> {
        // Read on Playbook/Artifact only
        vec![
            Permission::new(ResourceType::Playbook, ActionType::Read),
            Permission::new(ResourceType::Artifact, ActionType::Read),
        ]
    }
}
