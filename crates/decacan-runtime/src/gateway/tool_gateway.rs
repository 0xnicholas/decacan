use std::path::{Component, Path, PathBuf};

use time::OffsetDateTime;

use crate::gateway::execution_record::ToolExecutionRecord;
use crate::gateway::request::ToolRequest;
use crate::gateway::result::PolicyDecision;
use crate::policy::entity::PolicyProfile;

#[derive(Debug, Clone)]
pub struct ToolGateway {
    policy: PolicyProfile,
    output_root: PathBuf,
}

impl ToolGateway {
    pub fn new(policy: PolicyProfile, output_root: impl Into<PathBuf>) -> Self {
        Self {
            policy,
            output_root: output_root.into(),
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
        if self.requires_overwrite_approval(request) {
            return self.approval_required("overwrite outside output root requires approval");
        }

        if self
            .policy
            .denied_tools
            .iter()
            .any(|tool| tool == &request.descriptor.name)
        {
            return self.deny(format!("tool '{}' is denied by policy", request.descriptor.name));
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
            return self.allow(format!("tool '{}' allowed by policy", request.descriptor.name));
        }

        self.deny(format!(
            "tool '{}' is not listed in policy",
            request.descriptor.name
        ))
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
                let can_pop_normal = matches!(normalized.components().next_back(), Some(Component::Normal(_)));
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

        assert!(matches!(gateway.allow("ok"), crate::gateway::result::PolicyDecision::Allow { .. }));
        assert!(matches!(
            gateway.approval_required("review"),
            crate::gateway::result::PolicyDecision::ApprovalRequired { .. }
        ));
        assert!(matches!(gateway.deny("no"), crate::gateway::result::PolicyDecision::Deny { .. }));
    }
}
