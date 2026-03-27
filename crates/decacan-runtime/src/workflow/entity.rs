use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use uuid::Uuid;

use super::step::WorkflowStep;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Workflow {
    pub id: String,
    pub playbook_id: String,
    pub version_id: Uuid,
    pub created_at: OffsetDateTime,
    pub steps: Vec<WorkflowStep>,
}

impl Workflow {
    pub fn new_for_test(id: &str, playbook_id: &str, steps: Vec<WorkflowStep>) -> Self {
        Self {
            id: id.to_owned(),
            playbook_id: playbook_id.to_owned(),
            version_id: Uuid::new_v4(),
            created_at: OffsetDateTime::now_utc(),
            steps,
        }
    }
}
