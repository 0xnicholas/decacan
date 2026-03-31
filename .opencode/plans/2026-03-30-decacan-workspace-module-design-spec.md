# Decacan Workspace Module Design Spec

**Date:** 2026-03-30  
**Status:** Draft  
**Scope:** Complete workspace module with RBAC, multi-tenancy, and workspace policy

---

## 1. Overview

### 1.1 Goals

Design a complete workspace module for Decacan that:
- Provides Notion-like workspace organization
- Implements full RBAC (Role-Based Access Control)
- Supports multi-tenancy
- Enforces task-level directory boundaries via Workspace Policy
- Supports both local filesystem and cloud storage

### 1.2 Design Principles

1. **Workspace Isolation**: Each workspace is an independent container for playbooks, tasks, and artifacts
2. **Playbook Independence**: Playbooks belong to specific workspaces (no cross-workbook sharing by default)
3. **Hierarchical Access Control**: Tenant → Organization → Workspace → Resource
4. **Policy-Driven Boundaries**: Directory access controlled by resolved Workspace Policy
5. **Storage Abstraction**: Unified interface for local and cloud storage

---

## 2. Architecture

### 2.1 High-Level Structure

```
Tenant (多租户隔离)
└── Organization (可选，团队/公司级别)
    └── Workspace (核心容器)
        ├── Members (RBAC权限管理)
        ├── Playbooks (独立集合)
        ├── Tasks (任务执行)
        ├── Artifacts (产物)
        ├── Policy Profiles (策略配置)
        └── Storage (存储配置)
```

### 2.2 Module Dependencies

```
workspace/
├── entity/           # Core domain entities
├── rbac/            # Role-based access control
├── policy/          # Workspace policy resolution
├── storage/         # Storage abstraction layer
├── repository/      # Data persistence
├── service/         # Business logic
└── api/             # HTTP endpoints
```

---

## 3. Core Entities

### 3.1 Workspace

```rust
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Workspace {
    /// Unique identifier
    pub id: String,
    
    /// Multi-tenancy isolation
    pub tenant_id: String,
    
    /// URL-friendly identifier
    pub slug: String,
    
    /// Display name
    pub name: String,
    
    /// Optional description
    pub description: Option<String>,
    
    /// Icon URL for UI
    pub icon_url: Option<String>,
    
    /// Storage configuration
    pub storage_config: StorageConfig,
    
    /// Lifecycle status
    pub status: WorkspaceStatus,
    
    /// Visibility level
    pub visibility: WorkspaceVisibility,
    
    /// Workspace settings and limits
    pub settings: WorkspaceSettings,
    
    /// Audit fields
    pub created_by: String,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
    pub archived_at: Option<OffsetDateTime>,
    pub version_id: Uuid,
}
```

#### 3.1.1 WorkspaceStatus

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkspaceStatus {
    /// Initializing, not ready for use
    Draft,
    
    /// Fully operational
    Active,
    
    /// Read-only, preserved for reference
    Archived,
    
    /// Soft-deleted, pending cleanup
    Deleted,
}
```

#### 3.1.2 WorkspaceVisibility

```rust
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkspaceVisibility {
    /// Only members can access
    Private,
    
    /// Visible to organization members
    Organization,
    
    /// Public read-only access
    Public,
}
```

#### 3.1.3 Storage Configuration

```rust
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
    pub credentials_id: String,  // Reference to secure credential store
}
```

#### 3.1.4 Workspace Settings

```rust
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkspaceSettings {
    /// Maximum number of members
    pub max_members: u32,
    
    /// Storage quota in MB
    pub storage_quota_mb: u64,
    
    /// Daily task execution limit
    pub max_tasks_per_day: u32,
    
    /// Artifact retention period
    pub retention_days: u32,
    
    /// Feature flags
    pub features: WorkspaceFeatures,
}

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkspaceFeatures {
    pub enable_team_execution: bool,
    pub enable_custom_extensions: bool,
    pub enable_api_access: bool,
    pub enable_audit_logs: bool,
}
```

### 3.2 User and Membership

#### 3.2.1 User Entity

```rust
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
```

#### 3.2.2 Workspace Membership

```rust
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

