use std::sync::Arc;

use async_trait::async_trait;
use decacan_agent_contract::{
    ApprovalDecision, ExecutionContext, ExecutionEvent, ExecutionInput, ExecutionRequest,
    events::{RiskLevel, StepOutput},
};
use futures::StreamExt;

use crate::events::TaskEvent;
use crate::ports::execution_engine::ExecutionEnginePort;

#[derive(Debug, thiserror::Error)]
pub enum CoordinatorError {
    #[error("engine error: {0}")]
    Engine(String),
    #[error("store error: {0}")]
    Store(String),
    #[error("execution not found: {0}")]
    ExecutionNotFound(String),
}

#[async_trait]
pub trait ExecutionIndex: Send + Sync {
    async fn register(
        &self,
        execution_id: &str,
        task_id: &str,
        run_id: &str,
    ) -> Result<(), CoordinatorError>;
    async fn resolve(
        &self,
        execution_id: &str,
    ) -> Result<Option<ExecutionMapping>, CoordinatorError>;
    async fn mark_completed(&self, execution_id: &str) -> Result<(), CoordinatorError>;
    async fn mark_failed(&self, execution_id: &str) -> Result<(), CoordinatorError>;
}

#[derive(Debug, Clone)]
pub struct ExecutionMapping {
    pub task_id: String,
    pub run_id: String,
}

#[async_trait]
pub trait TaskStore: Send + Sync {
    async fn mark_running(&self, task_id: &str) -> Result<(), CoordinatorError>;
    async fn block_on_approval(
        &self,
        task_id: &str,
        approval_id: &str,
    ) -> Result<(), CoordinatorError>;
    async fn block_on_input(&self, task_id: &str, prompt: &str) -> Result<(), CoordinatorError>;
    async fn complete(
        &self,
        task_id: &str,
        outputs: &[StepOutput],
    ) -> Result<(), CoordinatorError>;
    async fn fail(
        &self,
        task_id: &str,
        reason: &str,
        recoverable: bool,
    ) -> Result<(), CoordinatorError>;
    async fn update_phase(&self, task_id: &str, phase: &str) -> Result<(), CoordinatorError>;
    async fn record_pending_tool(
        &self,
        task_id: &str,
        event: &ExecutionEvent,
    ) -> Result<(), CoordinatorError>;
    async fn record_file_write(
        &self,
        task_id: &str,
        path: &str,
        size_bytes: u64,
        content_hash: &str,
    ) -> Result<(), CoordinatorError>;
}

#[async_trait]
pub trait ApprovalStore: Send + Sync {
    async fn create_pending(
        &self,
        task_id: &str,
        run_id: &str,
        approval_id: &str,
        prompt: &str,
        risk_level: &RiskLevel,
    ) -> Result<(), CoordinatorError>;
}

#[async_trait]
pub trait ArtifactStore: Send + Sync {
    async fn register(
        &self,
        task_id: &str,
        run_id: &str,
        artifact_id: &str,
        artifact_name: &str,
        artifact_type: &str,
        canonical_path: &str,
    ) -> Result<(), CoordinatorError>;
}

pub struct ExecutionCoordinator {
    engine: Arc<dyn ExecutionEnginePort<Error = CoordinatorError>>,
    task_store: Arc<dyn TaskStore>,
    approval_store: Arc<dyn ApprovalStore>,
    artifact_store: Arc<dyn ArtifactStore>,
    execution_index: Arc<dyn ExecutionIndex>,
    event_callback: Arc<dyn Fn(TaskEvent) + Send + Sync>,
}

impl std::fmt::Debug for ExecutionCoordinator {
    fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result {
        f.debug_struct("ExecutionCoordinator")
            .field("event_callback", &"...")
            .finish_non_exhaustive()
    }
}

impl Clone for ExecutionCoordinator {
    fn clone(&self) -> Self {
        Self {
            engine: self.engine.clone(),
            task_store: self.task_store.clone(),
            approval_store: self.approval_store.clone(),
            artifact_store: self.artifact_store.clone(),
            execution_index: self.execution_index.clone(),
            event_callback: self.event_callback.clone(),
        }
    }
}

impl ExecutionCoordinator {
    pub fn new(
        engine: Arc<dyn ExecutionEnginePort<Error = CoordinatorError>>,
        task_store: Arc<dyn TaskStore>,
        approval_store: Arc<dyn ApprovalStore>,
        artifact_store: Arc<dyn ArtifactStore>,
        execution_index: Arc<dyn ExecutionIndex>,
        event_callback: Arc<dyn Fn(TaskEvent) + Send + Sync>,
    ) -> Self {
        Self {
            engine,
            task_store,
            approval_store,
            artifact_store,
            execution_index,
            event_callback,
        }
    }

