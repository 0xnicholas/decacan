use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex};

use decacan_runtime::playbook::modes::PlaybookMode;
use decacan_runtime::playbook::registry::{
    list_registered_playbooks, DISCOVER_TOPICS_PLAYBOOK_KEY, SUMMARY_PLAYBOOK_KEY,
};
use tokio::sync::broadcast;

use crate::dto::{
    ApprovalDto, ArtifactDto, PlaybookDto, TaskDto, TaskEventEnvelopeDto, TaskPlanDto, WorkspaceDto,
};

#[derive(Clone)]
pub struct AppState {
    inner: Arc<AppStateInner>,
}

struct AppStateInner {
    next_id: AtomicU64,
    workspaces: Vec<WorkspaceDto>,
    playbooks: Vec<PlaybookDto>,
    tasks: Mutex<HashMap<String, TaskDto>>,
    artifacts: Mutex<HashMap<String, ArtifactDto>>,
    approvals: Mutex<HashMap<String, ApprovalDto>>,
    task_events: Mutex<HashMap<String, Vec<TaskEventEnvelopeDto>>>,
    task_event_bus: broadcast::Sender<TaskEventEnvelopeDto>,
}

impl AppState {
    pub fn new_for_test() -> Self {
        let (task_event_bus, _) = broadcast::channel(64);
        let playbooks = list_registered_playbooks()
            .into_iter()
            .map(playbook_to_dto)
            .collect();

        Self {
            inner: Arc::new(AppStateInner {
                next_id: AtomicU64::new(1),
                workspaces: vec![WorkspaceDto {
                    id: "workspace-1".to_owned(),
                    title: "Default Workspace".to_owned(),
                    root_path: "/workspace".to_owned(),
                }],
                playbooks,
                tasks: Mutex::new(HashMap::new()),
                artifacts: Mutex::new(HashMap::new()),
                approvals: Mutex::new(HashMap::new()),
                task_events: Mutex::new(HashMap::new()),
                task_event_bus,
            }),
        }
    }

    pub fn next_id(&self, prefix: &str) -> String {
        let next = self.inner.next_id.fetch_add(1, Ordering::Relaxed);
        format!("{prefix}-{next}")
    }

    pub fn workspaces(&self) -> Vec<WorkspaceDto> {
        self.inner.workspaces.clone()
    }

    pub fn playbooks(&self) -> Vec<PlaybookDto> {
        self.inner.playbooks.clone()
    }

    pub fn put_task(&self, task: TaskDto) {
        self.inner
            .tasks
            .lock()
            .expect("task lock should not be poisoned")
            .insert(task.id.clone(), task);
    }

    pub fn list_tasks(&self) -> Vec<TaskDto> {
        self.inner
            .tasks
            .lock()
            .expect("task lock should not be poisoned")
            .values()
            .cloned()
            .collect()
    }

    pub fn get_task(&self, task_id: &str) -> Option<TaskDto> {
        self.inner
            .tasks
            .lock()
            .expect("task lock should not be poisoned")
            .get(task_id)
            .cloned()
    }

    pub fn has_task(&self, task_id: &str) -> bool {
        self.inner
            .tasks
            .lock()
            .expect("task lock should not be poisoned")
            .contains_key(task_id)
    }

    pub fn update_task<F>(&self, task_id: &str, mutate: F) -> Option<TaskDto>
    where
        F: FnOnce(&mut TaskDto),
    {
        let mut tasks = self
            .inner
            .tasks
            .lock()
            .expect("task lock should not be poisoned");
        let task = tasks.get_mut(task_id)?;
        mutate(task);
        Some(task.clone())
    }

    pub fn put_artifact(&self, artifact: ArtifactDto) {
        self.inner
            .artifacts
            .lock()
            .expect("artifact lock should not be poisoned")
            .insert(artifact.id.clone(), artifact);
    }

    pub fn get_artifact(&self, artifact_id: &str) -> Option<ArtifactDto> {
        self.inner
            .artifacts
            .lock()
            .expect("artifact lock should not be poisoned")
            .get(artifact_id)
            .cloned()
    }

    pub fn put_approval(&self, approval: ApprovalDto) {
        self.inner
            .approvals
            .lock()
            .expect("approval lock should not be poisoned")
            .insert(approval.id.clone(), approval);
    }

    pub fn get_approval(&self, approval_id: &str) -> Option<ApprovalDto> {
        self.inner
            .approvals
            .lock()
            .expect("approval lock should not be poisoned")
            .get(approval_id)
            .cloned()
    }

    pub fn update_approval<F>(&self, approval_id: &str, mutate: F) -> Option<ApprovalDto>
    where
        F: FnOnce(&mut ApprovalDto),
    {
        let mut approvals = self
            .inner
            .approvals
            .lock()
            .expect("approval lock should not be poisoned");
        let approval = approvals.get_mut(approval_id)?;
        mutate(approval);
        Some(approval.clone())
    }