#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
#[serde(rename_all = "snake_case")]
pub enum WorkspaceRole {
    /// Full control, can delete workspace
    Owner,
    
    /// Manage members and settings, cannot delete
    Admin,
    
    /// Create/edit playbooks, execute tasks
    Editor,
    
    /// Read-only access
    Viewer,
    
    /// Limited temporary access
    Guest,
}
```

#### 3.2.3 Role Permissions

| Role | Playbook | Task | Artifact | Member | Settings | Delete Workspace |
|------|----------|------|----------|--------|----------|------------------|
| Owner | CRUD | Execute | CRUD | CRUD | CRUD | Yes |
| Admin | CRUD | Execute | CRUD | CRU | CRU | No |
| Editor | CRU | Execute | CRU | - | R | No |
| Viewer | R | - | R | - | R | No |
| Guest | Limited R | Limited | Limited R | - | - | No |

---

## 4. Workspace Policy System

### 4.1 Core Concept

Workspace Policy is a **task-level resolved policy instance** that defines directory boundaries for task execution. It combines:
- Workspace physical boundaries
- PolicyProfile defaults
- Bound inputs from task creation

### 4.2 Workspace Policy Entity

```rust
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct WorkspacePolicy {
    pub id: String,
    pub workspace_id: String,
    pub task_id: Option<String>,  // Snapshot for specific task
    
    pub scope: WorkspaceScope,
    pub read_boundary: ReadBoundary,
    pub write_boundary: WriteBoundary,
    pub path_rules: PathRules,
    
    pub created_at: OffsetDateTime,
    pub resolved_from: PolicySource,
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

#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PolicySource {
    pub workspace_snapshot: WorkspaceSnapshot,
    pub policy_profile_snapshot: PolicyProfileSnapshot,
    pub bound_inputs: BoundInputs,
    pub resolved_at: OffsetDateTime,
}
```

### 4.3 Policy Profile

```rust
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct PolicyProfile {
    pub id: String,
    pub workspace_id: String,
    pub name: String,
    
    // Tool permissions
    pub allowed_tools: Vec<String>,
    pub approval_required_tools: Vec<String>,
    pub denied_tools: Vec<String>,
    
    // Workspace policy defaults
    pub default_scope: WorkspaceScope,
    pub default_write_mode: WriteMode,
    pub default_read_boundary: ReadBoundary,
    pub default_write_boundary: WriteBoundary,
    pub default_path_rules: PathRules,
    
    // Inheritance
    pub parent_profile_id: Option<String>,
    pub is_system: bool,
    
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
}
```

### 4.4 Policy Resolution Flow

```
Workspace
    + PolicyProfile (defaults)
    + BoundInputs (task-specific)
    + RequestingUser (permission check)
    → WorkspacePolicyResolver::resolve()
    → Resolved WorkspacePolicy Instance
    → Tool Gateway Enforcement
```

---

## 5. Directory Structure

### 5.1 Physical Layout

```
/{storage_root}/
├── tenants/
│   └── {tenant_id}/
│       └── workspaces/
│           └── {workspace_slug}/
│               ├── .decacan/              # System metadata
│               │   ├── config.toml
│               │   ├── policies/
│               │   └── logs/
│               │
│               ├── playbooks/             # Playbook definitions
│               │   └── {playbook_handle_id}/
│               │       ├── draft.yaml
│               │       └── versions/
│               │
│               ├── tasks/                 # Task workspaces
│               │   └── {task_id}/
│               │       ├── input/
│               │       ├── output/
│               │       ├── workspace/     # Runtime workspace
│               │       └── logs/
│               │
│               ├── artifacts/             # Long-term storage
│               │   └── {date}/{artifact_id}/
│               │
│               └── shared/                # Shared resources
│                   ├── templates/
│                   └── assets/
```

### 5.2 Configuration File

```toml
# .decacan/config.toml
[workspace]
id = "uuid"
name = "My Workspace"
slug = "my-workspace"
version = 1

