use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

use crate::gateway::request::ToolRequest;
use crate::gateway::result::PolicyDecision;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ToolExecutionRecord {
    pub request: ToolRequest,
    pub decision: PolicyDecision,
    pub evaluated_at: OffsetDateTime,
}
