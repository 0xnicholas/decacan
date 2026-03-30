use std::path::{Component, Path, PathBuf};

use crate::workspace::entity::policy::WorkspacePolicy;

/// Validates that paths are within allowed boundaries and prevents traversal attacks
#[derive(Debug, Clone, Default)]
pub struct PathValidator;

impl PathValidator {
    /// Creates a new PathValidator
    pub fn new() -> Self {
        Self
    }

    /// Check if a path is within the specified boundary
    /// Returns false if the path contains ".." (traversal attempt) or escapes the boundary
    pub fn is_within_boundary(&self, path: &Path, boundary: &Path) -> bool {
        // Security check: reject any path containing ".." components
        for component in path.components() {
            if matches!(component, Component::ParentDir) {
                return false;
            }
        }

        let normalized = self.normalize(path);
        normalized.starts_with(boundary)
    }

    /// Normalize a path by resolving . and .. components
    pub fn normalize(&self, path: &Path) -> PathBuf {
        let mut components = Vec::new();

        for component in path.components() {
            match component {
                Component::ParentDir => {
                    components.pop();
                }
                Component::CurDir => {
                    // Skip current directory (.)
                }
                Component::Normal(name) => {
                    components.push(Component::Normal(name));
                }
                Component::RootDir => {
                    components.clear();
                    components.push(Component::RootDir);
                }
                Component::Prefix(prefix) => {
                    components.push(Component::Prefix(prefix));
                }
            }
        }

        let mut result = PathBuf::new();
        for comp in components {
            match comp {
                Component::RootDir => {
                    // Push root directory as a path to preserve leading slash
                    result.push(Path::new("/"));
                }
                _ => {
                    result.push(comp.as_os_str());
                }
            }
        }

        result
    }

    /// Validate a path against a workspace policy
    pub fn validate_against_policy(&self, path: &Path, policy: &WorkspacePolicy) -> bool {
        // First check path rules
        if !policy
            .path_rules
            .is_valid_path(path.to_string_lossy().as_ref())
        {
            return false;
        }

        // Check if path is within read boundary
        for allowed_path in &policy.read_boundary.allowed_paths {
            if path.starts_with(allowed_path) {
                // Check blocked paths
                for blocked_path in &policy.read_boundary.blocked_paths {
                    if path.starts_with(blocked_path) {
                        return false;
                    }
                }
                return true;
            }
        }

        // If no allowed paths specified, check if within write boundary
        if policy.write_boundary.allows_write_to(path) {
            return true;
        }

        // Default deny if no boundary matches
        !policy.read_boundary.allowed_paths.is_empty()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_normalize_simple() {
        let validator = PathValidator::new();
        let normalized = validator.normalize(Path::new("/foo/bar/../baz"));
        assert_eq!(normalized, Path::new("/foo/baz"));
    }

    #[test]
    fn test_normalize_with_dots() {
        let validator = PathValidator::new();
        let normalized = validator.normalize(Path::new("/foo/./bar/.././baz"));
        assert_eq!(normalized, Path::new("/foo/baz"));
    }

    #[test]
    fn test_is_within_boundary_valid() {
        let validator = PathValidator::new();
        assert!(validator.is_within_boundary(
            Path::new("/workspace/output/file.txt"),
            Path::new("/workspace")
        ));
    }

    #[test]
    fn test_is_within_boundary_traversal() {
        let validator = PathValidator::new();
        assert!(!validator.is_within_boundary(
            Path::new("/workspace/output/../../../secrets.txt"),
            Path::new("/workspace")
        ));
    }
}
