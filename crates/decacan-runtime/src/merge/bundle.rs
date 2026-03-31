use crate::team::entity::RoleId;
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AssignmentOutput {
    role_id: RoleId,
    content: String,
}

impl AssignmentOutput {
    pub fn new(role_id: RoleId, content: String) -> Self {
        Self { role_id, content }
    }

    pub fn role_id(&self) -> &RoleId {
        &self.role_id
    }

    pub fn content(&self) -> &str {
        &self.content
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct MergeInputBundle {
    outputs: Vec<AssignmentOutput>,
}

impl MergeInputBundle {
    pub fn new() -> Self {
        Self {
            outputs: Vec::new(),
        }
    }

    pub fn add_output(&mut self, output: AssignmentOutput) {
        self.outputs.push(output);
    }

    pub fn outputs(&self) -> &[AssignmentOutput] {
        &self.outputs
    }

    pub fn concatenate(&self) -> String {
        self.outputs
            .iter()
            .map(|o| o.content())
            .collect::<Vec<_>>()
            .join("\n\n")
    }

    pub fn is_empty(&self) -> bool {
        self.outputs.is_empty()
    }
}
