use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkflowStepType {
    Deterministic,
    Tool,
    Routine,
    Psi,
    Approval,
    Branch,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkflowStep {
    pub id: String,
    pub name: String,
    pub r#type: WorkflowStepType,
    pub purpose: String,
    pub input_contract: String,
    pub output_contract: String,
    pub execution_profile: String,
    pub transition: Option<String>,
}

impl WorkflowStep {
    pub fn new_for_test(
        id: &str,
        name: &str,
        step_type: WorkflowStepType,
        purpose: &str,
        transition: Option<&str>,
    ) -> Self {
        Self {
            id: id.to_owned(),
            name: name.to_owned(),
            r#type: step_type,
            purpose: purpose.to_owned(),
            input_contract: "input.contract".to_owned(),
            output_contract: "output.contract".to_owned(),
            execution_profile: "default".to_owned(),
            transition: transition.map(str::to_owned),
        }
    }
}