[workspace.policy]
default_profile = "default"

[workspace.storage]
provider = "local"
path = "/data/workspaces/my-workspace"

[workspace.limits]
max_members = 10
storage_quota_mb = 1024
max_tasks_per_day = 100
```

---

## 6. API Design

### 6.1 Workspace Management

```
POST   /api/workspaces                          # Create workspace
GET    /api/workspaces                          # List accessible workspaces
GET    /api/workspaces/:id                      # Get workspace details
PUT    /api/workspaces/:id                      # Update workspace
DELETE /api/workspaces/:id                      # Delete workspace (Owner only)
POST   /api/workspaces/:id/archive              # Archive workspace
POST   /api/workspaces/:id/restore              # Restore from archive

GET    /api/workspaces/:id/settings             # Get settings
PUT    /api/workspaces/:id/settings             # Update settings
PUT    /api/workspaces/:id/storage              # Update storage config

GET    /api/workspaces/:id/home                 # Workspace home data
GET    /api/workspaces/:id/stats                # Statistics
GET    /api/workspaces/:id/audit-logs           # Audit logs
```

### 6.2 Member Management

```
GET    /api/workspaces/:id/members                          # List members
POST   /api/workspaces/:id/members                          # Invite member
GET    /api/workspaces/:id/members/:membership_id          # Get member
PUT    /api/workspaces/:id/members/:membership_id          # Update role
DELETE /api/workspaces/:id/members/:membership_id          # Remove member

