use crate::workspace::entity::WorkspaceMembership;
use crate::workspace::rbac::Permission;

/// Permission checker for workspace operations
///
/// Provides centralized permission validation for API layer
#[derive(Debug, Clone)]
pub struct PermissionChecker;

impl PermissionChecker {
    /// Create a new permission checker
    pub fn new() -> Self {
        Self
    }

    /// Check if a membership has a specific permission
    ///
    /// # Examples
    /// ```
    /// use decacan_runtime::workspace::rbac::{
    ///     PermissionChecker, Permission, ResourceType, ActionType, WorkspaceRole
    /// };
    /// use decacan_runtime::workspace::entity::WorkspaceMembership;
    ///
    /// let checker = PermissionChecker::new();
    /// let membership = WorkspaceMembership::new(
    ///     "member-1",
    ///     "ws-1",
    ///     "user-1",
    ///     WorkspaceRole::Editor,
    ///     None,
    /// );
    ///
    /// let read_permission = Permission::new(ResourceType::Playbook, ActionType::Read);
    /// assert!(checker.check(&membership, &read_permission));
    /// ```
    pub fn check(&self, membership: &WorkspaceMembership, permission: &Permission) -> bool {
        membership.has_permission(permission)
    }

    /// Check if a membership has any of the specified permissions
    ///
    /// Returns true if the membership has at least one of the permissions
    pub fn check_any(&self, membership: &WorkspaceMembership, permissions: &[Permission]) -> bool {
        permissions.iter().any(|p| membership.has_permission(p))
    }

    /// Check if a membership has all of the specified permissions
    ///
    /// Returns true only if the membership has every permission
    pub fn check_all(&self, membership: &WorkspaceMembership, permissions: &[Permission]) -> bool {
        permissions.iter().all(|p| membership.has_permission(p))
    }

    /// Require a permission, returning an error if not granted
    ///
    /// # Errors
    /// Returns PermissionDenied error if the membership doesn't have the permission
    pub fn require(
        &self,
        membership: &WorkspaceMembership,
        permission: &Permission,
    ) -> Result<(), PermissionDenied> {
        if self.check(membership, permission) {
            Ok(())
        } else {
            Err(PermissionDenied {
                resource: format!("{:?}", permission.resource),
                action: format!("{:?}", permission.action),
            })
        }
    }
}

impl Default for PermissionChecker {
    fn default() -> Self {
        Self::new()
    }
}

/// Error returned when permission is denied
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct PermissionDenied {
    pub resource: String,
    pub action: String,
}

impl std::fmt::Display for PermissionDenied {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        write!(f, "Permission denied: {} on {}", self.action, self.resource)
    }
}

impl std::error::Error for PermissionDenied {}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::workspace::rbac::{ActionType, ResourceType, WorkspaceRole};

    #[test]
    fn checker_validates_permission() {
        let checker = PermissionChecker::new();
        let membership =
            WorkspaceMembership::new("member-1", "ws-1", "user-1", WorkspaceRole::Editor, None);

        let read_playbook = Permission::new(ResourceType::Playbook, ActionType::Read);
        let delete_workspace = Permission::new(ResourceType::Workspace, ActionType::Delete);

        assert!(checker.check(&membership, &read_playbook));
        assert!(!checker.check(&membership, &delete_workspace));
    }

    #[test]
    fn checker_check_any_returns_true_if_any_permission_granted() {
        let checker = PermissionChecker::new();
        let membership =
            WorkspaceMembership::new("member-1", "ws-1", "user-1", WorkspaceRole::Editor, None);

        let permissions = vec![
            Permission::new(ResourceType::Playbook, ActionType::Delete), // Editor can't delete
            Permission::new(ResourceType::Playbook, ActionType::Read),   // But can read
        ];

        assert!(checker.check_any(&membership, &permissions));
    }

    #[test]
    fn checker_check_all_requires_all_permissions() {
        let checker = PermissionChecker::new();
        let membership =
            WorkspaceMembership::new("member-1", "ws-1", "user-1", WorkspaceRole::Editor, None);

        let permissions = vec![
            Permission::new(ResourceType::Playbook, ActionType::Read),
            Permission::new(ResourceType::Playbook, ActionType::Update),
        ];

        assert!(checker.check_all(&membership, &permissions));

        let permissions_with_delete = vec![
            Permission::new(ResourceType::Playbook, ActionType::Read),
            Permission::new(ResourceType::Workspace, ActionType::Delete), // Editor can't delete workspace
        ];

        assert!(!checker.check_all(&membership, &permissions_with_delete));
    }

    #[test]
    fn checker_require_returns_ok_when_permission_granted() {
        let checker = PermissionChecker::new();
        let membership =
            WorkspaceMembership::new("member-1", "ws-1", "user-1", WorkspaceRole::Editor, None);

        let read_permission = Permission::new(ResourceType::Playbook, ActionType::Read);
        assert!(checker.require(&membership, &read_permission).is_ok());
    }

    #[test]
    fn checker_require_returns_error_when_permission_denied() {
        let checker = PermissionChecker::new();
        let membership =
            WorkspaceMembership::new("member-1", "ws-1", "user-1", WorkspaceRole::Editor, None);

        let delete_permission = Permission::new(ResourceType::Workspace, ActionType::Delete);
        let result = checker.require(&membership, &delete_permission);

        assert!(result.is_err());
        let err = result.unwrap_err();
        assert!(err.to_string().contains("Permission denied"));
    }
}
