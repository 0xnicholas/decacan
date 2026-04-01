use std::collections::HashMap;
use time::OffsetDateTime;
use tokio::sync::RwLock;
use uuid::Uuid;

use crate::storage::trace_store::TraceStore;
use crate::trace::entities::*;

pub struct TraceRecorder {
    store: TraceStore,
    active_traces: RwLock<HashMap<String, TaskExecutionTrace>>,
}

impl TraceRecorder {
    pub fn new(store: TraceStore) -> Self {
        Self {
            store,
            active_traces: RwLock::new(HashMap::new()),
        }
    }

    pub async fn start_task(
        &self,
        task_id: impl Into<String>,
        playbook_version_id: Uuid,
        workspace_id: impl Into<String>,
    ) -> String {
        let task_id = task_id.into();
        let trace = TaskExecutionTrace {
            task_id: task_id.clone(),
            playbook_version_id,
            workspace_id: workspace_id.into(),
            steps: vec![],
            overall_status: TaskStatus::Running,
            total_duration_ms: 0,
            step_count: 0,
            failed_step_index: None,
            created_at: OffsetDateTime::now_utc(),
            completed_at: None,
        };

        self.active_traces
            .write()
            .await
            .insert(task_id.clone(), trace);
        task_id
    }

    pub async fn start_step(
        &self,
        task_id: &str,
        step_id: impl Into<String>,
        step_name: impl Into<String>,
        sequence: u32,
    ) {
        let step = StepTrace {
            step_id: step_id.into(),
            step_name: step_name.into(),
            sequence,
            input_snapshot: serde_json::Value::Null,
            output_snapshot: serde_json::Value::Null,
            started_at: OffsetDateTime::now_utc(),
            completed_at: None,
            duration_ms: None,
            retry_count: 0,
            resources_used: Default::default(),
            status: StepStatus::Running,
            error: None,
            invoked_cards: vec![],
        };

        let mut traces = self.active_traces.write().await;
        if let Some(trace) = traces.get_mut(task_id) {
            trace.steps.push(step);
        }
    }

    pub async fn complete_step(&self, task_id: &str, step_id: &str, output: serde_json::Value) {
        let mut traces = self.active_traces.write().await;
        if let Some(trace) = traces.get_mut(task_id) {
            if let Some(step) = trace.steps.iter_mut().find(|s| s.step_id == step_id) {
                step.output_snapshot = output;
                step.completed_at = Some(OffsetDateTime::now_utc());
                step.status = StepStatus::Success;
                // Calculate duration
                step.duration_ms = Some(
                    (step.completed_at.unwrap() - step.started_at).whole_milliseconds() as u64,
                );
            }
        }
    }

    pub async fn fail_step(&self, task_id: &str, step_id: &str, error: StepError) {
        let mut traces = self.active_traces.write().await;
        if let Some(trace) = traces.get_mut(task_id) {
            if let Some(step) = trace.steps.iter_mut().find(|s| s.step_id == step_id) {
                step.error = Some(error);
                step.completed_at = Some(OffsetDateTime::now_utc());
                step.status = StepStatus::Failed;
            }
        }
    }

    pub async fn complete_task(&self, task_id: &str, status: TaskStatus) -> TaskExecutionTrace {
        let mut traces = self.active_traces.write().await;
        let mut trace = traces.remove(task_id).expect("Task trace not found");

        trace.overall_status = status;
        trace.completed_at = Some(OffsetDateTime::now_utc());
        trace.step_count = trace.steps.len() as u32;
        trace.total_duration_ms = trace.steps.iter().filter_map(|s| s.duration_ms).sum();

        // Find failed step
        trace.failed_step_index = trace
            .steps
            .iter()
            .position(|s| matches!(s.status, StepStatus::Failed))
            .map(|i| i as u32);

        // Persist to store
        self.store
            .save_trace(&trace)
            .await
            .expect("Failed to save trace");

        trace
    }
}