POST   /api/workspaces/:id/invitations                      # Create invite
GET    /api/workspaces/:id/invitations                      # List invites
DELETE /api/workspaces/:id/invitations/:code               # Cancel invite
POST   /api/invitations/:code/accept                        # Accept invite
```

### 6.3 Policy Profile Management

```
GET    /api/workspaces/:id/policies                 # List policy profiles
POST   /api/workspaces/:id/policies                 # Create profile
GET    /api/workspaces/:id/policies/:id             # Get profile
PUT    /api/workspaces/:id/policies/:id             # Update profile
DELETE /api/workspaces/:id/policies/:id             # Delete profile
PUT    /api/workspaces/:id/default-policy           # Set default
```

---

## 7. RBAC Implementation

### 7.1 Permission System

```rust
#[derive(Debug, Clone, PartialEq, Eq)]
pub struct Permission {
    pub resource: ResourceType,
    pub action: ActionType,
    pub conditions: Vec<PermissionCondition>,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ResourceType {
    Workspace,
    Playbook,
    Task,
    Artifact,
    Member,
    Policy,
    Setting,
}

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum ActionType {
    Create,
    Read,
    Update,
    Delete,
    Execute,    // Run tasks
    Publish,    // Publish playbooks
    Invite,     // Invite members
    Admin,      // Administrative actions
}

pub struct PermissionChecker;

impl PermissionChecker {
    pub fn check(
        user: &User,
        workspace: &Workspace,
        permission: Permission,
    ) -> Result<(), PermissionDenied>;
}
```

### 7.2 Role-to-Permission Mapping

```rust
impl WorkspaceRole {
    pub fn permissions(&self) -> Vec<Permission> {
        match self {
            WorkspaceRole::Owner => vec![
                Permission::all(ResourceType::Workspace),
                Permission::all(ResourceType::Playbook),
                Permission::all(ResourceType::Task),
                Permission::all(ResourceType::Artifact),
                Permission::all(ResourceType::Member),
                Permission::all(ResourceType::Policy),
                Permission::all(ResourceType::Setting),
            ],
            WorkspaceRole::Admin => vec![
                Permission::crud(ResourceType::Playbook),
                Permission::crud(ResourceType::Task),
                Permission::crud(ResourceType::Artifact),
                Permission::crud_except_delete(ResourceType::Member),
                Permission::crud_except_delete(ResourceType::Policy),
                Permission::crud_except_delete(ResourceType::Setting),
            ],
            // ... other roles
        }
    }
}
```

---

## 8. Multi-Tenancy

### 8.1 Tenant Isolation

```rust
pub struct Tenant {
    pub id: String,
    pub name: String,
    pub slug: String,
    pub plan: TenantPlan,
    pub settings: TenantSettings,
    pub created_at: OffsetDateTime,
    pub updated_at: OffsetDateTime,
}

pub struct TenantContext {
    pub tenant_id: String,
    pub organization_id: Option<String>,
}

// All repository operations require TenantContext
pub trait TenantScopedRepository<T> {
    fn find_by_id(&self, ctx: &TenantContext, id: &str) -> Result<Option<T>, Error>;
    fn list(&self, ctx: &TenantContext) -> Result<Vec<T>, Error>;
    fn create(&self, ctx: &TenantContext, entity: T) -> Result<T, Error>;
    fn update(&self, ctx: &TenantContext, entity: T) -> Result<T, Error>;
    fn delete(&self, ctx: &TenantContext, id: &str) -> Result<(), Error>;
}
```

### 8.2 Data Isolation Strategy

| Level | Strategy |
|-------|----------|
| Database | `tenant_id` column in all tables |
| Storage | `/tenants/{tenant_id}/` prefix |
| Cache | `tenant:{tenant_id}:key` format |
| API | JWT token contains `tenant_id` |
| Search | Tenant-scoped indexes |

---

## 9. Integration Points

### 9.1 Playbook Module

```rust
// Playbook belongs to workspace
pub struct PlaybookHandle {
    pub workspace_id: String,  // NEW: workspace reference
    // ... existing fields
}

// Playbook operations require workspace context
pub trait PlaybookService {
    fn create(
        &self,
        workspace_id: &str,
        request: CreatePlaybookRequest,
        user: &User,
    ) -> Result<PlaybookHandle, Error>;
}
```

### 9.2 Task Module

```rust
// Task executes within workspace context
pub struct Task {
    pub workspace_id: String,
    pub workspace_policy: WorkspacePolicy,  // Resolved policy snapshot
    // ... existing fields
}

pub trait TaskService {
    fn create(
        &self,
        workspace_id: &str,
        request: CreateTaskRequest,
        user: &User,
    ) -> Result<Task, Error> {
        // 1. Check user permission
        self.check_permission(user, workspace_id, Permission::ExecuteTask)?;
        
        // 2. Resolve workspace policy
        let policy = self.workspace_policy_resolver.resolve(
            workspace_id,
            &request.bound_inputs,
            user,
        )?;
        
        // 3. Create task with policy
        self.create_task(workspace_id, request, policy)
    }
}
```

### 9.3 Tool Gateway Integration

```rust
pub struct ToolGateway {
    policy: PolicyProfile,
    workspace_policy: WorkspacePolicy,  // Task-level policy
    workspace_root: PathBuf,
    output_root: PathBuf,
}

impl ToolGateway {
    pub fn evaluate(&self, request: ToolRequest) -> PolicyDecision {
        // 1. Check workspace boundaries first
        if !self.check_workspace_boundaries(&request) {
            return PolicyDecision::Deny {
                reason: "Outside workspace boundaries".into(),
            };
        }
        
        // 2. Check path rules
        if let Some(path) = &request.target_path {
            if !self.path_validator.validate(path, &self.workspace_policy) {
                return PolicyDecision::Deny {
                    reason: "Path violates workspace policy".into(),
                };
            }
        }
        
        // 3. Existing tool-level policy checks
        self.evaluate_tool_policy(&request)
    }
}
```

---

## 10. Database Schema

### 10.1 PostgreSQL Tables

```sql
-- Tenants
CREATE TABLE tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    plan VARCHAR(50) DEFAULT 'free',
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255),
    avatar_url TEXT,
    status VARCHAR(50) DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_login_at TIMESTAMPTZ,
    UNIQUE(tenant_id, email)
);