    pub async fn launch(
        &self,
        task_id: &str,
        run_id: &str,
        playbook_snapshot: decacan_agent_contract::PlaybookSnapshot,
        initial_context: ExecutionContext,
    ) -> Result<String, CoordinatorError> {
        let execution_id = format!("exec-{task_id}-{run_id}");
        let workspace_id = playbook_snapshot.playbook_handle_id.clone();

        self.execution_index
            .register(&execution_id, task_id, run_id)
            .await?;

        self.engine
            .start(ExecutionRequest {
                execution_id: execution_id.clone(),
                workspace_id,
                task_id: task_id.to_string(),
                run_id: run_id.to_string(),
                playbook_snapshot,
                context: initial_context,
            })
            .await?;

        let coordinator = self.clone();
        let exec_id = execution_id.clone();
        tokio::spawn(async move {
            match coordinator.engine.subscribe_events(&exec_id).await {
                Ok(mut stream) => {
                    while let Some(result) = stream.next().await {
                        match result {
                            Ok(event) => {
                                if let Err(e) = coordinator.process_event(&exec_id, event).await {
                                    tracing::error!(
                                        error = %e,
                                        execution_id = %exec_id,
                                        "Event processing failed"
                                    );
                                }
                            }
                            Err(e) => {
                                tracing::error!(
                                    error = %e,
                                    execution_id = %exec_id,
                                    "Event stream error"
                                );
                            }
                        }
                    }
                }
                Err(e) => {
                    tracing::error!(
                        error = %e,
                        execution_id = %exec_id,
                        "Failed to subscribe to event stream"
                    );
                }
            }
            tracing::info!(execution_id = %exec_id, "Event stream ended");
        });

        Ok(execution_id)
    }

    async fn process_event(
        &self,
        execution_id: &str,
        event: ExecutionEvent,
    ) -> Result<(), CoordinatorError> {
        let mapping = self
            .execution_index
            .resolve(execution_id)
            .await?
            .ok_or_else(|| CoordinatorError::ExecutionNotFound(execution_id.to_string()))?;

        match &event {
            ExecutionEvent::ExecutionStarted { .. } => {
                self.task_store.mark_running(&mapping.task_id).await?;
            }
            ExecutionEvent::PhaseChanged { phase, .. } => {
                self.task_store
                    .update_phase(&mapping.task_id, &format!("{:?}", phase))
                    .await?;
            }
            ExecutionEvent::StepStarted { .. } => {}
            ExecutionEvent::StepCompleted { .. } => {}
            ExecutionEvent::ApprovalRequired {
                approval_id,
                prompt,
                risk_level,
                ..
            } => {
                self.approval_store
                    .create_pending(
                        &mapping.task_id,
                        &mapping.run_id,
                        approval_id,
                        prompt,
                        risk_level,
                    )
                    .await?;
                self.task_store
                    .block_on_approval(&mapping.task_id, approval_id)
                    .await?;
            }
            ExecutionEvent::InputRequired { prompt, .. } => {
                self.task_store
                    .block_on_input(&mapping.task_id, prompt)
                    .await?;
            }
            ExecutionEvent::ToolWillExecute { risk_level, .. }
                if *risk_level == RiskLevel::High || *risk_level == RiskLevel::Critical =>
            {
                self.task_store
                    .record_pending_tool(&mapping.task_id, &event)
                    .await?;
            }
            ExecutionEvent::ToolWillExecute { .. } => {}
            ExecutionEvent::ToolDidExecute { .. } => {}
            ExecutionEvent::ArtifactProduced {
                artifact_id,
                artifact_name,
                artifact_type,
                canonical_path,
                ..
            } => {
                self.artifact_store
                    .register(
                        &mapping.task_id,
                        &mapping.run_id,
                        artifact_id,
                        artifact_name,
                        artifact_type,
                        canonical_path,
                    )
                    .await?;
            }
            ExecutionEvent::FileWrite {
                relative_path,
                size_bytes,
                content_hash,
                ..
            } => {
                self.task_store
                    .record_file_write(
                        &mapping.task_id,
                        relative_path,
                        *size_bytes,
                        content_hash,
                    )
                    .await?;
            }
            ExecutionEvent::ModelCalled { .. } => {}
            ExecutionEvent::Completed { .. } => {
                self.task_store.complete(&mapping.task_id, &[]).await?;
                self.execution_index.mark_completed(execution_id).await?;
            }
            ExecutionEvent::Failed {
                reason,
                recoverable,
                ..
            } => {
                self.task_store
                    .fail(&mapping.task_id, reason, *recoverable)
                    .await?;
                self.execution_index.mark_failed(execution_id).await?;
            }
            ExecutionEvent::Heartbeat { .. } => {}
        }

        let task_event = TaskEvent::from_execution_event(&mapping.task_id, execution_id, &event);
        (self.event_callback)(task_event);

        Ok(())
    }

    pub async fn submit_approval(
        &self,
        execution_id: &str,
        approval_id: &str,
        decision: ApprovalDecision,
    ) -> Result<(), CoordinatorError> {
        self.engine
            .submit(
                execution_id,
                ExecutionInput::ApprovalDecision {
                    approval_id: approval_id.to_string(),
                    decision,
                },
            )
            .await
    }

    pub async fn submit_user_input(
        &self,
        execution_id: &str,
        input: &str,
    ) -> Result<(), CoordinatorError> {
        self.engine
            .submit(
                execution_id,
                ExecutionInput::UserText {
                    content: input.to_string(),
                },
            )
            .await
    }
}
