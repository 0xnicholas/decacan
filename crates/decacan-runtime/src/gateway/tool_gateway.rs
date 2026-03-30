use std::path::{Component, Path, PathBuf};

use time::OffsetDateTime;

use crate::gateway::execution_record::ToolExecutionRecord;
use crate::gateway::request::ToolRequest;
use crate::gateway::result::PolicyDecision;
use crate::policy::entity::PolicyProfile;
use crate::workspace::entity::WorkspacePolicy;

#[derive(Debug, Clone)]
pub struct ToolGateway {
    policy: PolicyProfile,
    output_root: PathBuf,
    workspace_policy: Option<WorkspacePolicy>,
}

impl ToolGateway {
    pub fn new(policy: PolicyProfile, output_root: impl Into<PathBuf>) -> Self {
        Self {
            policy,
            output_root: output_root.into(),
            workspace_policy: None,
        }
    }

    pub fn new_with_workspace_policy(
        policy: PolicyProfile,
        output_root: impl Into<PathBuf>,
        workspace_policy: WorkspacePolicy,
    ) -> Self {
        Self {
            policy,
            output_root: output_root.into(),
            workspace_policy: Some(workspace_policy),
        }
    }

    pub fn evaluate(
        &self,
        request: ToolRequest,
        evaluated_at: OffsetDateTime,
    ) -> (PolicyDecision, ToolExecutionRecord) {
        let decision = self.evaluate_policy(&request);
        let record = ToolExecutionRecord {
            request,
            decision: decision.clone(),
            evaluated_at,
        };
        (decision, record)
    }

    fn evaluate_policy(&self, request: &ToolRequest) -> PolicyDecision {
        // Check workspace policy first
        if let Some(ref wp) = self.workspace_policy {
            // Check path traversal if prevent_escape is enabled
            if wp.path_rules.prevent_escape {
                if let Some(ref target_path) = request.target_path {
                    let path_str = target_path.to_string_lossy();
                    if path_str.contains("..") || path_str.contains("~") {
                        return self.deny("path traversal not allowed by workspace policy");
                    }
                }
            }

            // Determine if this is a write or read operation
            let is_write_operation = self.is_write_operation(request);

            if is_write_operation {
                // Check write boundary
                if let Some(ref target_path) = request.target_path {
                    if !wp.write_boundary.allows_write_to(target_path) {
                        return self.approval_required(
                            "write outside workspace boundary requires approval",
                        );
                    }
                }
            } else {
                // Check read boundary - path should be within workspace root
                if let Some(ref target_path) = request.target_path {
                    // Check if path is within any allowed read path
                    let allowed = wp
                        .read_boundary
                        .allowed_paths
                        .iter()
                        .any(|allowed_path| target_path.starts_with(allowed_path));

                    if !allowed && !wp.read_boundary.allowed_paths.is_empty() {
                        return self.approval_required(
                            "read outside workspace boundary requires approval",
                        );
                    }
                }
            }
        }

        // Fall through to existing tool-level policy checks
        if self.requires_overwrite_approval(request) {
            return self.approval_required("overwrite outside output root requires approval");
        }

        if self
            .policy
            .denied_tools
            .iter()
            .any(|tool| tool == &request.descriptor.name)
        {
            return self.deny(format!(
                "tool '{}' is denied by policy",
                request.descriptor.name
            ));
        }

        if self
            .policy
            .approval_required_tools
            .iter()
            .any(|tool| tool == &request.descriptor.name)
        {
            return self.approval_required(format!(
                "tool '{}' requires approval by policy",
                request.descriptor.name
            ));
        }

        if self
            .policy
            .allowed_tools
            .iter()
            .any(|tool| tool == &request.descriptor.name)
        {
            return self.allow(format!(
                "tool '{}' allowed by policy",
                request.descriptor.name
            ));
        }

        self.deny(format!(
            "tool '{}' is not listed in policy",
            request.descriptor.name
        ))
    }

    fn is_write_operation(&self, request: &ToolRequest) -> bool {
        // Check action name for write indicators
        let action_lower = request.action.to_lowercase();
        if action_lower.contains("write")
            || action_lower.contains("create")
            || action_lower.contains("delete")
            || action_lower.contains("overwrite")
            || action_lower.contains("modify")
            || action_lower.contains("update")
        {
            return true;
        }

        // Check if overwrite flag is set
        if request.overwrite_existing {
            return true;
        }

        // Check tool name patterns
        let tool_lower = request.descriptor.name.to_lowercase();
        if tool_lower.contains("write") || tool_lower.contains("delete") {
            return true;
        }

        false
    }

    fn requires_overwrite_approval(&self, request: &ToolRequest) -> bool {
        request.overwrite_existing
            && request
                .target_path
                .as_deref()
                .is_some_and(|path| !path_within_output_root(path, &self.output_root))
    }

    pub fn allow(&self, reason: impl Into<String>) -> PolicyDecision {
        PolicyDecision::Allow {
            reason: reason.into(),
        }
    }

    pub fn approval_required(&self, reason: impl Into<String>) -> PolicyDecision {
        PolicyDecision::ApprovalRequired {
            reason: reason.into(),
        }
    }

    pub fn deny(&self, reason: impl Into<String>) -> PolicyDecision {
        PolicyDecision::Deny {
            reason: reason.into(),
        }
    }
}

fn normalized_path(path: &Path) -> PathBuf {
    let mut normalized = PathBuf::new();

    for component in path.components() {
        match component {
            Component::CurDir => {}
            Component::ParentDir => {
                let can_pop_normal = matches!(
                    normalized.components().next_back(),
                    Some(Component::Normal(_))
                );
                if can_pop_normal {
                    normalized.pop();
                } else if !path.is_absolute() {
                    normalized.push(component.as_os_str());
                }
            }
            Component::Normal(part) => normalized.push(part),
            Component::RootDir | Component::Prefix(_) => normalized.push(component.as_os_str()),
        }
    }

    normalized
}

fn path_within_output_root(path: &Path, root: &Path) -> bool {
    let normalized_target = normalized_path(path);
    let normalized_root = normalized_path(root);

    normalized_target.starts_with(&normalized_root)
}

#[cfg(test)]
mod tests {
    use super::{path_within_output_root, ToolGateway};
    use crate::policy::entity::PolicyProfile;
    use std::path::Path;

    #[test]
    fn normalized_boundary_rejects_traversal_escape() {
        assert!(!path_within_output_root(
            Path::new("/tmp/workspace/output/../notes.md"),
            Path::new("/tmp/workspace/output"),
        ));
    }

    #[test]
    fn normalized_boundary_allows_descendant_output_path() {
        assert!(path_within_output_root(
            Path::new("/tmp/workspace/output/final/summary.md"),
            Path::new("/tmp/workspace/output"),
        ));
    }

    #[test]
    fn policy_decision_helpers_return_expected_variants() {
        let gateway = ToolGateway::new(
            PolicyProfile::new_for_test("policy-1", "workspace-1", "default"),
            "/tmp/workspace/output",
        );

        assert!(matches!(
            gateway.allow("ok"),
            crate::gateway::result::PolicyDecision::Allow { .. }
        ));
        assert!(matches!(
            gateway.approval_required("review"),
            crate::gateway::result::PolicyDecision::ApprovalRequired { .. }
        ));
        assert!(matches!(
            gateway.deny("no"),
            crate::gateway::result::PolicyDecision::Deny { .. }
        ));
    }
}
