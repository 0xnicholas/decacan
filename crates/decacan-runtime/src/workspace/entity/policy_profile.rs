use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

use super::policy::{PathRules, ReadBoundary, WorkspaceScope, WriteBoundary, WriteMode};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PolicyProfile {
    pub id: String,
    pub workspace_id: String,
    pub name: String,
    pub description: Option<String>,
    pub allowed_permissions: Vec<String>,
    pub allowed_tools: Vec<String>,
    pub allowed_network: Vec<String>,
    pub default_scope: WorkspaceScope,
    pub default_write_mode: WriteMode,
    pub default_path_rules: PathRules,
    pub default_read_boundary: ReadBoundary,
    pub default_write_boundary: WriteBoundary,
    pub created_at: OffsetDateTime,
}

impl PolicyProfile {
    pub fn new(
        id: impl Into<String>,
        workspace_id: impl Into<String>,
        name: impl Into<String>,
        allowed_permissions: Vec<String>,
        allowed_tools: Vec<String>,
        allowed_network: Vec<String>,
    ) -> Self {
        let now = OffsetDateTime::now_utc();
        Self {
            id: id.into(),
            workspace_id: workspace_id.into(),
            name: name.into(),
            description: None,
            allowed_permissions,
            allowed_tools,
            allowed_network,
            default_scope: WorkspaceScope::default(),
            default_write_mode: WriteMode::OutputOnly,
            default_path_rules: PathRules::default(),
            default_read_boundary: ReadBoundary::default(),
            default_write_boundary: WriteBoundary::default(),
            created_at: now,
        }
    }

    pub fn with_description(mut self, description: impl Into<String>) -> Self {
        self.description = Some(description.into());
        self
    }

    pub fn with_default_scope(mut self, scope: WorkspaceScope) -> Self {
        self.default_scope = scope;
        self
    }

    pub fn with_default_write_mode(mut self, mode: WriteMode) -> Self {
        self.default_write_mode = mode;
        self
    }

    pub fn with_default_path_rules(mut self, rules: PathRules) -> Self {
        self.default_path_rules = rules;
        self
    }

    pub fn has_permission(&self, permission: &str) -> bool {
        self.allowed_permissions.iter().any(|p| p == permission)
    }

    pub fn can_use_tool(&self, tool: &str) -> bool {
        self.allowed_tools.iter().any(|t| t == tool)
    }

    pub fn can_access_network(&self, host: &str) -> bool {
        // Check for specific host permissions first
        if self.allowed_network.iter().any(|n| n == host || n == "*") {
            return true;
        }
        // Check for domain-level permissions (e.g., "*.example.com")
        for pattern in &self.allowed_network {
            if pattern.starts_with("*.") {
                let domain = &pattern[2..];
                if host.ends_with(domain) {
                    return true;
                }
            }
        }
        false
    }
}

impl Default for PolicyProfile {
    fn default() -> Self {
        Self::new(
            "default",
            "default",
            "Default Policy Profile",
            vec![],
            vec![],
            vec![],
        )
    }
}
