use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use uuid::Uuid;

use super::storage::StorageConfig;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Workspace {
    pub id: String,
    pub owner_id: String,
    pub slug: String,
    pub name: String,
    pub description: Option<String>,
    pub icon_url: Option<String>,
    pub storage_config: StorageConfig,
    pub status: WorkspaceStatus,
    pub visibility: WorkspaceVisibility,
    pub settings: WorkspaceSettings,
    pub created_by: String,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
    pub archived_at: Option<OffsetDateTime>,
    pub version_id: Uuid,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkspaceStatus {
    Draft,
    Active,
    Archived,
    Deleted,
}

impl WorkspaceStatus {
    pub fn can_transition_to(&self, target: WorkspaceStatus) -> bool {
        match (self, target) {
            (WorkspaceStatus::Draft, WorkspaceStatus::Active) => true,
            (WorkspaceStatus::Active, WorkspaceStatus::Archived) => true,
            (WorkspaceStatus::Active, WorkspaceStatus::Deleted) => true,
            (WorkspaceStatus::Archived, WorkspaceStatus::Active) => true,
            (WorkspaceStatus::Archived, WorkspaceStatus::Deleted) => true,
            _ => false,
        }
    }
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkspaceVisibility {
    Private,
    Organization,
    Public,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkspaceSettings {
    pub max_members: u32,
    pub storage_quota_mb: u64,
    pub max_tasks_per_day: u32,
    pub retention_days: u32,
    pub features: WorkspaceFeatures,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkspaceFeatures {
    pub enable_team_execution: bool,
    pub enable_custom_extensions: bool,
    pub enable_api_access: bool,
    pub enable_audit_logs: bool,
}

impl Default for WorkspaceSettings {
    fn default() -> Self {
        Self {
            max_members: 100,
            storage_quota_mb: 10_240,
            max_tasks_per_day: 1000,
            retention_days: 90,
            features: WorkspaceFeatures::default(),
        }
    }
}

impl Default for WorkspaceFeatures {
    fn default() -> Self {
        Self {
            enable_team_execution: false,
            enable_custom_extensions: false,
            enable_api_access: false,
            enable_audit_logs: false,
        }
    }
}

impl WorkspaceSettings {
    pub fn is_within_quota(&self, used_mb: u64) -> bool {
        used_mb <= self.storage_quota_mb
    }
}

impl Workspace {
    pub fn new(
        id: impl Into<String>,
        name: impl Into<String>,
        root_path: impl Into<String>,
    ) -> Self {
        let id = id.into();
        let name_str: String = name.into();
        let root: String = root_path.into();

        let now = OffsetDateTime::now_utc();
        Self {
            id: id.clone(),
            owner_id: "default".to_string(),
            slug: id,
            name: name_str,
            description: None,
            icon_url: None,
            storage_config: StorageConfig::local(root),
            status: WorkspaceStatus::Active,
            visibility: WorkspaceVisibility::Private,
            settings: WorkspaceSettings::default(),
            created_by: "system".to_string(),
            created_at: now,
            updated_at: now,
            archived_at: None,
            version_id: Uuid::new_v4(),
        }
    }

    pub fn new_with_config(
        id: impl Into<String>,
        owner_id: impl Into<String>,
        slug: impl Into<String>,
        name: impl Into<String>,
        description: Option<impl Into<String>>,
        icon_url: Option<impl Into<String>>,
        storage_config: StorageConfig,
        visibility: WorkspaceVisibility,
        settings: WorkspaceSettings,
        created_by: impl Into<String>,
    ) -> Self {
        let now = OffsetDateTime::now_utc();
        Self {
            id: id.into(),
            owner_id: owner_id.into(),
            slug: slug.into(),
            name: name.into(),
            description: description.map(|d| d.into()),
            icon_url: icon_url.map(|u| u.into()),
            storage_config,
            status: WorkspaceStatus::Draft,
            visibility,
            settings,
            created_by: created_by.into(),
            created_at: now,
            updated_at: now,
            archived_at: None,
            version_id: Uuid::new_v4(),
        }
    }

    pub fn new_for_test(id: &str, name: &str, root_path: &str) -> Self {
        Self::new(id, name, root_path)
    }

    pub fn root_path(&self) -> &str {
        self.storage_config
            .local_path
            .as_deref()
            .unwrap_or("/tmp/workspace")
    }

    pub fn activate(&mut self) {
        if self.status.can_transition_to(WorkspaceStatus::Active) {
            self.status = WorkspaceStatus::Active;
            self.updated_at = OffsetDateTime::now_utc();
        }
    }

    pub fn archive(&mut self) {
        if self.status.can_transition_to(WorkspaceStatus::Archived) {
            self.status = WorkspaceStatus::Archived;
            self.archived_at = Some(OffsetDateTime::now_utc());
            self.updated_at = OffsetDateTime::now_utc();
        }
    }

    pub fn restore(&mut self) {
        if self.status.can_transition_to(WorkspaceStatus::Active) {
            self.status = WorkspaceStatus::Active;
            self.archived_at = None;
            self.updated_at = OffsetDateTime::now_utc();
        }
    }
}