-- Workspaces
CREATE TABLE workspaces (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES tenants(id),
    slug VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    icon_url TEXT,
    status VARCHAR(50) DEFAULT 'draft',
    visibility VARCHAR(50) DEFAULT 'private',
    storage_config JSONB NOT NULL,
    settings JSONB NOT NULL,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    archived_at TIMESTAMPTZ,
    UNIQUE(tenant_id, slug)
);

-- Workspace Memberships
CREATE TABLE workspace_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(50) NOT NULL,
    invited_by UUID REFERENCES users(id),
    invited_at TIMESTAMPTZ,
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE(workspace_id, user_id)
);

-- Policy Profiles
CREATE TABLE policy_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    allowed_tools TEXT[],
    approval_required_tools TEXT[],
    denied_tools TEXT[],
    default_scope JSONB NOT NULL,
    default_write_mode VARCHAR(50) NOT NULL,
    default_read_boundary JSONB NOT NULL,
    default_write_boundary JSONB NOT NULL,
    default_path_rules JSONB NOT NULL,
    parent_profile_id UUID REFERENCES policy_profiles(id),
    is_system BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Workspace Policies (task-level snapshots)
CREATE TABLE workspace_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workspace_id UUID NOT NULL REFERENCES workspaces(id),
    task_id UUID,
    scope JSONB NOT NULL,
    read_boundary JSONB NOT NULL,
    write_boundary JSONB NOT NULL,
    path_rules JSONB NOT NULL,
    source JSONB NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_workspaces_tenant ON workspaces(tenant_id);
CREATE INDEX idx_workspaces_status ON workspaces(status);
CREATE INDEX idx_memberships_workspace ON workspace_memberships(workspace_id);
CREATE INDEX idx_memberships_user ON workspace_memberships(user_id);
CREATE INDEX idx_policies_workspace ON policy_profiles(workspace_id);
```

---

## 11. Error Handling

### 11.1 Error Types

```rust
#[derive(Debug, thiserror::Error)]
pub enum WorkspaceError {
    #[error("Workspace not found: {0}")]
    NotFound(String),
    
    #[error("Permission denied: {action} on {resource}")]
    PermissionDenied { action: String, resource: String },
    
    #[error("Workspace limit exceeded: {limit}")]
    LimitExceeded { limit: String },
    
    #[error("Invalid workspace state: {0}")]
    InvalidState(String),
    
    #[error("Storage error: {0}")]
    Storage(#[from] StorageError),
    
    #[error("Policy violation: {0}")]
    PolicyViolation(String),
}

#[derive(Debug, thiserror::Error)]
pub enum PolicyError {
    #[error("Policy profile not found: {0}")]
    ProfileNotFound(String),
    
    #[error("Invalid policy configuration: {0}")]
    InvalidConfiguration(String),
    
    #[error("Path violates policy: {path}")]
    PathViolation { path: String },
    
