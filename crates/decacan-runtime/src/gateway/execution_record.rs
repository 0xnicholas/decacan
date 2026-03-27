use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

use crate::gateway::descriptor::ToolDescriptor;
use crate::gateway::request::ToolRequest;
use crate::gateway::result::PolicyDecision;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ToolExecutionRecord {
    pub tool_name: String,
    pub action: String,
    pub descriptor: ToolDescriptor,
    pub request: ToolRequest,
    pub decision: PolicyDecision,
    pub evaluated_at: OffsetDateTime,
}
