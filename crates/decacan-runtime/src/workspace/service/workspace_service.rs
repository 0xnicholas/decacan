use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use thiserror::Error;
use uuid::Uuid;

use crate::workspace::entity::{
    StorageConfig, Workspace, WorkspaceSettings, WorkspaceStatus, WorkspaceVisibility,
};

#[derive(Debug, Error, Clone, PartialEq)]
pub enum WorkspaceServiceError {
    #[error("Workspace not found")]
    NotFound,
    #[error("Workspace with slug '{slug}' already exists for tenant '{owner_id}'")]
    AlreadyExists { slug: String, owner_id: String },
    #[error("Invalid state transition from {from:?} to {to:?}")]
    InvalidStateTransition { from: WorkspaceStatus, to: WorkspaceStatus },
}

#[derive(Debug, Clone)]
pub struct CreateWorkspaceInput {
    pub owner_id: String,
    pub slug: String,
    pub name: String,
    pub description: Option<String>,
    pub storage_config: StorageConfig,
    pub visibility: WorkspaceVisibility,
    pub settings: WorkspaceSettings,
    pub created_by: String,
}

pub struct WorkspaceService {
    storage: Arc<Mutex<HashMap<String, Workspace>>>,
    slug_index: Arc<Mutex<HashMap<(String, String), String>>>,
}

impl WorkspaceService {
    pub fn new() -> Self {
        Self {
            storage: Arc::new(Mutex::new(HashMap::new())),
            slug_index: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub async fn create_workspace(
        &self,
        input: CreateWorkspaceInput,
    ) -> Result<Workspace, WorkspaceServiceError> {
        let slug_key = (input.owner_id.clone(), input.slug.clone());
        
        {
            let slug_index = self.slug_index.lock().unwrap();
            if slug_index.contains_key(&slug_key) {
                return Err(WorkspaceServiceError::AlreadyExists {
                    slug: input.slug,
                    owner_id: input.owner_id,
                });
            }
        }

        let id = Uuid::new_v4().to_string();
        let workspace = Workspace::new_with_config(
            id.clone(),
            input.owner_id.clone(),
            input.slug.clone(),
            input.name,
            input.description,
            None::<String>,
            input.storage_config,
            input.visibility,
            input.settings,
            input.created_by,
        );

        {
            let mut storage = self.storage.lock().unwrap();
            let mut slug_index = self.slug_index.lock().unwrap();
            storage.insert(id.clone(), workspace.clone());
            slug_index.insert(slug_key, id);
        }

        Ok(workspace)
    }

    pub async fn get_workspace(
        &self,
        id: &str,
    ) -> Result<Workspace, WorkspaceServiceError> {
        let storage = self.storage.lock().unwrap();
        storage
            .get(id)
            .cloned()
            .ok_or(WorkspaceServiceError::NotFound)
    }

    pub async fn list_workspaces(
        &self,
        owner_id: &str,
    ) -> Vec<Workspace> {
        let storage = self.storage.lock().unwrap();
        storage
            .values()
            .filter(|ws| ws.owner_id == owner_id)
            .cloned()
            .collect()
    }

    pub async fn activate_workspace(
        &self,
        id: &str,
    ) -> Result<Workspace, WorkspaceServiceError> {
        let mut storage = self.storage.lock().unwrap();
        let workspace = storage
            .get_mut(id)
            .ok_or(WorkspaceServiceError::NotFound)?;

        let current_status = workspace.status;
        let target_status = WorkspaceStatus::Active;

        if !current_status.can_transition_to(target_status) {
            return Err(WorkspaceServiceError::InvalidStateTransition {
                from: current_status,
                to: target_status,
            });
        }

        workspace.activate();
        Ok(workspace.clone())
    }

    pub async fn archive_workspace(
        &self,
        id: &str,
    ) -> Result<Workspace, WorkspaceServiceError> {
        let mut storage = self.storage.lock().unwrap();
        let workspace = storage
            .get_mut(id)
            .ok_or(WorkspaceServiceError::NotFound)?;

        let current_status = workspace.status;
        let target_status = WorkspaceStatus::Archived;

        if !current_status.can_transition_to(target_status) {
            return Err(WorkspaceServiceError::InvalidStateTransition {
                from: current_status,
                to: target_status,
            });
        }

        workspace.archive();
        Ok(workspace.clone())
    }

    pub async fn restore_workspace(
        &self,
        id: &str,
    ) -> Result<Workspace, WorkspaceServiceError> {
        let mut storage = self.storage.lock().unwrap();
        let workspace = storage
            .get_mut(id)
            .ok_or(WorkspaceServiceError::NotFound)?;

        let current_status = workspace.status;
        let target_status = WorkspaceStatus::Active;

        if !current_status.can_transition_to(target_status) {
            return Err(WorkspaceServiceError::InvalidStateTransition {
                from: current_status,
                to: target_status,
            });
        }

        workspace.restore();
        Ok(workspace.clone())
    }

    pub async fn delete_workspace(
        &self,
        id: &str,
    ) -> Result<(), WorkspaceServiceError> {
        let mut storage = self.storage.lock().unwrap();
        let workspace = storage
            .get(id)
            .ok_or(WorkspaceServiceError::NotFound)?;

        let current_status = workspace.status;
        let target_status = WorkspaceStatus::Deleted;

        if !current_status.can_transition_to(target_status) {
            return Err(WorkspaceServiceError::InvalidStateTransition {
                from: current_status,
                to: target_status,
            });
        }

        let slug_key = (workspace.owner_id.clone(), workspace.slug.clone());
        
        {
            let mut slug_index = self.slug_index.lock().unwrap();
            slug_index.remove(&slug_key);
        }
        
        storage.remove(id);
        
        Ok(())
    }
}

impl Default for WorkspaceService {
    fn default() -> Self {
        Self::new()
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[tokio::test]
    async fn test_create_workspace_basic() {
        let service = WorkspaceService::new();

        let input = CreateWorkspaceInput {
            owner_id: "tenant-1".to_string(),
            slug: "my-workspace".to_string(),
            name: "My Workspace".to_string(),
            description: None,
            storage_config: StorageConfig::local("/data/ws-1"),
            visibility: WorkspaceVisibility::Private,
            settings: WorkspaceSettings::default(),
            created_by: "user-1".to_string(),
        };

        let result = service.create_workspace(input).await;
        assert!(result.is_ok());

        let workspace = result.unwrap();
        assert_eq!(workspace.owner_id, "tenant-1");
        assert_eq!(workspace.slug, "my-workspace");
        assert_eq!(workspace.name, "My Workspace");
    }
}