    pub fn append_task_event(&self, event: TaskEventEnvelopeDto) {
        self.inner
            .task_events
            .lock()
            .expect("task event lock should not be poisoned")
            .entry(event.task_id.clone())
            .or_default()
            .push(event.clone());
        let _ = self.inner.task_event_bus.send(event);
    }

    pub fn list_task_events(&self, task_id: &str) -> Vec<TaskEventEnvelopeDto> {
        self.inner
            .task_events
            .lock()
            .expect("task event lock should not be poisoned")
            .get(task_id)
            .cloned()
            .unwrap_or_default()
    }

    pub fn subscribe_task_events(&self) -> broadcast::Receiver<TaskEventEnvelopeDto> {
        self.inner.task_event_bus.subscribe()
    }

    pub fn list_artifacts_for_task(&self, task_id: &str) -> Vec<ArtifactDto> {
        self.inner
            .artifacts
            .lock()
            .expect("artifact lock should not be poisoned")
            .values()
            .filter(|artifact| artifact.task_id == task_id)
            .cloned()
            .collect()
    }

    pub fn list_approvals_for_task(&self, task_id: &str) -> Vec<ApprovalDto> {
        self.inner
            .approvals
            .lock()
            .expect("approval lock should not be poisoned")
            .values()
            .filter(|approval| approval.task_id == task_id)
            .cloned()
            .collect()
    }

    pub fn is_known_workspace(&self, workspace_id: &str) -> bool {
        self.inner.workspaces.iter().any(|workspace| workspace.id == workspace_id)
    }

    pub fn is_known_playbook(&self, playbook_key: &str) -> bool {
        self.inner.playbooks.iter().any(|playbook| playbook.key == playbook_key)
    }

    pub fn next_task_sequence(&self, task_id: &str) -> u64 {
        self.list_task_events(task_id).len() as u64 + 1
    }
}

pub fn plan_for_task(task: &TaskDto) -> TaskPlanDto {
    let steps = match task.playbook_key.as_str() {
        SUMMARY_PLAYBOOK_KEY => vec![
            "Scan markdown files in the selected workspace".to_owned(),
            "Draft a concise summary with key takeaways".to_owned(),
            "Write the final summary artifact to output/summary.md".to_owned(),
        ],
        DISCOVER_TOPICS_PLAYBOOK_KEY => vec![
            "Scan markdown files in the selected workspace".to_owned(),
            "Cluster notes into themes and open questions".to_owned(),
            "Write the discovery artifact to output/discovery.md".to_owned(),
        ],
        _ => vec![
            "Inspect the selected workspace".to_owned(),
            "Produce the final result artifact".to_owned(),
        ],
    };

    TaskPlanDto {
        steps,
        current_step_index: 0,
        status: match task.status.as_str() {
            "accepted" => "ready".to_owned(),
            other => other.to_owned(),
        },
    }
}

fn playbook_to_dto(playbook: decacan_runtime::playbook::entity::Playbook) -> PlaybookDto {
    let (summary, expected_output_label, expected_output_path) = match playbook.key.as_str() {
        SUMMARY_PLAYBOOK_KEY => (
            "Create a concise summary from markdown notes in the selected workspace.",
            "Summary document",
            "output/summary.md",
        ),
        DISCOVER_TOPICS_PLAYBOOK_KEY => (
            "Cluster markdown notes into themes and open questions for follow-up work.",
            "Discovery report",
            "output/discovery.md",
        ),
        _ => (
            "Run a workspace task with a formal artifact output.",
            "Result document",
            "output/result.md",
        ),
    };

    PlaybookDto {
        key: playbook.key,
        title: playbook.title,
        summary: summary.to_owned(),
        mode_label: match playbook.mode {
            PlaybookMode::Standard => "标准模式".to_owned(),
            PlaybookMode::Discovery => "发现模式".to_owned(),
        },
        expected_output_label: expected_output_label.to_owned(),
        expected_output_path: expected_output_path.to_owned(),
    }
}

pub fn pending_artifact_for_task(task_id: &str, playbook_key: &str) -> ArtifactDto {
    let canonical_path = match playbook_key {
        SUMMARY_PLAYBOOK_KEY => "output/summary.md",
        DISCOVER_TOPICS_PLAYBOOK_KEY => "output/discovery.md",
        _ => "output/result.md",
    };

    ArtifactDto {
        id: format!("artifact-{task_id}-pending"),
        task_id: task_id.to_owned(),
        label: "primary-output".to_owned(),
        canonical_path: canonical_path.to_owned(),
        status: "pending".to_owned(),
    }
}
