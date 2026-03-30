use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ResourceType {
    Workspace,
    Playbook,
    Task,
    Artifact,
    Member,
    Policy,
    Setting,
    Any,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ActionType {
    Create,
    Read,
    Update,
    Delete,
    Execute,
    Publish,
    Invite,
    Admin,
    Any,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Permission {
    pub resource: ResourceType,
    pub action: ActionType,
}

impl Permission {
    pub fn new(resource: ResourceType, action: ActionType) -> Self {
        Self { resource, action }
    }

    pub fn covers(&self, other: &Permission) -> bool {
        // General permission covers specific permission
        let resource_matches =
            self.resource == ResourceType::Any || self.resource == other.resource;
        let action_matches = self.action == ActionType::Any || self.action == other.action;
        resource_matches && action_matches
    }

    pub fn all_resources(action: ActionType) -> Self {
        Self::new(ResourceType::Any, action)
    }

    pub fn all_actions(resource: ResourceType) -> Self {
        Self::new(resource, ActionType::Any)
    }
}