    #[error("Boundary violation: {reason}")]
    BoundaryViolation { reason: String },
}
```

---

## 12. Testing Strategy

### 12.1 Test Categories

1. **Unit Tests**: Individual entity validation, policy resolution logic
2. **Integration Tests**: Repository layer, service layer interactions
3. **API Tests**: HTTP endpoint testing with authentication
4. **E2E Tests**: Full workflow: Create workspace → Invite member → Create playbook → Execute task
5. **Security Tests**: RBAC enforcement, path traversal attacks, permission bypass attempts

### 12.2 Critical Test Cases

```rust
// RBAC
#[test]
fn viewer_cannot_create_playbook()
#[test]
fn editor_cannot_delete_workspace()
#[test]
fn guest_has_limited_access()

// Policy
#[test]
fn path_traversal_attack_blocked()
#[test]
fn write_outside_output_denied()
#[test]
fn read_outside_boundary_denied()

// Multi-tenancy
#[test]
fn tenant_isolation_enforced()
#[test]
fn cross_tenant_access_blocked()
```

---

## 13. Migration Strategy

### 13.1 From Current State

1. **Phase 1**: Extend existing Workspace entity with new fields
2. **Phase 2**: Add User and Membership entities
3. **Phase 3**: Implement RBAC system
4. **Phase 4**: Add Policy Profile and Workspace Policy
5. **Phase 5**: Integrate with Tool Gateway
6. **Phase 6**: Add multi-tenancy layer

### 13.2 Backward Compatibility

- Existing single-workspace setup continues to work
- New fields have sensible defaults
- Gradual migration path for existing data

---

## 14. Performance Considerations

### 14.1 Optimization Strategies

| Area | Strategy |
|------|----------|
| Database | Tenant-partitioned indexes, query optimization |
| Caching | Redis for workspace metadata, policy resolution |
| Storage | Lazy loading, CDN for artifacts |
| API | Pagination, rate limiting, request batching |

### 14.2 Scalability Limits

- Workspaces per tenant: 100 (configurable)
- Members per workspace: 50 (configurable)
- Tasks per day: 1000 (configurable)
- Storage per workspace: 10GB (configurable)

---

## 15. Security Considerations

### 15.1 Threat Model

| Threat | Mitigation |
|--------|------------|
| Path traversal | Workspace policy with canonicalization |
| Privilege escalation | RBAC with principle of least privilege |
| Data leakage | Tenant isolation, workspace boundaries |
| Unauthorized access | JWT authentication, permission checks |
| Resource exhaustion | Quotas, rate limiting |

### 15.2 Security Checklist

- [ ] All paths canonicalized before validation
- [ ] All API endpoints require authentication
- [ ] All operations check permissions
- [ ] Tenant isolation enforced at all layers
- [ ] Audit logs for sensitive operations
- [ ] Input validation on all user inputs
- [ ] Secrets stored in secure vault

---

## 16. Future Extensions

### 16.1 Potential Enhancements

1. **Workspace Templates**: Pre-configured workspace setups
2. **Cross-Workspace Sharing**: Controlled playbook sharing between workspaces
3. **Advanced Policies**: Time-based, conditional policies
4. **Workspace Analytics**: Usage metrics, cost tracking
5. **Organization Management**: Hierarchical org structures
6. **External Integrations**: Slack, Discord, GitHub webhooks

### 16.2 Deferred to Future

- Real-time collaboration features
- Advanced workflow automation
- Custom policy DSL
- Marketplace for workspace templates

---

## 17. Glossary

| Term | Definition |
|------|------------|
| **Workspace** | Container for playbooks, tasks, and artifacts |
| **Tenant** | Multi-tenancy isolation boundary |
| **RBAC** | Role-Based Access Control |
| **Policy Profile** | Reusable policy configuration template |
| **Workspace Policy** | Task-level resolved policy instance |
| **Policy Resolution** | Process of combining sources into policy |
| **Scope** | Directory visibility level for task |
| **Boundary** | Read/write access limits |
| **Path Rules** | Filename and path validation rules |

---

## 18. References

- Existing Workspace Policy Model Spec: `docs/superpowers/specs/2026-03-29-decacan-workspace-policy-model-spec.md`
- Current Workspace Entity: `crates/decacan-runtime/src/workspace/entity.rs`
- Current Policy Entity: `crates/decacan-runtime/src/policy/entity.rs`
- Tool Gateway: `crates/decacan-runtime/src/gateway/tool_gateway.rs`

---

**End of Specification**
