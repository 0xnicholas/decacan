use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use uuid::Uuid;

use super::step::{WorkflowStep, WorkflowStepType};

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

pub fn summary_workflow_step_types_for_test() -> Vec<WorkflowStepType> {
    summary_workflow_for_test()
        .steps
        .into_iter()
        .map(|step| step.r#type)
        .collect()
}

pub fn summary_workflow_for_test() -> Workflow {
    Workflow::new_for_test(
        "workflow-1",
        "playbook-1",
        vec![
            WorkflowStep::new_for_test(
                "step-1",
                "load_context",
                WorkflowStepType::Deterministic,
                "Load task context for summary generation",
                Some("step-2"),
            ),
            WorkflowStep::new_for_test(
                "step-2",
                "collect_materials",
                WorkflowStepType::Tool,
                "Collect source materials through the tool gateway",
                Some("step-3"),
            ),
            WorkflowStep::new_for_test(
                "step-3",
                "draft_outline",
                WorkflowStepType::Psi,
                "Draft the summary outline",
                Some("step-4"),
            ),
            WorkflowStep::new_for_test(
                "step-4",
                "compose_summary",
                WorkflowStepType::Psi,
                "Compose the summary body",
                Some("step-5"),
            ),
            WorkflowStep::new_for_test(
                "step-5",
                "normalize_output",
                WorkflowStepType::Deterministic,
                "Normalize the generated output",
                Some("step-6"),
            ),
            WorkflowStep::new_for_test(
                "step-6",
                "persist_summary",
                WorkflowStepType::Tool,
                "Persist the summary artifact candidate",
                None,
            ),
        ],
    )
}
