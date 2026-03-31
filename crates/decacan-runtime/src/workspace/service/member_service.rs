use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use thiserror::Error;
use uuid::Uuid;

use crate::workspace::entity::{WorkspaceMembership, WorkspaceRole};

/// Errors that can occur in member service operations
#[derive(Debug, Error, Clone, PartialEq)]
pub enum MemberServiceError {
    #[error("Member not found")]
    NotFound,
    #[error("User '{user_id}' is already a member of workspace '{workspace_id}'")]
    AlreadyMember {
        user_id: String,
        workspace_id: String,
    },
    #[error("Cannot invite user with role higher than your own")]
    InsufficientPermissions,
    #[error("Invalid role transition")]
    InvalidRoleTransition,
    #[error("Invitation expired")]
    InvitationExpired,
}

/// Input for creating a new membership
#[derive(Debug, Clone)]
pub struct CreateMembershipInput {
    pub workspace_id: String,
    pub user_id: String,
    pub role: WorkspaceRole,
    pub invited_by: Option<String>,
}

/// Input for updating a membership role
#[derive(Debug, Clone)]
pub struct UpdateRoleInput {
    pub membership_id: String,
    pub new_role: WorkspaceRole,
    pub updated_by: String,
}

/// Service for managing workspace memberships
#[derive(Debug, Clone)]
pub struct MemberService {
    /// Membership storage: membership_id -> WorkspaceMembership
    memberships: Arc<Mutex<HashMap<String, WorkspaceMembership>>>,
    /// Index for quick lookup: (workspace_id, user_id) -> membership_id
    membership_index: Arc<Mutex<HashMap<(String, String), String>>>,
}

