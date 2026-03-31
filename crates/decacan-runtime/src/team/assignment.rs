use crate::team::entity::{RoleId, TeamSpecId};
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Hash, Serialize, Deserialize)]
pub struct RoleAssignmentId(String);

impl RoleAssignmentId {
    pub fn new(id: impl Into<String>) -> Self {
        Self(id.into())
    }

    pub fn as_str(&self) -> &str {
        &self.0
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum AssignmentStatus {
    Pending,
    Running,
    Completed { output: String },
    Failed { reason: String },
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct RoleAssignment {
    id: RoleAssignmentId,
    role_id: RoleId,
    team_spec_id: TeamSpecId,
    status: AssignmentStatus,
}

impl RoleAssignment {
    pub fn new(id: RoleAssignmentId, role_id: RoleId, team_spec_id: TeamSpecId) -> Self {
        Self {
            id,
            role_id,
            team_spec_id,
            status: AssignmentStatus::Pending,
        }
    }

    pub fn id(&self) -> &RoleAssignmentId {
        &self.id
    }

    pub fn role_id(&self) -> &RoleId {
        &self.role_id
    }

    pub fn status(&self) -> &AssignmentStatus {
        &self.status
    }

    pub fn complete(&mut self, output: String) {
        self.status = AssignmentStatus::Completed { output };
    }

    pub fn fail(&mut self, reason: impl Into<String>) {
        self.status = AssignmentStatus::Failed {
            reason: reason.into(),
        };
    }

    pub fn output(&self) -> Option<&str> {
        match &self.status {
            AssignmentStatus::Completed { output } => Some(output),
            _ => None,
        }
    }
}
