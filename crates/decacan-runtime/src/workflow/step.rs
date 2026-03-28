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
    pub fn new(
        id: impl Into<String>,
        name: impl Into<String>,
        step_type: WorkflowStepType,
        purpose: impl Into<String>,
        transition: Option<String>,
    ) -> Self {
        Self {
            id: id.into(),
            name: name.into(),
            r#type: step_type,
            purpose: purpose.into(),
            input_contract: "input.contract".to_owned(),
            output_contract: "output.contract".to_owned(),
            execution_profile: "default".to_owned(),
            transition,
        }
    }

    pub fn new_for_test(
        id: &str,
        name: &str,
        step_type: WorkflowStepType,
        purpose: &str,
        transition: Option<&str>,
    ) -> Self {
        Self::new(id, name, step_type, purpose, transition.map(str::to_owned))
    }
}
