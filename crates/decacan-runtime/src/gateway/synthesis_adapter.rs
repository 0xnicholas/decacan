use time::OffsetDateTime;

use crate::gateway::descriptor::ToolDescriptor;
use crate::gateway::request::ToolRequest;
use crate::gateway::result::PolicyDecision;
use crate::gateway::tool_gateway::ToolGateway;
use crate::synthesis::tool_protocol::{ToolCall, ToolCallResult, ToolProtocol};

#[derive(Debug, Clone)]
pub struct SynthesisGatewayAdapter {
    gateway: ToolGateway,
}

impl SynthesisGatewayAdapter {
    pub fn new(gateway: ToolGateway) -> Self {
        Self { gateway }
    }
}

impl ToolProtocol for SynthesisGatewayAdapter {
    type Error = core::convert::Infallible;

    fn invoke(&self, request: ToolCall) -> Result<ToolCallResult, Self::Error> {
        let synthesis_request = request.clone();
        let tool_request = ToolRequest::new(
            ToolDescriptor::new(&synthesis_request.name, "synthesis tool invocation"),
            synthesis_request.action,
        )
        .with_overwrite_existing(synthesis_request.overwrite_existing);

        let tool_request = match synthesis_request.target_path {
            Some(target_path) => tool_request.with_target_path(target_path),
            None => tool_request,
        };

        let (decision, _) = self
            .gateway
            .evaluate(tool_request, OffsetDateTime::UNIX_EPOCH);

        Ok(match decision {
            PolicyDecision::Allow { reason } => ToolCallResult::Allowed { reason },
            PolicyDecision::ApprovalRequired { reason } => {
                ToolCallResult::ApprovalRequired { reason }
            }
            PolicyDecision::Deny { reason } => ToolCallResult::Denied { reason },
        })
    }
}