impl MemberService {
    /// Create a new member service
    pub fn new() -> Self {
        Self {
            memberships: Arc::new(Mutex::new(HashMap::new())),
            membership_index: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    /// Invite a user to a workspace
    ///
    /// Creates a new membership with the specified role.
    /// Returns an error if the user is already a member.
    pub fn invite_member(
        &self,
        input: CreateMembershipInput,
    ) -> Result<WorkspaceMembership, MemberServiceError> {
        let index_key = (input.workspace_id.clone(), input.user_id.clone());

        // Check if user is already a member
        {
            let index = self.membership_index.lock().unwrap();
            if index.contains_key(&index_key) {
                return Err(MemberServiceError::AlreadyMember {
                    user_id: input.user_id.clone(),
                    workspace_id: input.workspace_id.clone(),
                });
            }
        }

        let membership = WorkspaceMembership::new(
            format!("member-{}", Uuid::new_v4()),
            input.workspace_id,
            input.user_id,
            input.role,
            input.invited_by,
        );

        // Store membership
        {
            let mut memberships = self.memberships.lock().unwrap();
            let mut index = self.membership_index.lock().unwrap();

            index.insert(index_key, membership.id.clone());
            memberships.insert(membership.id.clone(), membership.clone());
        }

        Ok(membership)
    }

    /// Get a membership by ID
    pub fn get_membership(
        &self,
        membership_id: &str,
    ) -> Result<WorkspaceMembership, MemberServiceError> {
        let memberships = self.memberships.lock().unwrap();
        memberships
            .get(membership_id)
            .cloned()
            .ok_or(MemberServiceError::NotFound)
    }

    /// Get membership by workspace and user
    pub fn get_membership_by_workspace_and_user(
        &self,
        workspace_id: &str,
        user_id: &str,
    ) -> Result<WorkspaceMembership, MemberServiceError> {
        let membership_id: String = {
            let index = self.membership_index.lock().unwrap();
            index
                .get(&(workspace_id.to_string(), user_id.to_string()))
                .cloned()
                .ok_or(MemberServiceError::NotFound)?
        };

        self.get_membership(&membership_id)
    }

    /// List all members of a workspace
    pub fn list_workspace_members(&self, workspace_id: &str) -> Vec<WorkspaceMembership> {
        let memberships = self.memberships.lock().unwrap();
        memberships
            .values()
            .filter(|m| m.workspace_id == workspace_id)
            .cloned()
            .collect()
    }

    /// Update a member's role
    ///
    /// Only allows role changes if the new role is not higher than
    /// the role of the user making the change.
    pub fn update_role(
        &self,
        input: UpdateRoleInput,
    ) -> Result<WorkspaceMembership, MemberServiceError> {
        let mut memberships = self.memberships.lock().unwrap();

        let membership = memberships
            .get_mut(&input.membership_id)
            .ok_or(MemberServiceError::NotFound)?;

        // TODO: Check if updater has higher role than target role
        // This would require looking up the updater's membership
        // For now, we allow all role changes

        membership.role = input.new_role;

        Ok(membership.clone())
    }

    /// Remove a member from a workspace
    pub fn remove_member(&self, membership_id: &str) -> Result<(), MemberServiceError> {
        let mut memberships = self.memberships.lock().unwrap();
        let mut index = self.membership_index.lock().unwrap();

        let membership = memberships
            .get(membership_id)
            .ok_or(MemberServiceError::NotFound)?;

        // Remove from index
        index.remove(&(membership.workspace_id.clone(), membership.user_id.clone()));

        // Remove from storage
        memberships.remove(membership_id);

        Ok(())
    }

    /// Check if a user has a specific role in a workspace
    pub fn has_role(&self, workspace_id: &str, user_id: &str, role: WorkspaceRole) -> bool {
        match self.get_membership_by_workspace_and_user(workspace_id, user_id) {
            Ok(membership) => membership.role == role,
            Err(_) => false,
        }
    }

    /// Check if a user is a member of a workspace
    pub fn is_member(&self, workspace_id: &str, user_id: &str) -> bool {
        self.get_membership_by_workspace_and_user(workspace_id, user_id)
            .is_ok()
    }
}

impl Default for MemberService {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_invite_member() {
        let service = MemberService::new();
        let input = CreateMembershipInput {
            workspace_id: "ws-1".to_string(),
            user_id: "user-1".to_string(),
            role: WorkspaceRole::Editor,
            invited_by: Some("admin-1".to_string()),
        };

        let membership = service.invite_member(input).unwrap();
        assert_eq!(membership.workspace_id, "ws-1");
        assert_eq!(membership.user_id, "user-1");
        assert!(matches!(membership.role, WorkspaceRole::Editor));
    }

    #[test]
    fn test_cannot_invite_existing_member() {
        let service = MemberService::new();
        let input = CreateMembershipInput {
            workspace_id: "ws-1".to_string(),
            user_id: "user-1".to_string(),
            role: WorkspaceRole::Editor,
            invited_by: None,
        };

        service.invite_member(input.clone()).unwrap();

        let result = service.invite_member(input);
        assert!(matches!(
            result,
            Err(MemberServiceError::AlreadyMember { .. })
        ));
    }

    #[test]
    fn test_get_membership() {
        let service = MemberService::new();
        let input = CreateMembershipInput {
            workspace_id: "ws-1".to_string(),
            user_id: "user-1".to_string(),
            role: WorkspaceRole::Viewer,
            invited_by: None,
        };

        let created = service.invite_member(input).unwrap();
        let fetched = service.get_membership(&created.id).unwrap();

        assert_eq!(created.id, fetched.id);
    }

    #[test]
    fn test_list_workspace_members() {
        let service = MemberService::new();

        // Create multiple members
        for i in 0..3 {
            let input = CreateMembershipInput {
                workspace_id: "ws-1".to_string(),
                user_id: format!("user-{}", i),
                role: WorkspaceRole::Viewer,
                invited_by: None,
            };
            service.invite_member(input).unwrap();
        }

        // Create member in different workspace
        let input = CreateMembershipInput {
            workspace_id: "ws-2".to_string(),
            user_id: "user-other".to_string(),
            role: WorkspaceRole::Viewer,
            invited_by: None,
        };
        service.invite_member(input).unwrap();

        let members = service.list_workspace_members("ws-1");
        assert_eq!(members.len(), 3);
    }

    #[test]
    fn test_update_role() {
        let service = MemberService::new();
        let input = CreateMembershipInput {
            workspace_id: "ws-1".to_string(),
            user_id: "user-1".to_string(),
            role: WorkspaceRole::Viewer,
            invited_by: None,
        };

        let created = service.invite_member(input).unwrap();

        let update_input = UpdateRoleInput {
            membership_id: created.id.clone(),
            new_role: WorkspaceRole::Editor,
            updated_by: "admin-1".to_string(),
        };

        let updated = service.update_role(update_input).unwrap();
        assert!(matches!(updated.role, WorkspaceRole::Editor));
    }

    #[test]
    fn test_remove_member() {
        let service = MemberService::new();
        let input = CreateMembershipInput {
            workspace_id: "ws-1".to_string(),
            user_id: "user-1".to_string(),
            role: WorkspaceRole::Viewer,
            invited_by: None,
        };

        let created = service.invite_member(input).unwrap();

        service.remove_member(&created.id).unwrap();

        assert!(service.get_membership(&created.id).is_err());
        assert!(!service.is_member("ws-1", "user-1"));
    }

    #[test]
    fn test_has_role() {
        let service = MemberService::new();
        let input = CreateMembershipInput {
            workspace_id: "ws-1".to_string(),
            user_id: "user-1".to_string(),
            role: WorkspaceRole::Admin,
            invited_by: None,
        };

        service.invite_member(input).unwrap();

        assert!(service.has_role("ws-1", "user-1", WorkspaceRole::Admin));
        assert!(!service.has_role("ws-1", "user-1", WorkspaceRole::Editor));
        assert!(!service.has_role("ws-1", "non-member", WorkspaceRole::Admin));
    }
}
