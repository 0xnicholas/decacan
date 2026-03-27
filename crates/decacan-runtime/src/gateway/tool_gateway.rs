use std::path::{Path, PathBuf};

use time::OffsetDateTime;

use crate::gateway::descriptor::ToolDescriptor;
use crate::gateway::execution_record::ToolExecutionRecord;
use crate::gateway::request::ToolRequest;
use crate::gateway::result::{PolicyDecision, ToolResult};
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
        descriptor: ToolDescriptor,
        request: ToolRequest,
    ) -> (ToolResult, ToolExecutionRecord) {
        let decision = self.evaluate_policy(&request);
        let result = match &decision {
            PolicyDecision::Allow { reason } => self.allow(reason.clone()),
            PolicyDecision::ApprovalRequired { reason } => self.approval_required(reason.clone()),
            PolicyDecision::Deny { reason } => self.deny(reason.clone()),
        };
        let record = ToolExecutionRecord {
            tool_name: descriptor.name.clone(),
            action: request.action.clone(),
            descriptor,
            request,
            decision,
            evaluated_at: OffsetDateTime::now_utc(),
        };
        (result, record)
    }

    fn evaluate_policy(&self, request: &ToolRequest) -> PolicyDecision {
        if self.requires_overwrite_approval(request) {
            return PolicyDecision::ApprovalRequired {
                reason: "overwrite outside output root requires approval".to_owned(),
            };
        }

        if self
            .policy
            .denied_tools
            .iter()
            .any(|tool| tool == &request.tool_name)
        {
            return PolicyDecision::Deny {
                reason: format!("tool '{}' is denied by policy", request.tool_name),
            };
        }

        if self
            .policy
            .approval_required_tools
            .iter()
            .any(|tool| tool == &request.tool_name)
        {
            return PolicyDecision::ApprovalRequired {
                reason: format!("tool '{}' requires approval by policy", request.tool_name),
            };
        }

        if self
            .policy
            .allowed_tools
            .iter()
            .any(|tool| tool == &request.tool_name)
        {
            return PolicyDecision::Allow {
                reason: format!("tool '{}' allowed by policy", request.tool_name),
            };
        }

        PolicyDecision::Deny {
            reason: format!("tool '{}' is not listed in policy", request.tool_name),
        }
    }

    fn requires_overwrite_approval(&self, request: &ToolRequest) -> bool {
        request.overwrite_existing
            && request
                .target_path
                .as_deref()
                .is_some_and(|path| !path_starts_with(path, &self.output_root))
    }

    pub fn allow(&self, reason: String) -> ToolResult {
        ToolResult::Allowed { reason }
    }

    pub fn approval_required(&self, reason: String) -> ToolResult {
        ToolResult::ApprovalRequired { reason }
    }

    pub fn deny(&self, reason: String) -> ToolResult {
        ToolResult::Denied { reason }
    }
}

fn path_starts_with(path: &Path, root: &Path) -> bool {
    path.starts_with(root)
}

pub fn evaluate_overwrite_for_test() -> ToolResult {
    let gateway = ToolGateway::new(
        PolicyProfile::new_for_test("policy-1", "workspace-1", "default"),
        "/tmp/workspace/output",
    );
    let descriptor = ToolDescriptor::new("artifact.write", "Persist an artifact candidate");
    let request = ToolRequest::new("artifact.write", "overwrite")
        .with_target_path("/tmp/workspace/notes.md")
        .with_overwrite_existing(true);

    let (result, _) = gateway.evaluate(descriptor, request);
    result
}
