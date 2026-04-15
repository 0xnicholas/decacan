use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(tag = "kind", rename_all = "snake_case")]
pub enum ExecutionInput {
    UserText {
        content: String,
    },
    ApprovalDecision {
        approval_id: String,
        decision: ApprovalDecision,
    },
    ToolResult {
        tool_name: String,
        result: serde_json::Value,
    },
}

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq)]
pub enum ApprovalDecision {
    Approved,
    Rejected,
}
