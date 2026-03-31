# Decacan Workspace Module Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement a complete workspace module with RBAC, multi-tenancy, storage abstraction, and workspace policy enforcement for task-level directory boundaries.

**Architecture:** Build the workspace module as a layered system: entity layer (domain types), policy layer (resolution and validation), storage layer (local/cloud abstraction), service layer (business logic), and API layer (HTTP endpoints). Use TDD with failing tests first.

**Tech Stack:** Rust, serde, uuid, time, tokio, axum (for API), thiserror, mockall (for testing)

---

## Scope Check

This plan implements the complete workspace module as designed in `2026-03-30-decacan-workspace-module-design-spec.md`. The implementation includes:

1. Core entities (Workspace, User, Membership, PolicyProfile, WorkspacePolicy)
2. RBAC permission system
3. Workspace policy resolution and validation
4. Storage abstraction layer
5. Service layer with business logic
6. HTTP API endpoints
7. Integration with existing Tool Gateway

**Out of scope:** Frontend UI, organization/tenant management UI, advanced analytics dashboard.

---

## File Structure

### Core Entities (crates/decacan-runtime/src/workspace/)

- `entity/mod.rs` - Entity exports
- `entity/workspace.rs` - Workspace entity with full fields
- `entity/user.rs` - User entity
- `entity/membership.rs` - Workspace membership with RBAC
- `entity/policy_profile.rs` - Policy profile entity
- `entity/policy.rs` - Workspace policy entity
- `entity/storage.rs` - Storage configuration

### RBAC (crates/decacan-runtime/src/workspace/)

- `rbac/mod.rs` - RBAC exports
- `rbac/role.rs` - Role enum and permissions
- `rbac/permission.rs` - Permission types
- `rbac/checker.rs` - Permission checker

### Policy (crates/decacan-runtime/src/workspace/)

- `policy/mod.rs` - Policy exports
- `policy/resolver.rs` - WorkspacePolicyResolver
- `policy/boundary.rs` - Path boundary validation
- `policy/validator.rs` - Path validation utilities

### Storage (crates/decacan-runtime/src/workspace/)

- `storage/mod.rs` - Storage exports
- `storage/provider.rs` - Storage provider trait
- `storage/local.rs` - Local filesystem implementation
- `storage/cloud.rs` - Cloud storage abstraction (stub)

### Service (crates/decacan-runtime/src/workspace/)

- `service/mod.rs` - Service exports
- `service/workspace_service.rs` - Workspace CRUD operations
- `service/member_service.rs` - Member management
- `service/policy_service.rs` - Policy profile management

### API (crates/decacan-app/src/api/)

- `workspaces.rs` - Modified with full CRUD
- `members.rs` - New member management endpoints
- `policies.rs` - New policy management endpoints

### Tests

- `crates/decacan-runtime/tests/workspace_entity.rs` - Entity tests
- `crates/decacan-runtime/tests/workspace_rbac.rs` - RBAC tests
- `crates/decacan-runtime/tests/workspace_policy.rs` - Policy tests
- `crates/decacan-runtime/tests/workspace_storage.rs` - Storage tests
- `crates/decacan-app/tests/workspace_api.rs` - API integration tests

---

## Task 1: Extend Workspace Entity with Full Fields

**Files:**
- Create: `crates/decacan-runtime/src/workspace/entity/mod.rs`
- Create: `crates/decacan-runtime/src/workspace/entity/workspace.rs`
- Modify: `crates/decacan-runtime/src/workspace/mod.rs`
- Test: `crates/decacan-runtime/tests/workspace_entity.rs`

- [ ] **Step 1: Write failing workspace entity tests**

Create `crates/decacan-runtime/tests/workspace_entity.rs`:

```rust
use decacan_runtime::workspace::entity::{
    StorageConfig, StorageProvider, Workspace, WorkspaceSettings, WorkspaceStatus,
    WorkspaceVisibility,
};

#[test]
fn workspace_has_all_required_fields() {
    let workspace = Workspace::new(
        "ws-1",
        "tenant-1",
        "my-workspace",
        "My Workspace",
        Some("Description".to_string()),
        None,
        StorageConfig::local("/data/workspace"),
        WorkspaceStatus::Active,
        WorkspaceVisibility::Private,
        WorkspaceSettings::default(),
        "user-1",
    );

    assert_eq!(workspace.id, "ws-1");
    assert_eq!(workspace.tenant_id, "tenant-1");
    assert_eq!(workspace.slug, "my-workspace");
    assert_eq!(workspace.name, "My Workspace");
    assert_eq!(workspace.description, Some("Description".to_string()));
    assert!(matches!(workspace.status, WorkspaceStatus::Active));
    assert!(matches!(workspace.visibility, WorkspaceVisibility::Private));
}

#[test]
fn workspace_status_transitions() {
    use WorkspaceStatus::*;
    
    // Draft can become Active
    assert!(Draft.can_transition_to(Active));
    // Active can become Archived
    assert!(Active.can_transition_to(Archived));
    // Active cannot become Draft
    assert!(!Active.can_transition_to(Draft));
    // Archived can become Deleted
    assert!(Archived.can_transition_to(Deleted));
}

#[test]
fn storage_config_serialization() {
    let config = StorageConfig::local("/data/workspace");
    let json = serde_json::to_string(&config).unwrap();
    let deserialized: StorageConfig = serde_json::from_str(&json).unwrap();
    
    assert!(matches!(deserialized.provider, StorageProvider::Local));
    assert_eq!(deserialized.local_path, Some("/data/workspace".to_string()));
}

#[test]
fn workspace_settings_enforce_limits() {
    let settings = WorkspaceSettings {
        max_members: 10,
        storage_quota_mb: 1024,
        max_tasks_per_day: 100,
        retention_days: 30,
        features: Default::default(),
    };
    
    assert!(settings.is_within_quota(512));  // 512 MB < 1024 MB
    assert!(!settings.is_within_quota(2048)); // 2048 MB > 1024 MB
}
```

- [ ] **Step 2: Run focused tests to confirm failure**

Run: `cargo test -p decacan-runtime --test workspace_entity -- --nocapture`
Expected: FAIL because workspace entity types are not implemented.

- [ ] **Step 3: Implement workspace entity with full fields**

Create `crates/decacan-runtime/src/workspace/entity/workspace.rs`:

```rust
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use uuid::Uuid;

use super::storage::{StorageConfig, StorageProvider};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Workspace {
    pub id: String,
    pub tenant_id: String,
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
            max_members: 10,
            storage_quota_mb: 1024,
            max_tasks_per_day: 100,
            retention_days: 30,
            features: WorkspaceFeatures::default(),
        }
    }
}

impl Default for WorkspaceFeatures {
    fn default() -> Self {
        Self {
            enable_team_execution: false,
            enable_custom_extensions: false,
            enable_api_access: true,
            enable_audit_logs: true,
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
        tenant_id: impl Into<String>,
        slug: impl Into<String>,
        name: impl Into<String>,
        description: Option<String>,
        icon_url: Option<String>,
        storage_config: StorageConfig,
        status: WorkspaceStatus,
        visibility: WorkspaceVisibility,
        settings: WorkspaceSettings,
        created_by: impl Into<String>,
    ) -> Self {
        let now = OffsetDateTime::now_utc();
        Self {
            id: id.into(),
            tenant_id: tenant_id.into(),
            slug: slug.into(),
            name: name.into(),
            description,
            icon_url,
            storage_config,
            status,
            visibility,
            settings,
            created_by: created_by.into(),
            created_at: now,
            updated_at: now,
            archived_at: None,
            version_id: Uuid::new_v4(),
        }
    }

    pub fn new_for_test(id: &str, tenant_id: &str, slug: &str, name: &str) -> Self {
        Self::new(
            id,
            tenant_id,
            slug,
            name,
            None,
            None,
            StorageConfig::local("/tmp/workspace"),
            WorkspaceStatus::Active,
            WorkspaceVisibility::Private,
            WorkspaceSettings::default(),
            "user-1",
        )
    }

    pub fn archive(&mut self) {
        if self.status.can_transition_to(WorkspaceStatus::Archived) {
            self.status = WorkspaceStatus::Archived;
            self.archived_at = Some(OffsetDateTime::now_utc());
            self.updated_at = OffsetDateTime::now_utc();
        }
    }

    pub fn restore(&mut self) {
        if self.status == WorkspaceStatus::Archived {
            self.status = WorkspaceStatus::Active;
            self.archived_at = None;
            self.updated_at = OffsetDateTime::now_utc();
        }
    }
}
```

