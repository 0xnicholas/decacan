use time::OffsetDateTime;

use super::entity::{Task, TaskStatus};

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum TaskTransitionError {
    InvalidTransition { from: TaskStatus, to: TaskStatus },
}

pub struct TaskStateMachine;

impl TaskStateMachine {
    pub fn ensure_transition(task: &Task, next: TaskStatus) -> Result<(), TaskTransitionError> {
        Self::ensure_status_transition(task.status, next)
    }

    pub fn ensure_status_transition(
        current: TaskStatus,
        next: TaskStatus,
    ) -> Result<(), TaskTransitionError> {
        if Self::can_transition(current, next) {
            Ok(())
        } else {
            Err(TaskTransitionError::InvalidTransition {
                from: current,
                to: next,
            })
        }
    }

    pub fn transition(task: &mut Task, next: TaskStatus) -> Result<(), TaskTransitionError> {
        Self::ensure_transition(task, next)?;

        task.status = next;
        task.updated_at = OffsetDateTime::now_utc();
        Ok(())
    }

    fn can_transition(current: TaskStatus, next: TaskStatus) -> bool {
        use TaskStatus::{Cancelled, Created, Failed, Paused, Planning, Running, Succeeded};

        matches!(
            (current, next),
            (Created, Planning)
                | (Created, Cancelled)
                | (Planning, Running)
                | (Planning, Failed)
                | (Planning, Cancelled)
                | (Running, Paused)
                | (Running, Succeeded)
                | (Running, Failed)
                | (Running, Cancelled)
                | (Paused, Running)
                | (Paused, Failed)
                | (Paused, Cancelled)
        )
    }
}

#[cfg(test)]
mod tests {
    use uuid::Uuid;

    use super::*;

    #[test]
    fn task_supports_pause_resume_and_terminal_transitions() {
        let mut task = Task::new_for_test(
            "task-1",
            "workspace-1",
            "playbook-1",
            Uuid::parse_str("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa").unwrap(),
        );

        TaskStateMachine::transition(&mut task, TaskStatus::Planning).unwrap();
        TaskStateMachine::transition(&mut task, TaskStatus::Running).unwrap();
        TaskStateMachine::transition(&mut task, TaskStatus::Paused).unwrap();
        TaskStateMachine::transition(&mut task, TaskStatus::Running).unwrap();
        TaskStateMachine::transition(&mut task, TaskStatus::Succeeded).unwrap();

        assert_eq!(task.status, TaskStatus::Succeeded);
    }

    #[test]
    fn task_rejects_invalid_transition() {
        let mut task = Task::new_for_test(
            "task-1",
            "workspace-1",
            "playbook-1",
            Uuid::parse_str("aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa").unwrap(),
        );

        let error = TaskStateMachine::transition(&mut task, TaskStatus::Succeeded).unwrap_err();
        assert_eq!(
            error,
            TaskTransitionError::InvalidTransition {
                from: TaskStatus::Created,
                to: TaskStatus::Succeeded,
            }
        );
    }
}
