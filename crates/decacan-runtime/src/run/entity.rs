use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

use crate::playbook::entity::Playbook;
use crate::policy::entity::PolicyProfile;
use crate::team::assignment::RoleAssignment;
use crate::team::entity::TeamSpecId;
use crate::workflow::entity::Workflow;
use crate::workspace::entity::Workspace;

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum RunStatus {
    Initialized,
    Running,
    Paused,
    Completed,
    Failed,
    Cancelled,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Run {
    pub id: String,
    pub task_id: String,
    pub attempt_index: u32,
    pub created_at: OffsetDateTime,
    pub workflow_snapshot: Workflow,
    pub policy_snapshot: PolicyProfile,
    pub workspace_snapshot: Workspace,
    pub playbook_snapshot: Playbook,
    pub status: RunStatus,
    pub current_step_id: Option<String>,
    pub step_cursor: usize,
    pub started_at: Option<OffsetDateTime>,
    pub finished_at: Option<OffsetDateTime>,
    pub pause_reason: Option<String>,
    pub event_ids: Vec<String>,
    pub intermediate_outputs: Vec<String>,
    pub output_candidates: Vec<String>,
    pub write_operations: Vec<String>,
    pub error_details: Option<String>,
}

impl Run {
    pub fn new(
        id: impl Into<String>,
        task_id: impl Into<String>,
        workflow_snapshot: Workflow,
        policy_snapshot: PolicyProfile,
        workspace_snapshot: Workspace,
        playbook_snapshot: Playbook,
    ) -> Self {
        let current_step_id = workflow_snapshot.steps.first().map(|step| step.id.clone());
        Self {
            id: id.into(),
            task_id: task_id.into(),
            attempt_index: 0,
            created_at: OffsetDateTime::now_utc(),
            workflow_snapshot,
            policy_snapshot,
            workspace_snapshot,
            playbook_snapshot,
            status: RunStatus::Initialized,
            current_step_id,
            step_cursor: 0,
            started_at: None,
            finished_at: None,
            pause_reason: None,
            event_ids: Vec::new(),
            intermediate_outputs: Vec::new(),
            output_candidates: Vec::new(),
            write_operations: Vec::new(),
            error_details: None,
        }
    }

    pub fn new_for_test(
        id: &str,
        task_id: &str,
        workflow_snapshot: Workflow,
        policy_snapshot: PolicyProfile,
        workspace_snapshot: Workspace,
        playbook_snapshot: Playbook,
    ) -> Self {
        Self::new(
            id,
            task_id,
            workflow_snapshot,
            policy_snapshot,
            workspace_snapshot,
            playbook_snapshot,
        )
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ParallelRoleGroupState {
    team_spec_id: TeamSpecId,
    assignments: Vec<RoleAssignment>,
}

impl ParallelRoleGroupState {
    pub fn new(team_spec_id: TeamSpecId) -> Self {
        Self {
            team_spec_id,
            assignments: Vec::new(),
        }
    }

    pub fn add_assignment(&mut self, assignment: RoleAssignment) {
        self.assignments.push(assignment);
    }

    pub fn assignments(&self) -> &[RoleAssignment] {
        &self.assignments
    }

    pub fn all_required_completed(&self) -> bool {
        !self.assignments.is_empty()
            && self.assignments.iter().all(|a| {
                matches!(
                    a.status(),
                    crate::team::assignment::AssignmentStatus::Completed { .. }
                )
            })
    }

    pub fn any_failed(&self) -> bool {
        self.assignments.iter().any(|a| {
            matches!(
                a.status(),
                crate::team::assignment::AssignmentStatus::Failed { .. }
            )
        })
    }
}
