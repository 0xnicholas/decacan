use serde::{Deserialize, Serialize};

use super::{AccountWorkspaceDto, PlaybookDto, TaskDto};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AccountHomeDto {
    pub default_workspace_id: String,
    pub workspaces: Vec<AccountWorkspaceDto>,
    pub waiting_on_me: Vec<AccountWorkItemDto>,
    pub recent_tasks: Vec<AccountTaskSummaryDto>,
    pub playbook_shortcuts: Vec<AccountPlaybookShortcutDto>,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AccountWorkItemDto {
    pub id: String,
    pub workspace_id: String,
    pub task_id: String,
    pub title: String,
    pub kind: String,
    pub status: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AccountTaskSummaryDto {
    pub id: String,
    pub workspace_id: String,
    pub playbook_key: String,
    pub status: String,
    pub status_summary: String,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct AccountPlaybookShortcutDto {
    pub playbook_key: String,
    pub title: String,
    pub summary: String,
    pub mode_label: String,
}

impl From<TaskDto> for AccountTaskSummaryDto {
    fn from(task: TaskDto) -> Self {
        Self {
            id: task.id,
            workspace_id: task.workspace_id,
            playbook_key: task.playbook_key,
            status: task.status,
            status_summary: task.status_summary,
        }
    }
}

impl From<PlaybookDto> for AccountPlaybookShortcutDto {
    fn from(playbook: PlaybookDto) -> Self {
        Self {
            playbook_key: playbook.key,
            title: playbook.title,
            summary: playbook.summary,
            mode_label: playbook.mode_label,
        }
    }
}
