use serde::{Deserialize, Serialize};
use serde_json::Value;
use std::path::PathBuf;

use crate::ports::clock::ClockPort;
use crate::ports::filesystem::FilesystemPort;
use crate::ports::storage::StoragePort;

/// Context passed to routine execution
pub struct RoutineContext {
    pub workspace_root: PathBuf,
    pub step_id: String,
    pub run_id: String,
    pub task_id: String,
    // Internal state storage for the routine
    pub state: RoutineState,
}

/// Mutable state storage for routine execution
#[derive(Debug, Clone, Default)]
pub struct RoutineState {
    data: std::collections::HashMap<String, Value>,
}

impl RoutineState {
    pub fn new() -> Self {
        Self {
            data: std::collections::HashMap::new(),
        }
    }

    pub fn get(&self, key: &str) -> Option<&Value> {
        self.data.get(key)
    }

    pub fn set(&mut self, key: impl Into<String>, value: Value) {
        self.data.insert(key.into(), value);
    }

    pub fn remove(&mut self, key: &str) -> Option<Value> {
        self.data.remove(key)
    }
}

impl RoutineContext {
    pub fn new(
        workspace_root: impl Into<PathBuf>,
        step_id: impl Into<String>,
        run_id: impl Into<String>,
        task_id: impl Into<String>,
    ) -> Self {
        Self {
            workspace_root: workspace_root.into(),
            step_id: step_id.into(),
            run_id: run_id.into(),
            task_id: task_id.into(),
            state: RoutineState::new(),
        }
    }
}

/// Factory for creating contexts with ports
pub struct RoutineContextFactory<F, S, C>
where
    F: FilesystemPort,
    S: StoragePort,
    C: ClockPort,
{
    pub filesystem: F,
    pub storage: S,
    pub clock: C,
    pub workspace_root: PathBuf,
}

impl<F, S, C> RoutineContextFactory<F, S, C>
where
    F: FilesystemPort,
    S: StoragePort,
    C: ClockPort,
{
    pub fn create_context(
        &self,
        step_id: impl Into<String>,
        run_id: impl Into<String>,
        task_id: impl Into<String>,
    ) -> RoutineContext {
        RoutineContext::new(&self.workspace_root, step_id, run_id, task_id)
    }
}
