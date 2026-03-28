use std::collections::HashMap;
use std::sync::atomic::{AtomicU64, Ordering};
use std::sync::{Arc, Mutex};

use axum::Router;
use decacan_runtime::playbook::modes::PlaybookMode;
use decacan_runtime::playbook::registry::{
    list_registered_playbooks, DISCOVER_TOPICS_PLAYBOOK_KEY, SUMMARY_PLAYBOOK_KEY,
};
use tokio::sync::broadcast;

use crate::api;
use crate::dto::{
    ApprovalDto, ArtifactDto, PlaybookDto, TaskDto, TaskEventDto, WorkspaceDto,
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
    task_events: Mutex<HashMap<String, Vec<TaskEventDto>>>,
    task_event_bus: broadcast::Sender<TaskEventDto>,
}

impl AppState {
    pub fn new_for_test() -> Self {
        let (task_event_bus, _) = broadcast::channel(64);
        let playbooks = list_registered_playbooks()
            .into_iter()
            .map(|playbook| PlaybookDto {
                key: playbook.key,
                title: playbook.title,
                mode: match playbook.mode {
                    PlaybookMode::Standard => "standard".to_owned(),
                    PlaybookMode::Discovery => "discovery".to_owned(),
                },
            })
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

    pub fn append_task_event(&self, event: TaskEventDto) {
        self.inner
            .task_events
            .lock()
            .expect("task event lock should not be poisoned")
            .entry(event.task_id.clone())
            .or_default()
            .push(event.clone());
        let _ = self.inner.task_event_bus.send(event);
    }

    pub fn list_task_events(&self, task_id: &str) -> Vec<TaskEventDto> {
        self.inner
            .task_events
            .lock()
            .expect("task event lock should not be poisoned")
            .get(task_id)
            .cloned()
            .unwrap_or_default()
    }

    pub fn subscribe_task_events(&self) -> broadcast::Receiver<TaskEventDto> {
        self.inner.task_event_bus.subscribe()
    }

    pub fn is_known_workspace(&self, workspace_id: &str) -> bool {
        self.inner.workspaces.iter().any(|workspace| workspace.id == workspace_id)
    }

    pub fn is_known_playbook(&self, playbook_key: &str) -> bool {
        self.inner.playbooks.iter().any(|playbook| playbook.key == playbook_key)
    }
}

pub fn router_for_test() -> Router {
    router_with_state(AppState::new_for_test())
}

pub fn router_with_state(state: AppState) -> Router {
    Router::new()
        .merge(api::router())
        .with_state(state)
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
