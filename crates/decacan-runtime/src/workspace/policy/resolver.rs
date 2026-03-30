use std::path::PathBuf;

use crate::workspace::entity::{
    policy::{ReadBoundary, WorkspacePolicy, WorkspaceScope, WriteBoundary},
    PolicyProfile, Workspace,
};

/// Bound inputs that can further restrict policy scope
#[derive(Debug, Clone, Default)]
pub struct BoundInputs {
    /// Optional restricted subpath within the workspace
    pub restricted_subpath: Option<String>,
}

impl BoundInputs {
    /// Create new bound inputs with default values
    pub fn new() -> Self {
        Self::default()
    }

    /// Create bound inputs with a restricted subpath
    pub fn with_restricted_subpath(subpath: impl Into<String>) -> Self {
        Self {
            restricted_subpath: Some(subpath.into()),
        }
    }
}

/// Resolves workspace policies by combining workspace configuration,
/// policy profiles, and bound inputs
#[derive(Debug)]
pub struct WorkspacePolicyResolver<'a> {
    workspace: &'a Workspace,
    profile: &'a PolicyProfile,
    inputs: &'a BoundInputs,
}

impl<'a> WorkspacePolicyResolver<'a> {
    /// Create a new policy resolver
    pub fn new(
        workspace: &'a Workspace,
        profile: &'a PolicyProfile,
        inputs: &'a BoundInputs,
    ) -> Self {
        Self {
            workspace,
            profile,
            inputs,
        }
    }

    /// Resolve and build a complete workspace policy
    pub fn resolve(&self) -> WorkspacePolicy {
        let workspace_id = self.workspace.id.clone();
        let scope = self.build_scope();
        let read_boundary = self.build_read_boundary();
        let write_boundary = self.build_write_boundary();
        let path_rules = self.profile.default_path_rules.clone();

        // Generate a unique policy ID based on workspace and profile
        let policy_id = format!("resolved-{}-{}", self.workspace.id, self.profile.id);

        WorkspacePolicy::new(
            policy_id,
            workspace_id,
            scope,
            read_boundary,
            write_boundary,
            path_rules,
        )
    }

    /// Build the read boundary for this workspace
    fn build_read_boundary(&self) -> ReadBoundary {
        let workspace_root = PathBuf::from(self.workspace.root_path());

        // Start with profile defaults
        let mut read_boundary = self.profile.default_read_boundary.clone();

        // Ensure workspace root is in allowed paths
        if !read_boundary
            .allowed_paths
            .iter()
            .any(|p| p == &workspace_root)
        {
            read_boundary.allowed_paths.push(workspace_root);
        }

        // Apply restricted subpath if specified
        if let Some(ref subpath) = self.inputs.restricted_subpath {
            let restricted = PathBuf::from(self.workspace.root_path()).join(subpath);
            read_boundary.allowed_paths = vec![restricted];
        }

        read_boundary
    }

    /// Build the write boundary for this workspace
    fn build_write_boundary(&self) -> WriteBoundary {
        let workspace_root = PathBuf::from(self.workspace.root_path());
        let output_root = workspace_root.join("output");

        // Create output-only write boundary
        let mut write_boundary = WriteBoundary::output_only(&output_root);

        // Apply profile defaults for other settings
        write_boundary.allow_overwrite = self.profile.default_write_boundary.allow_overwrite;
        write_boundary.require_backup = self.profile.default_write_boundary.require_backup;
        write_boundary.max_file_size_bytes =
            self.profile.default_write_boundary.max_file_size_bytes;

        write_boundary
    }

    /// Build the workspace scope based on inputs and profile
    fn build_scope(&self) -> WorkspaceScope {
        if let Some(ref subpath) = self.inputs.restricted_subpath {
            WorkspaceScope::SubpathOnly(subpath.clone())
        } else {
            self.profile.default_scope.clone()
        }
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    fn create_test_workspace() -> Workspace {
        Workspace::new_for_test("ws-test", "Test", "/workspace/test")
    }

    fn create_test_profile() -> PolicyProfile {
        PolicyProfile::new_for_test("policy-test", "ws-test")
    }

    #[test]
    fn test_resolver_builds_policy() {
        let workspace = create_test_workspace();
        let profile = create_test_profile();
        let inputs = BoundInputs::default();

        let resolver = WorkspacePolicyResolver::new(&workspace, &profile, &inputs);
        let policy = resolver.resolve();

        assert!(policy.id.starts_with("resolved-"));
        assert_eq!(policy.workspace_id, "ws-test");
        assert!(policy.write_boundary.is_restricted_to_output());
    }

    #[test]
    fn test_resolver_with_restricted_subpath() {
        let workspace = create_test_workspace();
        let profile = create_test_profile();
        let inputs = BoundInputs::with_restricted_subpath("subproject");

        let resolver = WorkspacePolicyResolver::new(&workspace, &profile, &inputs);
        let policy = resolver.resolve();

        assert!(matches!(
            policy.scope,
            WorkspaceScope::SubpathOnly(ref s) if s == "subproject"
        ));
    }

    #[test]
    fn test_write_boundary_output_path() {
        let workspace = create_test_workspace();
        let profile = create_test_profile();
        let inputs = BoundInputs::default();

        let resolver = WorkspacePolicyResolver::new(&workspace, &profile, &inputs);
        let policy = resolver.resolve();

        let output_root = PathBuf::from("/workspace/test/output");
        assert!(policy
            .write_boundary
            .allows_write_to(&output_root.join("file.txt")));
    }
}
