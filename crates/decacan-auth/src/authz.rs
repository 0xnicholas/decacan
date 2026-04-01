use async_trait::async_trait;
use crate::WorkspaceRole;
use crate::error::AuthResult;

#[async_trait]
pub trait Authorization: Send + Sync {
    async fn authenticate(&self, token: &str) -> AuthResult<String>;
    
    async fn check_workspace_role(
        &self,
        user_id: &str,
        workspace_id: &str,
    ) -> AuthResult<Option<WorkspaceRole>>;
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum Permission {
    ViewWorkspace,
    EditWorkspace,
    DeleteWorkspace,
    ManageMembers,
    CreatePlaybook,
    EditPlaybook,
    RunTask,
}

impl Permission {
    pub fn required_role(&self) -> WorkspaceRole {
        match self {
            Self::ViewWorkspace => WorkspaceRole::Viewer,
            Self::CreatePlaybook |
            Self::EditPlaybook |
            Self::RunTask => WorkspaceRole::Editor,
            Self::EditWorkspace |
            Self::ManageMembers => WorkspaceRole::Admin,
            Self::DeleteWorkspace => WorkspaceRole::Owner,
        }
    }
}