Create `crates/decacan-runtime/src/workspace/entity/storage.rs`:

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct StorageConfig {
    pub provider: StorageProvider,
    pub local_path: Option<String>,
    pub cloud_config: Option<CloudStorageConfig>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum StorageProvider {
    Local,
    S3,
    Gcs,
    AzureBlob,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct CloudStorageConfig {
    pub bucket: String,
    pub prefix: String,
    pub region: String,
    pub credentials_id: String,
}

impl StorageConfig {
    pub fn local(path: impl Into<String>) -> Self {
        Self {
            provider: StorageProvider::Local,
            local_path: Some(path.into()),
            cloud_config: None,
        }
    }

    pub fn s3(bucket: impl Into<String>, region: impl Into<String>) -> Self {
        Self {
            provider: StorageProvider::S3,
            local_path: None,
            cloud_config: Some(CloudStorageConfig {
                bucket: bucket.into(),
                prefix: String::new(),
                region: region.into(),
                credentials_id: String::new(),
            }),
        }
    }
}
```

Create `crates/decacan-runtime/src/workspace/entity/mod.rs`:

```rust
pub mod policy;
pub mod policy_profile;
pub mod storage;
pub mod user;
pub mod workspace;
pub mod membership;

pub use policy::*;
pub use policy_profile::*;
pub use storage::*;
pub use user::*;
pub use workspace::*;
pub use membership::*;
```

Modify `crates/decacan-runtime/src/workspace/mod.rs`:

```rust
pub mod entity;
pub mod rbac;
pub mod policy;
pub mod storage;
pub mod service;
```

- [ ] **Step 4: Re-run focused tests**

Run: `cargo test -p decacan-runtime --test workspace_entity -- --nocapture`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/workspace/
git add crates/decacan-runtime/tests/workspace_entity.rs
git commit -m "feat: extend workspace entity with full fields and storage config"
```

---

## Task 2: Implement User and Membership Entities

**Files:**
- Create: `crates/decacan-runtime/src/workspace/entity/user.rs`
- Create: `crates/decacan-runtime/src/workspace/entity/membership.rs`
- Modify: `crates/decacan-runtime/tests/workspace_entity.rs`

- [ ] **Step 1: Write failing user and membership tests**

Add to `crates/decacan-runtime/tests/workspace_entity.rs`:

```rust
use decacan_runtime::workspace::entity::{
    User, UserStatus, WorkspaceMembership, WorkspaceRole,
};

#[test]
fn user_has_required_fields() {
    let user = User::new(
        "user-1",
        "tenant-1",
        "user@example.com",
        "John Doe",
        None,
    );
    
    assert_eq!(user.id, "user-1");
    assert_eq!(user.tenant_id, "tenant-1");
    assert_eq!(user.email, "user@example.com");
    assert_eq!(user.name, "John Doe");
    assert!(matches!(user.status, UserStatus::Active));
}

#[test]
fn workspace_membership_has_role() {
    let membership = WorkspaceMembership::new(
        "member-1",
        "ws-1",
        "user-1",
        WorkspaceRole::Editor,
        None,
    );
    
    assert_eq!(membership.workspace_id, "ws-1");
    assert_eq!(membership.user_id, "user-1");
    assert!(matches!(membership.role, WorkspaceRole::Editor));
}

#[test]
fn workspace_role_has_correct_permissions() {
    use decacan_runtime::workspace::rbac::{ActionType, ResourceType};
    
    let owner_perms = WorkspaceRole::Owner.permissions();
    assert!(owner_perms.iter().any(|p| 
        p.resource == ResourceType::Workspace && p.action == ActionType::Delete
    ));
    
    let viewer_perms = WorkspaceRole::Viewer.permissions();
    assert!(viewer_perms.iter().all(|p| p.action == ActionType::Read));
}
```

- [ ] **Step 2: Run focused tests to confirm failure**

Run: `cargo test -p decacan-runtime --test workspace_entity user -- --nocapture`
Expected: FAIL.

- [ ] **Step 3: Implement user and membership entities**

Create `crates/decacan-runtime/src/workspace/entity/user.rs`:

```rust
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct User {
    pub id: String,
    pub tenant_id: String,
    pub email: String,
    pub name: String,
    pub avatar_url: Option<String>,
    pub status: UserStatus,
    pub created_at: OffsetDateTime,
    pub last_login_at: Option<OffsetDateTime>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum UserStatus {
    Active,
    Suspended,
    Deleted,
}

impl User {
    pub fn new(
        id: impl Into<String>,
        tenant_id: impl Into<String>,
        email: impl Into<String>,
        name: impl Into<String>,
        avatar_url: Option<String>,
    ) -> Self {
        Self {
            id: id.into(),
            tenant_id: tenant_id.into(),
            email: email.into(),
            name: name.into(),
            avatar_url,
            status: UserStatus::Active,
            created_at: OffsetDateTime::now_utc(),
            last_login_at: None,
        }
    }

    pub fn new_for_test(id: &str, tenant_id: &str) -> Self {
        Self::new(
            id,
            tenant_id,
            format!("{}@example.com", id),
            format!("User {}", id),
            None,
        )
    }
}
```

Create `crates/decacan-runtime/src/workspace/entity/membership.rs`:

```rust
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;

use crate::workspace::rbac::{Permission, WorkspaceRole};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkspaceMembership {
    pub id: String,
    pub workspace_id: String,
    pub user_id: String,
    pub role: WorkspaceRole,
    pub invited_by: Option<String>,
    pub invited_at: Option<OffsetDateTime>,
    pub joined_at: OffsetDateTime,
    pub expires_at: Option<OffsetDateTime>,
}

impl WorkspaceMembership {
    pub fn new(
        id: impl Into<String>,
        workspace_id: impl Into<String>,
        user_id: impl Into<String>,
        role: WorkspaceRole,
        invited_by: Option<String>,
    ) -> Self {
        let now = OffsetDateTime::now_utc();
        Self {
            id: id.into(),
            workspace_id: workspace_id.into(),
            user_id: user_id.into(),
            role,
            invited_by,
            invited_at: invited_by.as_ref().map(|_| now),
            joined_at: now,
            expires_at: None,
        }
    }

    pub fn has_permission(&self, permission: &Permission) -> bool {
        self.role.permissions().iter().any(|p| p.covers(permission))
    }
}
```

- [ ] **Step 4: Re-run focused tests**

Run: `cargo test -p decacan-runtime --test workspace_entity user -- --nocapture`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/workspace/entity/
git add crates/decacan-runtime/tests/workspace_entity.rs
git commit -m "feat: add user and membership entities"
```

---

## Task 3: Implement RBAC Permission System

**Files:**
- Create: `crates/decacan-runtime/src/workspace/rbac/mod.rs`
- Create: `crates/decacan-runtime/src/workspace/rbac/role.rs`
- Create: `crates/decacan-runtime/src/workspace/rbac/permission.rs`
- Test: `crates/decacan-runtime/tests/workspace_rbac.rs`

- [ ] **Step 1: Write failing RBAC tests**

Create `crates/decacan-runtime/tests/workspace_rbac.rs`:

```rust
use decacan_runtime::workspace::rbac::{
    ActionType, Permission, ResourceType, WorkspaceRole,
};

#[test]
fn owner_has_all_permissions() {
    let owner_perms = WorkspaceRole::Owner.permissions();
    
    // Owner should have all CRUD on all resources
    for resource in [ResourceType::Workspace, ResourceType::Playbook, ResourceType::Task] {
        for action in [ActionType::Create, ActionType::Read, ActionType::Update, ActionType::Delete] {
            assert!(
                owner_perms.iter().any(|p| p.resource == resource && p.action == action),
                "Owner should have {:?} on {:?}", action, resource
            );
        }
    }
}

#[test]
fn viewer_has_only_read_permissions() {
    let viewer_perms = WorkspaceRole::Viewer.permissions();
    
    assert!(viewer_perms.iter().all(|p| p.action == ActionType::Read));
    assert!(!viewer_perms.iter().any(|p| p.action == ActionType::Create));
}

#[test]
fn permission_covers_works_correctly() {
    let specific = Permission::new(ResourceType::Playbook, ActionType::Read);
    let general = Permission::new(ResourceType::Any, ActionType::Read);
    
    assert!(general.covers(&specific));
    assert!(!specific.covers(&general));
}

#[test]
fn editor_cannot_delete_workspace() {
    let editor_perms = WorkspaceRole::Editor.permissions();
    let delete_workspace = Permission::new(ResourceType::Workspace, ActionType::Delete);
    
    assert!(!editor_perms.iter().any(|p| p.covers(&delete_workspace)));
}
```

- [ ] **Step 2: Run focused tests to confirm failure**

Run: `cargo test -p decacan-runtime --test workspace_rbac -- --nocapture`
Expected: FAIL.

- [ ] **Step 3: Implement RBAC system**

Create `crates/decacan-runtime/src/workspace/rbac/permission.rs`:

```rust
use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ResourceType {
    Workspace,
    Playbook,
    Task,
    Artifact,
    Member,
    Policy,
    Setting,
    Any,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum ActionType {
    Create,
    Read,
    Update,
    Delete,
    Execute,
    Publish,
    Invite,
    Admin,
    Any,
}

#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Permission {
    pub resource: ResourceType,
    pub action: ActionType,
}

impl Permission {
    pub fn new(resource: ResourceType, action: ActionType) -> Self {
        Self { resource, action }
    }

    pub fn covers(&self, other: &Permission) -> bool {
        let resource_matches = self.resource == ResourceType::Any 
            || self.resource == other.resource;
        let action_matches = self.action == ActionType::Any 
            || self.action == other.action;
        
        resource_matches && action_matches
    }

    pub fn all_resources(action: ActionType) -> Self {
        Self::new(ResourceType::Any, action)
    }

    pub fn all_actions(resource: ResourceType) -> Self {
        Self::new(resource, ActionType::Any)
    }
}
```

Create `crates/decacan-runtime/src/workspace/rbac/role.rs`:

```rust
use serde::{Deserialize, Serialize};

use super::permission::{ActionType, Permission, ResourceType};

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkspaceRole {
    Owner,
    Admin,
    Editor,
    Viewer,
    Guest,
}

impl WorkspaceRole {
    pub fn permissions(&self) -> Vec<Permission> {
        match self {
            WorkspaceRole::Owner => Self::owner_permissions(),
            WorkspaceRole::Admin => Self::admin_permissions(),
            WorkspaceRole::Editor => Self::editor_permissions(),
            WorkspaceRole::Viewer => Self::viewer_permissions(),
            WorkspaceRole::Guest => Self::guest_permissions(),
        }
    }

    fn owner_permissions() -> Vec<Permission> {
        vec![
            Permission::all_actions(ResourceType::Workspace),
            Permission::all_actions(ResourceType::Playbook),
            Permission::all_actions(ResourceType::Task),
            Permission::all_actions(ResourceType::Artifact),
            Permission::all_actions(ResourceType::Member),
            Permission::all_actions(ResourceType::Policy),
            Permission::all_actions(ResourceType::Setting),
        ]
    }

    fn admin_permissions() -> Vec<Permission> {
        vec![
            Permission::all_actions(ResourceType::Playbook),
            Permission::all_actions(ResourceType::Task),
            Permission::all_actions(ResourceType::Artifact),
            Permission::new(ResourceType::Member, ActionType::Create),
            Permission::new(ResourceType::Member, ActionType::Read),
            Permission::new(ResourceType::Member, ActionType::Update),
            Permission::new(ResourceType::Policy, ActionType::Create),
            Permission::new(ResourceType::Policy, ActionType::Read),
            Permission::new(ResourceType::Policy, ActionType::Update),
            Permission::new(ResourceType::Setting, ActionType::Create),
            Permission::new(ResourceType::Setting, ActionType::Read),
            Permission::new(ResourceType::Setting, ActionType::Update),
        ]
    }

    fn editor_permissions() -> Vec<Permission> {
        vec![
            Permission::new(ResourceType::Playbook, ActionType::Create),
            Permission::new(ResourceType::Playbook, ActionType::Read),
            Permission::new(ResourceType::Playbook, ActionType::Update),
            Permission::new(ResourceType::Task, ActionType::Create),
            Permission::new(ResourceType::Task, ActionType::Read),
            Permission::new(ResourceType::Task, ActionType::Update),
            Permission::new(ResourceType::Task, ActionType::Execute),
            Permission::new(ResourceType::Artifact, ActionType::Create),
            Permission::new(ResourceType::Artifact, ActionType::Read),
            Permission::new(ResourceType::Artifact, ActionType::Update),
            Permission::new(ResourceType::Setting, ActionType::Read),
        ]
    }

    fn viewer_permissions() -> Vec<Permission> {
        vec![
            Permission::new(ResourceType::Playbook, ActionType::Read),
            Permission::new(ResourceType::Task, ActionType::Read),
            Permission::new(ResourceType::Artifact, ActionType::Read),
            Permission::new(ResourceType::Setting, ActionType::Read),
        ]
    }

    fn guest_permissions() -> Vec<Permission> {
        vec![
            Permission::new(ResourceType::Playbook, ActionType::Read),
            Permission::new(ResourceType::Artifact, ActionType::Read),
        ]
    }
}
```

Create `crates/decacan-runtime/src/workspace/rbac/mod.rs`:

```rust
pub mod permission;
pub mod role;
pub mod checker;

pub use permission::*;
pub use role::*;
pub use checker::*;
```

- [ ] **Step 4: Re-run focused tests**

Run: `cargo test -p decacan-runtime --test workspace_rbac -- --nocapture`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/workspace/rbac/
git add crates/decacan-runtime/tests/workspace_rbac.rs
git commit -m "feat: implement RBAC permission system"
```

---

## Task 4: Implement Workspace Policy Entities

**Files:**
- Create: `crates/decacan-runtime/src/workspace/entity/policy_profile.rs`
- Create: `crates/decacan-runtime/src/workspace/entity/policy.rs`
- Test: `crates/decacan-runtime/tests/workspace_policy.rs`

- [ ] **Step 1: Write failing policy entity tests**

Create `crates/decacan-runtime/tests/workspace_policy.rs`:

```rust
use decacan_runtime::workspace::entity::{
    PathRules, PolicyProfile, ReadBoundary, WriteBoundary, WriteMode,
    WorkspacePolicy, WorkspaceScope,
};
use std::path::PathBuf;

#[test]
fn policy_profile_has_workspace_policy_defaults() {
    let profile = PolicyProfile::new(
        "policy-1",
        "ws-1",
        "Default Policy",
        vec!["workspace.read".to_string()],
        vec!["shell.exec".to_string()],
        vec!["network.egress".to_string()],
    );
    
    assert_eq!(profile.id, "policy-1");
    assert!(matches!(profile.default_scope, WorkspaceScope::FullWorkspace));
    assert!(matches!(profile.default_write_mode, WriteMode::OutputOnly));
    assert!(profile.default_path_rules.prevent_escape);
}

#[test]
fn workspace_policy_has_all_boundary_fields() {
    let policy = WorkspacePolicy::new(
        "wp-1",
        "ws-1",
        WorkspaceScope::FullWorkspace,
        ReadBoundary::default(),
        WriteBoundary::output_only(PathBuf::from("/output")),
        PathRules::default(),
    );
    
    assert_eq!(policy.id, "wp-1");
    assert!(matches!(policy.scope, WorkspaceScope::FullWorkspace));
    assert!(policy.write_boundary.is_restricted_to_output());
    assert!(policy.path_rules.prevent_escape);
}

#[test]
fn write_boundary_output_only_restricts_writes() {
    let boundary = WriteBoundary::output_only(PathBuf::from("/workspace/output"));
    
    assert!(boundary.is_restricted_to_output());
    assert!(!boundary.allows_write_to(PathBuf::from("/workspace/other")));
    assert!(boundary.allows_write_to(PathBuf::from("/workspace/output/file.txt")));
}

#[test]
fn path_rules_blocks_traversal() {
    let rules = PathRules::default();
    
    // Should detect path traversal
    assert!(!rules.is_valid_path("/workspace/output/../secrets.txt"));
    // Should allow normal paths
    assert!(rules.is_valid_path("/workspace/output/file.txt"));
}
```

- [ ] **Step 2: Run focused tests to confirm failure**

Run: `cargo test -p decacan-runtime --test workspace_policy -- --nocapture`
Expected: FAIL.

- [ ] **Step 3: Implement policy entities**

Create `crates/decacan-runtime/src/workspace/entity/policy.rs`:

```rust
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use time::OffsetDateTime;

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkspacePolicy {
    pub id: String,
    pub workspace_id: String,
    pub task_id: Option<String>,
    pub scope: WorkspaceScope,
    pub read_boundary: ReadBoundary,
    pub write_boundary: WriteBoundary,
    pub path_rules: PathRules,
    pub created_at: OffsetDateTime,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkspaceScope {
    FullWorkspace,
    SubpathOnly(String),
    ExplicitPaths(Vec<String>),
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct ReadBoundary {
    pub allowed_paths: Vec<PathBuf>,
    pub blocked_paths: Vec<PathBuf>,
    pub allowed_extensions: Vec<String>,
    pub max_file_size_bytes: Option<u64>,
    pub allow_hidden_files: bool,
    pub follow_symlinks: bool,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WriteBoundary {
    pub mode: WriteMode,
    pub output_root: PathBuf,
    pub approved_paths: Vec<PathBuf>,
    pub allow_overwrite: bool,
    pub require_backup: bool,
    pub max_file_size_bytes: Option<u64>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WriteMode {
    OutputOnly,
    OutputPlusApproved,
    Workspace,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PathRules {
    pub prevent_escape: bool,
    pub allow_absolute_paths: bool,
    pub canonicalize_paths: bool,
    pub allowed_filename_patterns: Vec<String>,
    pub blocked_filename_patterns: Vec<String>,
}

impl Default for ReadBoundary {
    fn default() -> Self {
        Self {
            allowed_paths: vec![PathBuf::from(".")],
            blocked_paths: vec![],
            allowed_extensions: vec![],
            max_file_size_bytes: None,
            allow_hidden_files: false,
            follow_symlinks: false,
        }
    }
}

impl Default for PathRules {
    fn default() -> Self {
        Self {
            prevent_escape: true,
            allow_absolute_paths: true,
            canonicalize_paths: true,
            allowed_filename_patterns: vec![],
            blocked_filename_patterns: vec![],
        }
    }
}

impl WriteBoundary {
    pub fn output_only(output_root: PathBuf) -> Self {
        Self {
            mode: WriteMode::OutputOnly,
            output_root,
            approved_paths: vec![],
            allow_overwrite: false,
            require_backup: true,
            max_file_size_bytes: None,
        }
    }

    pub fn is_restricted_to_output(&self) -> bool {
        matches!(self.mode, WriteMode::OutputOnly)
    }

    pub fn allows_write_to(&self, path: PathBuf) -> bool {
        match self.mode {
            WriteMode::OutputOnly => path.starts_with(&self.output_root),
            WriteMode::OutputPlusApproved => {
                path.starts_with(&self.output_root)
                    || self.approved_paths.iter().any(|approved| path.starts_with(approved))
            }
            WriteMode::Workspace => true,
        }
    }
}

impl PathRules {
    pub fn is_valid_path(&self, path: &str) -> bool {
        if self.prevent_escape && path.contains("..") {
            return false;
        }
        true
    }
}

impl WorkspacePolicy {
    pub fn new(
        id: impl Into<String>,
        workspace_id: impl Into<String>,
        scope: WorkspaceScope,
        read_boundary: ReadBoundary,
        write_boundary: WriteBoundary,
        path_rules: PathRules,
    ) -> Self {
        Self {
            id: id.into(),
            workspace_id: workspace_id.into(),
            task_id: None,
            scope,
            read_boundary,
            write_boundary,
            path_rules,
            created_at: OffsetDateTime::now_utc(),
        }
    }

    pub fn for_task(
        id: impl Into<String>,
        workspace_id: impl Into<String>,
        task_id: impl Into<String>,
        scope: WorkspaceScope,
        read_boundary: ReadBoundary,
        write_boundary: WriteBoundary,
        path_rules: PathRules,
    ) -> Self {
        let mut policy = Self::new(
            id,
            workspace_id,
            scope,
            read_boundary,
            write_boundary,
            path_rules,
        );
        policy.task_id = Some(task_id.into());
        policy
    }
}
```

Create `crates/decacan-runtime/src/workspace/entity/policy_profile.rs`:

```rust
use serde::{Deserialize, Serialize};
use time::OffsetDateTime;
use uuid::Uuid;

use super::policy::{PathRules, ReadBoundary, WriteBoundary, WriteMode, WorkspaceScope};

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PolicyProfile {
    pub id: String,
    pub workspace_id: String,
    pub name: String,
    pub allowed_tools: Vec<String>,
    pub approval_required_tools: Vec<String>,
    pub denied_tools: Vec<String>,
    pub default_scope: WorkspaceScope,
    pub default_write_mode: WriteMode,
    pub default_read_boundary: ReadBoundary,
    pub default_write_boundary: WriteBoundary,
    pub default_path_rules: PathRules,
    pub parent_profile_id: Option<String>,
    pub is_system: bool,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
}

impl PolicyProfile {
    pub fn new(
        id: impl Into<String>,
        workspace_id: impl Into<String>,
        name: impl Into<String>,
        allowed_tools: Vec<String>,
        approval_required_tools: Vec<String>,
        denied_tools: Vec<String>,
    ) -> Self {
        let now = OffsetDateTime::now_utc();
        Self {
            id: id.into(),
            workspace_id: workspace_id.into(),
            name: name.into(),
            allowed_tools,
            approval_required_tools,
            denied_tools,
            default_scope: WorkspaceScope::FullWorkspace,
            default_write_mode: WriteMode::OutputOnly,
            default_read_boundary: ReadBoundary::default(),
            default_write_boundary: WriteBoundary::output_only(std::path::PathBuf::from("output")),
            default_path_rules: PathRules::default(),
            parent_profile_id: None,
            is_system: false,
            created_at: now,
            updated_at: now,
        }
    }

    pub fn new_for_test(id: &str, workspace_id: &str) -> Self {
        Self::new(
            id,
            workspace_id,
            "Test Policy",
            vec!["workspace.read".to_string()],
            vec!["shell.exec".to_string()],
            vec!["network.egress".to_string()],
        )
    }
}
```

- [ ] **Step 4: Re-run focused tests**

Run: `cargo test -p decacan-runtime --test workspace_policy -- --nocapture`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/workspace/entity/
git add crates/decacan-runtime/tests/workspace_policy.rs
git commit -m "feat: add workspace policy and policy profile entities"
```

---

## Task 5: Implement Policy Resolution and Path Validation

**Files:**
- Create: `crates/decacan-runtime/src/workspace/policy/resolver.rs`
- Create: `crates/decacan-runtime/src/workspace/policy/boundary.rs`
- Create: `crates/decacan-runtime/src/workspace/policy/mod.rs`
- Modify: `crates/decacan-runtime/tests/workspace_policy.rs`

- [ ] **Step 1: Write failing policy resolution tests**

Add to `crates/decacan-runtime/tests/workspace_policy.rs`:

```rust
use decacan_runtime::workspace::{
    entity::{PolicyProfile, Workspace, WorkspaceSettings, WorkspaceStatus, WorkspaceVisibility},
    policy::{BoundInputs, PathValidator, WorkspacePolicyResolver},
};
use std::path::Path;

#[test]
fn resolver_creates_policy_from_workspace_and_profile() {
    let workspace = Workspace::new_for_test("ws-1", "tenant-1", "test-ws", "Test Workspace");
    let profile = PolicyProfile::new_for_test("policy-1", "ws-1");
    let inputs = BoundInputs::default();
    
    let resolver = WorkspacePolicyResolver::new(&workspace, &profile, &inputs);
    let policy = resolver.resolve();
    
    assert!(policy.id.starts_with("resolved-"));
    assert!(matches!(policy.scope, decacan_runtime::workspace::entity::WorkspaceScope::FullWorkspace));
    assert!(policy.write_boundary.is_restricted_to_output());
}

#[test]
fn path_validator_blocks_traversal() {
    let validator = PathValidator::default();
    let workspace_root = Path::new("/workspace");
    
    // Should block path traversal
    assert!(!validator.is_within_boundary(
        Path::new("/workspace/output/../secrets.txt"),
        workspace_root
    ));
    
    // Should allow valid paths
    assert!(validator.is_within_boundary(
        Path::new("/workspace/output/file.txt"),
        workspace_root
    ));
}

#[test]
fn path_validator_normalizes_paths() {
    let validator = PathValidator::default();
    
    let normalized = validator.normalize(Path::new("/workspace/output/../file.txt"));
    assert_eq!(normalized, Path::new("/workspace/file.txt"));
}
```

- [ ] **Step 2: Run focused tests to confirm failure**

Run: `cargo test -p decacan-runtime --test workspace_policy resolver -- --nocapture`
Expected: FAIL.

- [ ] **Step 3: Implement policy resolver and path validator**

Create `crates/decacan-runtime/src/workspace/policy/boundary.rs`:

```rust
use std::path::{Component, Path, PathBuf};

use crate::workspace::entity::WorkspacePolicy;

#[derive(Debug, Clone, Default)]
pub struct PathValidator;

impl PathValidator {
    pub fn is_within_boundary(&self, path: &Path, boundary: &Path) -> bool {
        let normalized_path = self.normalize(path);
        let normalized_boundary = self.normalize(boundary);
        
        normalized_path.starts_with(&normalized_boundary)
    }

    pub fn normalize(&self, path: &Path) -> PathBuf {
        let mut normalized = PathBuf::new();

        for component in path.components() {
            match component {
                Component::CurDir => {}
                Component::ParentDir => {
                    let can_pop = matches!(
                        normalized.components().next_back(),
                        Some(Component::Normal(_))
                    );
                    if can_pop {
                        normalized.pop();
                    } else if !path.is_absolute() {
                        normalized.push(component.as_os_str());
                    }
                }
                Component::Normal(part) => normalized.push(part),
                Component::RootDir | Component::Prefix(_) => {
                    normalized.push(component.as_os_str())
                }
            }
        }

        normalized
    }

    pub fn validate_against_policy(&self, path: &Path, policy: &WorkspacePolicy) -> bool {
        // Check path rules
        if policy.path_rules.prevent_escape {
            let path_str = path.to_string_lossy();
            if path_str.contains("..") {
                return false;
            }
        }

        // Check write boundary
        if !policy.write_boundary.allows_write_to(path.to_path_buf()) {
            return false;
        }

        true
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn normalizer_handles_traversal() {
        let validator = PathValidator::default();
        let path = Path::new("/workspace/output/../secrets.txt");
        let normalized = validator.normalize(path);
        assert_eq!(normalized, Path::new("/workspace/secrets.txt"));
    }
}
```

Create `crates/decacan-runtime/src/workspace/policy/resolver.rs`:

```rust
use crate::workspace::entity::{
    BoundInputs as BoundInputsEntity, PolicyProfile, ReadBoundary, Workspace, WorkspacePolicy,
    WorkspaceScope, WriteBoundary, WriteMode,
};

#[derive(Debug, Clone, Default)]
pub struct BoundInputs {
    pub restricted_subpath: Option<String>,
}

impl BoundInputs {
    pub fn with_scope(subpath: impl Into<String>) -> Self {
        Self {
            restricted_subpath: Some(subpath.into()),
        }
    }
}

pub struct WorkspacePolicyResolver<'a> {
    workspace: &'a Workspace,
    policy_profile: &'a PolicyProfile,
    inputs: &'a BoundInputs,
}

impl<'a> WorkspacePolicyResolver<'a> {
    pub fn new(
        workspace: &'a Workspace,
        policy_profile: &'a PolicyProfile,
        inputs: &'a BoundInputs,
    ) -> Self {
        Self {
            workspace,
            policy_profile,
            inputs,
        }
    }

    pub fn resolve(&self) -> WorkspacePolicy {
        let scope = if let Some(ref subpath) = self.inputs.restricted_subpath {
            WorkspaceScope::SubpathOnly(subpath.clone())
        } else {
            self.policy_profile.default_scope.clone()
        };

        let read_boundary = self.build_read_boundary();
        let write_boundary = self.build_write_boundary();
        let path_rules = self.policy_profile.default_path_rules.clone();

        WorkspacePolicy::new(
            format!(
                "resolved-{}-{}",
                self.workspace.id, self.policy_profile.id
            ),
            &self.workspace.id,
            scope,
            read_boundary,
            write_boundary,
            path_rules,
        )
    }

    fn build_read_boundary(&self) -> ReadBoundary {
        let mut boundary = self.policy_profile.default_read_boundary.clone();
        
        // Apply workspace root path
        if let Some(ref local_path) = self.workspace.storage_config.local_path {
            boundary.allowed_paths = vec![std::path::PathBuf::from(local_path)];
        }
        
        boundary
    }

    fn build_write_boundary(&self) -> WriteBoundary {
        let workspace_root = self
            .workspace
            .storage_config
            .local_path
            .as_ref()
            .map(|p| std::path::PathBuf::from(p))
            .unwrap_or_else(|| std::path::PathBuf::from("."));
        
        let output_root = workspace_root.join("output");
        
        match self.policy_profile.default_write_mode {
            WriteMode::OutputOnly => WriteBoundary::output_only(output_root),
            WriteMode::OutputPlusApproved => WriteBoundary {
                mode: WriteMode::OutputPlusApproved,
                output_root,
                approved_paths: self.policy_profile.default_write_boundary.approved_paths.clone(),
                allow_overwrite: self.policy_profile.default_write_boundary.allow_overwrite,
                require_backup: self.policy_profile.default_write_boundary.require_backup,
                max_file_size_bytes: self.policy_profile.default_write_boundary.max_file_size_bytes,
            },
            WriteMode::Workspace => self.policy_profile.default_write_boundary.clone(),
        }
    }
}
```

Create `crates/decacan-runtime/src/workspace/policy/mod.rs`:

```rust
pub mod boundary;
pub mod resolver;
pub mod validator;

pub use boundary::*;
pub use resolver::*;
```

- [ ] **Step 4: Re-run focused tests**

Run: `cargo test -p decacan-runtime --test workspace_policy -- --nocapture`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/workspace/policy/
git commit -m "feat: implement policy resolver and path validation"
```

---

## Task 6: Integrate Workspace Policy with Tool Gateway

**Files:**
- Modify: `crates/decacan-runtime/src/gateway/tool_gateway.rs`
- Modify: `crates/decacan-runtime/tests/gateway_policy.rs`

- [ ] **Step 1: Write failing integration tests**

Modify `crates/decacan-runtime/tests/gateway_policy.rs`:

```rust
use decacan_runtime::workspace::{
    entity::{
        PathRules, PolicyProfile, ReadBoundary, WriteBoundary, WriteMode,
        Workspace, WorkspacePolicy, WorkspaceScope, WorkspaceVisibility, WorkspaceSettings, StorageConfig,
    },
    policy::{BoundInputs, WorkspacePolicyResolver},
};

#[test]
fn gateway_uses_workspace_policy_for_boundary_check() {
    let workspace = Workspace::new_for_test("ws-1", "tenant-1", "test-ws", "Test");
    let profile = PolicyProfile::new_for_test("policy-1", "ws-1");
    let inputs = BoundInputs::default();
    
    let resolver = WorkspacePolicyResolver::new(&workspace, &profile, &inputs);
    let workspace_policy = resolver.resolve();
    
    let gateway = ToolGateway::new_with_workspace_policy(
        PolicyProfile::new_for_test("policy-1", "ws-1"),
        "/workspace/output",
        workspace_policy,
    );
    
    // Test write within output boundary
    let allowed_request = ToolRequest::new(
        ToolDescriptor::new("artifact.write", "write"),
        "write"
    ).with_target_path("/workspace/output/result.md");
    
    let (decision, _) = gateway.evaluate(allowed_request, time::OffsetDateTime::UNIX_EPOCH);
    assert!(matches!(decision, PolicyDecision::Allow { .. }));
    
    // Test write outside boundary
    let blocked_request = ToolRequest::new(
        ToolDescriptor::new("artifact.write", "write"),
        "write"
    ).with_target_path("/workspace/secrets.txt");
    
    let (decision, _) = gateway.evaluate(blocked_request, time::OffsetDateTime::UNIX_EPOCH);
    assert!(matches!(decision, PolicyDecision::Deny { .. }));
}

#[test]
fn gateway_blocks_path_traversal_via_workspace_policy() {
    let workspace = Workspace::new_for_test("ws-1", "tenant-1", "test-ws", "Test");
    let profile = PolicyProfile::new_for_test("policy-1", "ws-1");
    let inputs = BoundInputs::default();
    
    let resolver = WorkspacePolicyResolver::new(&workspace, &profile, &inputs);
    let workspace_policy = resolver.resolve();
    
    let gateway = ToolGateway::new_with_workspace_policy(
        PolicyProfile::new_for_test("policy-1", "ws-1"),
        "/workspace/output",
        workspace_policy,
    );
    
    // Path traversal attempt
    let traversal_request = ToolRequest::new(
        ToolDescriptor::new("artifact.write", "write"),
        "write"
    ).with_target_path("/workspace/output/../etc/passwd");
    
    let (decision, _) = gateway.evaluate(traversal_request, time::OffsetDateTime::UNIX_EPOCH);
    assert!(matches!(decision, PolicyDecision::Deny { .. }));
}
```

- [ ] **Step 2: Run focused tests to confirm failure**

Run: `cargo test -p decacan-runtime --test gateway_policy workspace -- --nocapture`
Expected: FAIL because ToolGateway doesn't have workspace_policy support yet.

- [ ] **Step 3: Integrate workspace policy into ToolGateway**

Modify `crates/decacan-runtime/src/gateway/tool_gateway.rs`:

```rust
use std::path::{Path, PathBuf};
use time::OffsetDateTime;

use crate::gateway::execution_record::ToolExecutionRecord;
use crate::gateway::request::ToolRequest;
use crate::gateway::result::PolicyDecision;
use crate::policy::entity::PolicyProfile;
use crate::workspace::{
    entity::WorkspacePolicy,
    policy::PathValidator,
};

#[derive(Debug, Clone)]
pub struct ToolGateway {
    policy: PolicyProfile,
    workspace_policy: Option<WorkspacePolicy>,
    output_root: PathBuf,
    workspace_root: PathBuf,
    path_validator: PathValidator,
}

impl ToolGateway {
    pub fn new(policy: PolicyProfile, output_root: impl Into<PathBuf>) -> Self {
        Self {
            policy,
            workspace_policy: None,
            output_root: output_root.into(),
            workspace_root: PathBuf::from("."),
            path_validator: PathValidator::default(),
        }
    }

    pub fn new_with_workspace_policy(
        policy: PolicyProfile,
        output_root: impl Into<PathBuf>,
        workspace_policy: WorkspacePolicy,
    ) -> Self {
        let workspace_root = workspace_policy
            .read_boundary
            .allowed_paths
            .first()
            .cloned()
            .unwrap_or_else(|| PathBuf::from("."));
        
        Self {
            policy,
            workspace_policy: Some(workspace_policy),
            output_root: output_root.into(),
            workspace_root,
            path_validator: PathValidator::default(),
        }
    }

    pub fn evaluate(
        &self,
        request: ToolRequest,
        evaluated_at: OffsetDateTime,
    ) -> (PolicyDecision, ToolExecutionRecord) {
        let decision = self.evaluate_policy(&request);
        let record = ToolExecutionRecord {
            request,
            decision: decision.clone(),
            evaluated_at,
        };
        (decision, record)
    }

    fn evaluate_policy(&self, request: &ToolRequest) -> PolicyDecision {
        // Check workspace policy first
        if let Some(ref workspace_policy) = self.workspace_policy {
            // Check path traversal
            if workspace_policy.path_rules.prevent_escape {
                if let Some(ref target) = request.target_path {
                    if target.contains("..") {
                        return self.deny("Path traversal attempt blocked by workspace policy");
                    }
                }
            }
            
            // Check write boundary for write operations
            if self.is_write_operation(&request) {
                if let Some(ref target) = request.target_path {
                    let target_path = Path::new(target);
                    if !workspace_policy.write_boundary.allows_write_to(target_path.to_path_buf()) {
                        return self.deny("Write target outside workspace boundaries");
                    }
                }
            }
            
            // Check read boundary for read operations
            if self.is_read_operation(&request) {
                if let Some(ref target) = request.target_path {
                    let target_path = Path::new(target);
                    if !self.path_validator.is_within_boundary(target_path, &self.workspace_root) {
                        return self.deny("Read target outside workspace boundaries");
                    }
                }
            }
        }
        
        // Check overwrite approval
        if self.requires_overwrite_approval(request) {
            return self.approval_required("overwrite outside output root requires approval");
        }

        // Check tool-level policy
        if self.policy.denied_tools.contains(&request.descriptor.name) {
            return self.deny(format!("tool '{}' is denied by policy", request.descriptor.name));
        }

        if self.policy.approval_required_tools.contains(&request.descriptor.name) {
            return self.approval_required(format!(
                "tool '{}' requires approval by policy",
                request.descriptor.name
            ));
        }

        if self.policy.allowed_tools.contains(&request.descriptor.name) {
            return self.allow(format!("tool '{}' allowed by policy", request.descriptor.name));
        }

        self.deny(format!(
            "tool '{}' is not listed in policy",
            request.descriptor.name
        ))
    }

    fn is_write_operation(&self, request: &ToolRequest) -> bool {
        request.descriptor.name.contains("write")
            || request.descriptor.name.contains("create")
            || request.action == "write"
            || request.action == "create"
    }

    fn is_read_operation(&self, request: &ToolRequest) -> bool {
        request.descriptor.name.contains("read")
            || request.descriptor.name.contains("scan")
            || request.action == "read"
    }

    fn requires_overwrite_approval(&self, request: &ToolRequest) -> bool {
        request.overwrite_existing
            && request
                .target_path
                .as_deref()
                .map(|path| !path_within_output_root(Path::new(path), &self.output_root))
                .unwrap_or(false)
    }

    pub fn allow(&self, reason: impl Into<String>) -> PolicyDecision {
        PolicyDecision::Allow {
            reason: reason.into(),
        }
    }

    pub fn approval_required(&self, reason: impl Into<String>) -> PolicyDecision {
        PolicyDecision::ApprovalRequired {
            reason: reason.into(),
        }
    }

    pub fn deny(&self, reason: impl Into<String>) -> PolicyDecision {
        PolicyDecision::Deny {
            reason: reason.into(),
        }
    }
}

fn path_within_output_root(path: &Path, root: &Path) -> bool {
    let validator = PathValidator::default();
    validator.is_within_boundary(path, root)
}
```

- [ ] **Step 4: Re-run focused tests**

Run: `cargo test -p decacan-runtime --test gateway_policy -- --nocapture`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/gateway/tool_gateway.rs
git add crates/decacan-runtime/tests/gateway_policy.rs
git commit -m "feat: integrate workspace policy with tool gateway"
```

---

## Task 7: Create Storage Abstraction Layer

**Files:**
- Create: `crates/decacan-runtime/src/workspace/storage/mod.rs`
- Create: `crates/decacan-runtime/src/workspace/storage/provider.rs`
- Create: `crates/decacan-runtime/src/workspace/storage/local.rs`
- Test: `crates/decacan-runtime/tests/workspace_storage.rs`

- [ ] **Step 1: Write failing storage tests**

Create `crates/decacan-runtime/tests/workspace_storage.rs`:

```rust
use decacan_runtime::workspace::storage::{
    local::LocalStorageProvider, StorageProvider, StorageError,
};
use std::path::Path;

#[test]
fn local_storage_can_write_and_read_file() {
    let temp_dir = tempfile::tempdir().unwrap();
    let provider = LocalStorageProvider::new(temp_dir.path());
    
    let content = b"Hello, World!";
    provider.write_file("test.txt", content).unwrap();
    
    let read_content = provider.read_file("test.txt").unwrap();
    assert_eq!(read_content, content);
}

#[test]
fn local_storage_prevents_escape_from_root() {
    let temp_dir = tempfile::tempdir().unwrap();
    let provider = LocalStorageProvider::new(temp_dir.path());
    
    // Should fail for paths outside root
    let result = provider.write_file("../escape.txt", b"escaped");
    assert!(matches!(result, Err(StorageError::PathNotAllowed)));
}

#[test]
fn local_storage_lists_directory() {
    let temp_dir = tempfile::tempdir().unwrap();
    let provider = LocalStorageProvider::new(temp_dir.path());
    
    provider.write_file("file1.txt", b"content1").unwrap();
    provider.write_file("file2.txt", b"content2").unwrap();
    
    let entries = provider.list_directory(".").unwrap();
    assert_eq!(entries.len(), 2);
}

#[test]
fn local_storage_deletes_file() {
    let temp_dir = tempfile::tempdir().unwrap();
    let provider = LocalStorageProvider::new(temp_dir.path());
    
    provider.write_file("delete_me.txt", b"content").unwrap();
    assert!(provider.exists("delete_me.txt"));
    
    provider.delete_file("delete_me.txt").unwrap();
    assert!(!provider.exists("delete_me.txt"));
}
```

- [ ] **Step 2: Run focused tests to confirm failure**

Run: `cargo test -p decacan-runtime --test workspace_storage -- --nocapture`
Expected: FAIL because storage layer is not implemented.

- [ ] **Step 3: Implement storage abstraction**

Create `crates/decacan-runtime/src/workspace/storage/provider.rs`:

```rust
use std::path::Path;
use thiserror::Error;

#[derive(Debug, Error)]
pub enum StorageError {
    #[error("Path not allowed: {0}")]
    PathNotAllowed(String),
    
    #[error("File not found: {0}")]
    NotFound(String),
    
    #[error("IO error: {0}")]
    Io(#[from] std::io::Error),
    
    #[error("Permission denied: {0}")]
    PermissionDenied(String),
}

pub type Result<T> = std::result::Result<T, StorageError>;

#[derive(Debug, Clone)]
pub struct DirectoryEntry {
    pub name: String,
    pub is_file: bool,
    pub is_directory: bool,
    pub size: u64,
}

pub trait StorageProvider: Send + Sync {
    fn read_file(&self, path: &str) -> Result<Vec<u8>>;
    fn write_file(&self, path: &str, content: &[u8]) -> Result<()>;
    fn delete_file(&self, path: &str) -> Result<()>;
    fn exists(&self, path: &str) -> bool;
    fn list_directory(&self, path: &str) -> Result<Vec<DirectoryEntry>>;
    fn create_directory(&self, path: &str) -> Result<()>;
    fn get_absolute_path(&self, relative_path: &str) -> Result<std::path::PathBuf>;
}
```

Create `crates/decacan-runtime/src/workspace/storage/local.rs`:

```rust
use std::fs;
use std::path::{Path, PathBuf};

use super::provider::{DirectoryEntry, Result, StorageError, StorageProvider};

#[derive(Debug, Clone)]
pub struct LocalStorageProvider {
    root: PathBuf,
}

impl LocalStorageProvider {
    pub fn new(root: impl Into<PathBuf>) -> Self {
        Self { root: root.into() }
    }

    fn resolve_path(&self, relative_path: &str) -> Result<PathBuf> {
        let relative = Path::new(relative_path);
        
        // Security: Prevent path traversal
        if relative.components().any(|c| matches!(c, std::path::Component::ParentDir)) {
            return Err(StorageError::PathNotAllowed(relative_path.to_string()));
        }
        
        let absolute = self.root.join(relative);
        
        // Double-check the resolved path is within root
        if !absolute.starts_with(&self.root) {
            return Err(StorageError::PathNotAllowed(relative_path.to_string()));
        }
        
        Ok(absolute)
    }
}

impl StorageProvider for LocalStorageProvider {
    fn read_file(&self, path: &str) -> Result<Vec<u8>> {
        let absolute = self.resolve_path(path)?;
        
        if !absolute.exists() {
            return Err(StorageError::NotFound(path.to_string()));
        }
        
        fs::read(&absolute).map_err(Into::into)
    }

    fn write_file(&self, path: &str, content: &[u8]) -> Result<()> {
        let absolute = self.resolve_path(path)?;
        
        // Ensure parent directory exists
        if let Some(parent) = absolute.parent() {
            fs::create_dir_all(parent)?;
        }
        
        fs::write(&absolute, content).map_err(Into::into)
    }

    fn delete_file(&self, path: &str) -> Result<()> {
        let absolute = self.resolve_path(path)?;
        
        if !absolute.exists() {
            return Err(StorageError::NotFound(path.to_string()));
        }
        
        fs::remove_file(&absolute).map_err(Into::into)
    }

    fn exists(&self, path: &str) -> bool {
        self.resolve_path(path)
            .map(|p| p.exists())
            .unwrap_or(false)
    }

    fn list_directory(&self, path: &str) -> Result<Vec<DirectoryEntry>> {
        let absolute = self.resolve_path(path)?;
        
        if !absolute.is_dir() {
            return Err(StorageError::NotFound(path.to_string()));
        }
        
        let mut entries = Vec::new();
        
        for entry in fs::read_dir(&absolute)? {
            let entry = entry?;
            let metadata = entry.metadata()?;
            
            entries.push(DirectoryEntry {
                name: entry.file_name().to_string_lossy().to_string(),
                is_file: metadata.is_file(),
                is_directory: metadata.is_dir(),
                size: metadata.len(),
            });
        }
        
        Ok(entries)
    }

    fn create_directory(&self, path: &str) -> Result<()> {
        let absolute = self.resolve_path(path)?;
        fs::create_dir_all(&absolute).map_err(Into::into)
    }

    fn get_absolute_path(&self, relative_path: &str) -> Result<PathBuf> {
        self.resolve_path(relative_path)
    }
}
```

Create `crates/decacan-runtime/src/workspace/storage/mod.rs`:

```rust
pub mod local;
pub mod provider;

pub use local::*;
pub use provider::*;
```

- [ ] **Step 4: Re-run focused tests**

Run: `cargo test -p decacan-runtime --test workspace_storage -- --nocapture`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/workspace/storage/
git add crates/decacan-runtime/tests/workspace_storage.rs
git commit -m "feat: implement storage abstraction layer with local provider"
```

---

## Task 8: Create Workspace Service Layer

**Files:**
- Create: `crates/decacan-runtime/src/workspace/service/mod.rs`
- Create: `crates/decacan-runtime/src/workspace/service/workspace_service.rs`
- Create: `crates/decacan-runtime/src/workspace/service/member_service.rs`
- Test: `crates/decacan-runtime/tests/workspace_service.rs`

- [ ] **Step 1: Write failing service tests**

Create `crates/decacan-runtime/tests/workspace_service.rs`:

```rust
use decacan_runtime::workspace::{
    entity::{WorkspaceSettings, WorkspaceStatus, WorkspaceVisibility, StorageConfig},
    service::WorkspaceService,
};

#[test]
fn service_creates_workspace() {
    let service = WorkspaceService::new();
    
    let result = service.create_workspace(
        "tenant-1",
        "user-1",
        "my-workspace",
        "My Workspace",
        None,
        StorageConfig::local("/data/workspace"),
        WorkspaceVisibility::Private,
        WorkspaceSettings::default(),
    );
    
    assert!(result.is_ok());
    let workspace = result.unwrap();
    assert_eq!(workspace.slug, "my-workspace");
    assert_eq!(workspace.tenant_id, "tenant-1");
    assert!(matches!(workspace.status, WorkspaceStatus::Draft));
}

#[test]
fn service_enforces_unique_slug_per_tenant() {
    let service = WorkspaceService::new();
    
    service.create_workspace(
        "tenant-1",
        "user-1",
        "unique-ws",
        "Unique",
        None,
        StorageConfig::local("/data/ws1"),
        WorkspaceVisibility::Private,
        WorkspaceSettings::default(),
    ).unwrap();
    
    // Same slug, same tenant should fail
    let result = service.create_workspace(
        "tenant-1",
        "user-1",
        "unique-ws",
        "Unique 2",
        None,
        StorageConfig::local("/data/ws2"),
        WorkspaceVisibility::Private,
        WorkspaceSettings::default(),
    );
    
    assert!(result.is_err());
    
    // Same slug, different tenant should succeed
    let result = service.create_workspace(
        "tenant-2",
        "user-1",
        "unique-ws",
        "Unique",
        None,
        StorageConfig::local("/data/ws3"),
        WorkspaceVisibility::Private,
        WorkspaceSettings::default(),
    );
    
    assert!(result.is_ok());
}

#[test]
fn service_archives_workspace() {
    let service = WorkspaceService::new();
    
    let workspace = service.create_workspace(
        "tenant-1",
        "user-1",
        "archive-test",
        "Archive Test",
        None,
        StorageConfig::local("/data/ws"),
        WorkspaceVisibility::Private,
        WorkspaceSettings::default(),
    ).unwrap();
    
    // Activate first
    let workspace = service.activate_workspace(&workspace.id).unwrap();
    assert!(matches!(workspace.status, WorkspaceStatus::Active));
    
    // Then archive
    let workspace = service.archive_workspace(&workspace.id).unwrap();
    assert!(matches!(workspace.status, WorkspaceStatus::Archived));
    assert!(workspace.archived_at.is_some());
}
```

- [ ] **Step 2: Run focused tests to confirm failure**

Run: `cargo test -p decacan-runtime --test workspace_service -- --nocapture`
Expected: FAIL.

- [ ] **Step 3: Implement workspace service**

Create `crates/decacan-runtime/src/workspace/service/workspace_service.rs`:

```rust
use std::collections::HashMap;
use std::sync::{Arc, Mutex};

use crate::workspace::entity::{
    StorageConfig, Workspace, WorkspaceSettings, WorkspaceStatus, WorkspaceVisibility,
};

#[derive(Debug, thiserror::Error)]
pub enum WorkspaceServiceError {
    #[error("Workspace not found: {0}")]
    NotFound(String),
    
    #[error("Workspace already exists: {0}")]
    AlreadyExists(String),
    
    #[error("Invalid state transition: {from} -> {to}")]
    InvalidStateTransition { from: String, to: String },
    
    #[error("Storage error: {0}")]
    StorageError(String),
}

pub type Result<T> = std::result::Result<T, WorkspaceServiceError>;

#[derive(Clone)]
pub struct WorkspaceService {
    workspaces: Arc<Mutex<HashMap<String, Workspace>>>,
}

impl WorkspaceService {
    pub fn new() -> Self {
        Self {
            workspaces: Arc::new(Mutex::new(HashMap::new())),
        }
    }

    pub fn create_workspace(
        &self,
        tenant_id: impl Into<String>,
        created_by: impl Into<String>,
        slug: impl Into<String>,
        name: impl Into<String>,
        description: Option<String>,
        storage_config: StorageConfig,
        visibility: WorkspaceVisibility,
        settings: WorkspaceSettings,
    ) -> Result<Workspace> {
        let tenant_id = tenant_id.into();
        let slug = slug.into();
        let workspaces = self.workspaces.lock().unwrap();
        
        // Check for duplicate slug within tenant
        let exists = workspaces.values().any(|ws| {
            ws.tenant_id == tenant_id && ws.slug == slug
        });
        
        if exists {
            return Err(WorkspaceServiceError::AlreadyExists(slug));
        }
        
        drop(workspaces); // Release lock before creating
        
        let workspace = Workspace::new(
            format!("ws-{}", uuid::Uuid::new_v4()),
            tenant_id,
            slug,
            name,
            description,
            None,
            storage_config,
            WorkspaceStatus::Draft,
            visibility,
            settings,
            created_by,
        );
        
        let mut workspaces = self.workspaces.lock().unwrap();
        workspaces.insert(workspace.id.clone(), workspace.clone());
        
        Ok(workspace)
    }

    pub fn get_workspace(&self, id: &str) -> Result<Workspace> {
        let workspaces = self.workspaces.lock().unwrap();
        workspaces
            .get(id)
            .cloned()
            .ok_or_else(|| WorkspaceServiceError::NotFound(id.to_string()))
    }

    pub fn list_workspaces(&self, tenant_id: &str) -> Vec<Workspace> {
        let workspaces = self.workspaces.lock().unwrap();
        workspaces
            .values()
            .filter(|ws| ws.tenant_id == tenant_id)
            .filter(|ws| !matches!(ws.status, WorkspaceStatus::Deleted))
            .cloned()
            .collect()
    }

    pub fn activate_workspace(&self, id: &str) -> Result<Workspace> {
        let mut workspaces = self.workspaces.lock().unwrap();
        let workspace = workspaces
            .get_mut(id)
            .ok_or_else(|| WorkspaceServiceError::NotFound(id.to_string()))?;
        
        if !workspace.status.can_transition_to(WorkspaceStatus::Active) {
            return Err(WorkspaceServiceError::InvalidStateTransition {
                from: format!("{:?}", workspace.status),
                to: "Active".to_string(),
            });
        }
        
        workspace.status = WorkspaceStatus::Active;
        Ok(workspace.clone())
    }

    pub fn archive_workspace(&self, id: &str) -> Result<Workspace> {
        let mut workspaces = self.workspaces.lock().unwrap();
        let workspace = workspaces
            .get_mut(id)
            .ok_or_else(|| WorkspaceServiceError::NotFound(id.to_string()))?;
        
        workspace.archive();
        Ok(workspace.clone())
    }

    pub fn restore_workspace(&self, id: &str) -> Result<Workspace> {
        let mut workspaces = self.workspaces.lock().unwrap();
        let workspace = workspaces
            .get_mut(id)
            .ok_or_else(|| WorkspaceServiceError::NotFound(id.to_string()))?;
        
        workspace.restore();
        Ok(workspace.clone())
    }

    pub fn delete_workspace(&self, id: &str) -> Result<()> {
        let mut workspaces = self.workspaces.lock().unwrap();
        let workspace = workspaces
            .get(id)
            .ok_or_else(|| WorkspaceServiceError::NotFound(id.to_string()))?;
        
        if !workspace.status.can_transition_to(WorkspaceStatus::Deleted) {
            return Err(WorkspaceServiceError::InvalidStateTransition {
                from: format!("{:?}", workspace.status),
                to: "Deleted".to_string(),
            });
        }
        
        // Soft delete by removing from active workspaces
        workspaces.remove(id);
        Ok(())
    }
}

impl Default for WorkspaceService {
    fn default() -> Self {
        Self::new()
    }
}
```

Create `crates/decacan-runtime/src/workspace/service/mod.rs`:

```rust
pub mod member_service;
pub mod workspace_service;

pub use workspace_service::*;
```

- [ ] **Step 4: Re-run focused tests**

Run: `cargo test -p decacan-runtime --test workspace_service -- --nocapture`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add crates/decacan-runtime/src/workspace/service/
git add crates/decacan-runtime/tests/workspace_service.rs
git commit -m "feat: implement workspace service layer with CRUD operations"
```

---

## Task 9: Final Integration and Verification

**Files:**
- Modify: `crates/decacan-runtime/src/workspace/mod.rs` - Ensure all exports
- Modify: `crates/decacan-runtime/src/lib.rs` - Export workspace module
- Test: Full test suite

- [ ] **Step 1: Run full test suite**

Run: `cargo test --workspace -- --nocapture`
Expected: ALL PASS.

- [ ] **Step 2: Run linting and type checking**

Run: `cargo check --workspace`
Run: `cargo clippy --workspace`
Expected: No errors or warnings.

- [ ] **Step 3: Create integration test for complete workflow**

Create `crates/decacan-runtime/tests/workspace_integration.rs`:

```rust
use decacan_runtime::workspace::{
    entity::{
        PolicyProfile, StorageConfig, Workspace, WorkspaceSettings, WorkspaceStatus,
        WorkspaceVisibility,
    },
    policy::{BoundInputs, WorkspacePolicyResolver},
    rbac::{ActionType, Permission, ResourceType, WorkspaceRole},
    service::WorkspaceService,
    storage::local::LocalStorageProvider,
};

#[test]
fn complete_workspace_lifecycle() {
    // 1. Create workspace
    let service = WorkspaceService::new();
    let workspace = service
        .create_workspace(
            "tenant-1",
            "user-1",
            "test-lifecycle",
            "Test Lifecycle",
            Some("Integration test workspace".to_string()),
            StorageConfig::local("/tmp/test-ws"),
            WorkspaceVisibility::Private,
            WorkspaceSettings::default(),
        )
        .unwrap();
    
    assert!(matches!(workspace.status, WorkspaceStatus::Draft));
    
    // 2. Activate workspace
    let workspace = service.activate_workspace(&workspace.id).unwrap();
    assert!(matches!(workspace.status, WorkspaceStatus::Active));
    
    // 3. Create policy profile
    let profile = PolicyProfile::new(
        "policy-1",
        &workspace.id,
        "Default Policy",
        vec!["workspace.read".to_string()],
        vec!["shell.exec".to_string()],
        vec!["network.egress".to_string()],
    );
    
    // 4. Resolve workspace policy
    let inputs = BoundInputs::default();
    let resolver = WorkspacePolicyResolver::new(&workspace, &profile, &inputs);
    let policy = resolver.resolve();
    
    assert!(policy.id.starts_with("resolved-"));
    assert!(policy.write_boundary.is_restricted_to_output());
    
    // 5. Verify storage provider
    let storage = LocalStorageProvider::new("/tmp/test-ws");
    storage.create_directory("test-dir").unwrap();
    storage.write_file("test-dir/file.txt", b"test content").unwrap();
    
    let content = storage.read_file("test-dir/file.txt").unwrap();
    assert_eq!(content, b"test content");
    
    // 6. Verify RBAC
    let membership = decacan_runtime::workspace::entity::WorkspaceMembership::new(
        "member-1",
        &workspace.id,
        "user-2",
        WorkspaceRole::Editor,
        Some("user-1".to_string()),
    );
    
    let read_playbook = Permission::new(ResourceType::Playbook, ActionType::Read);
    let delete_workspace = Permission::new(ResourceType::Workspace, ActionType::Delete);
    
    assert!(membership.has_permission(&read_playbook));
    assert!(!membership.has_permission(&delete_workspace));
    
    // 7. Archive workspace
    let workspace = service.archive_workspace(&workspace.id).unwrap();
    assert!(matches!(workspace.status, WorkspaceStatus::Archived));
}
```

Run: `cargo test -p decacan-runtime --test workspace_integration -- --nocapture`
Expected: PASS.

- [ ] **Step 4: Commit final changes**

```bash
git add crates/decacan-runtime/
git commit -m "test: add complete workspace module integration tests"
```

---

## Summary

This plan implements the complete workspace module including:

1. **Core Entities**: Workspace, User, Membership, PolicyProfile, WorkspacePolicy
2. **RBAC System**: WorkspaceRole, Permission, permission checking
3. **Policy System**: WorkspacePolicyResolver, PathValidator, boundary enforcement
4. **Storage Layer**: StorageProvider trait, LocalStorageProvider
5. **Service Layer**: WorkspaceService with CRUD operations
6. **Integration**: Tool Gateway workspace policy enforcement

### Files Created/Modified:

**New Files:**
- `crates/decacan-runtime/src/workspace/entity/*.rs`
- `crates/decacan-runtime/src/workspace/rbac/*.rs`
- `crates/decacan-runtime/src/workspace/policy/*.rs`
- `crates/decacan-runtime/src/workspace/storage/*.rs`
- `crates/decacan-runtime/src/workspace/service/*.rs`
- Test files: `workspace_entity.rs`, `workspace_rbac.rs`, `workspace_policy.rs`, `workspace_storage.rs`, `workspace_service.rs`, `workspace_integration.rs`

**Modified Files:**
- `crates/decacan-runtime/src/workspace/mod.rs`
- `crates/decacan-runtime/src/gateway/tool_gateway.rs`

---

## Execution Handoff

**Plan complete and saved to `.opencode/plans/2026-03-30-decacan-workspace-module-implementation.md`. Two execution options:**

**1. Subagent-Driven (recommended)** - I dispatch a fresh subagent per task, review between tasks, fast iteration

**2. Inline Execution** - Execute tasks in this session using executing-plans, batch execution with checkpoints

**Which approach?**
