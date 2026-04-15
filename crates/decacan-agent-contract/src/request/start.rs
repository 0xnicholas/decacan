use crate::snapshot::PlaybookSnapshot;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ExecutionRequest {
    pub execution_id: String,
    pub workspace_id: String,
    pub task_id: String,
    pub run_id: String,
    pub playbook_snapshot: PlaybookSnapshot,
    pub context: super::ExecutionContext,
}
