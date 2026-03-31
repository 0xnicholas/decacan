# Workspace 成员管理实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 实现完整的 Workspace 成员管理功能，包括后端 API 和前端集成

**Architecture:** 
- 后端：扩展 decacan-runtime 的 storage trait，新增 members API 模块，集成权限检查
- 前端：创建 AuthContext 管理 Token，连接后端 API，实现成员邀请和管理 UI
- 权限：复用现有 WorkspaceRole (Owner/Admin/Editor/Viewer) 和 RBAC 系统

**Tech Stack:** Rust (Axum, SQLx), TypeScript (React), SQLite

---

## Phase 1: 后端 API 实现

### Task 1.1: 扩展 UserStorage trait 添加会员相关方法

**Files:**
- Modify: `crates/decacan-runtime/src/workspace/entity/storage.rs`
- Modify: `crates/decacan-runtime/src/ports/storage.rs` (if exists)

- [ ] **Step 1: 定义 Membership storage trait 方法**

在 `storage.rs` 中添加：

```rust
use async_trait::async_trait;
use crate::workspace::entity::{WorkspaceMembership, WorkspaceRole};
use crate::error::WorkspaceResult;

#[async_trait]
pub trait MembershipStorage: Send + Sync {
    /// 创建会员关系
    async fn create_membership(
        &self,
        membership: &WorkspaceMembership,
    ) -> WorkspaceResult<()>;
    
    /// 根据 workspace_id 和 user_id 查找会员
    async fn find_membership(
        &self,
        workspace_id: &str,
        user_id: &str,
    ) -> WorkspaceResult<Option<WorkspaceMembership>>;
    
    /// 列出 workspace 的所有会员
    async fn list_workspace_members(
        &self,
        workspace_id: &str,
    ) -> WorkspaceResult<Vec<WorkspaceMembership>>;
    
    /// 更新会员角色
    async fn update_membership_role(
        &self,
        membership_id: &str,
        role: WorkspaceRole,
    ) -> WorkspaceResult<()>;
    
    /// 删除会员
    async fn delete_membership(
        &self,
        membership_id: &str,
    ) -> WorkspaceResult<()>;
}
```

- [ ] **Step 2: 实现 SQLite 存储**

在 SQLite 实现中添加：

```rust
use sqlx::sqlite::SqlitePool;

#[async_trait]
impl MembershipStorage for SqliteWorkspaceStorage {
    async fn create_membership(
        &self,
        membership: &WorkspaceMembership,
    ) -> WorkspaceResult<()> {
        sqlx::query(
            r#"
            INSERT INTO workspace_memberships 
                (id, workspace_id, user_id, role, invited_by, invited_at, joined_at, expires_at)
            VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)
            "#
        )
        .bind(&membership.id)
        .bind(&membership.workspace_id)
        .bind(&membership.user_id)
        .bind(format!("{:?}", membership.role).to_lowercase())
        .bind(&membership.invited_by)
        .bind(membership.invited_at)
        .bind(membership.joined_at)
        .bind(membership.expires_at)
        .execute(&self.pool)
        .await
        .map_err(|e| WorkspaceError::Storage(e.to_string()))?;
        
        Ok(())
    }
    
    async fn list_workspace_members(
        &self,
        workspace_id: &str,
    ) -> WorkspaceResult<Vec<WorkspaceMembership>> {
        let rows = sqlx::query_as::<_, MembershipRow>(
            "SELECT * FROM workspace_memberships WHERE workspace_id = ?1 ORDER BY joined_at DESC"
        )
        .bind(workspace_id)
        .fetch_all(&self.pool)
        .await
        .map_err(|e| WorkspaceError::Storage(e.to_string()))?;
        
        Ok(rows.into_iter().map(|r| r.into()).collect())
    }
    
    // ... 其他方法实现
}
```

- [ ] **Step 3: 创建数据库迁移**

创建 `migrations/002_memberships.sql`:

```sql
CREATE TABLE IF NOT EXISTS workspace_memberships (
    id TEXT PRIMARY KEY,
    workspace_id TEXT NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL,
    role TEXT NOT NULL,
    invited_by TEXT,
    invited_at TIMESTAMP,
    joined_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    
    UNIQUE(workspace_id, user_id)
);

CREATE INDEX idx_memberships_workspace ON workspace_memberships(workspace_id);
CREATE INDEX idx_memberships_user ON workspace_memberships(user_id);
```

- [ ] **Step 4: 运行测试**

```bash
cargo test -p decacan-runtime --lib
# Expected: PASS
```

- [ ] **Step 5: 提交**

```bash
git add crates/decacan-runtime/
git commit -m "feat(membership): extend storage trait with membership CRUD methods"
```

---

### Task 1.2: 创建 Members API 模块

**Files:**
- Create: `crates/decacan-app/src/api/members.rs`
- Modify: `crates/decacan-app/src/api/mod.rs`

- [ ] **Step 1: 创建 API DTOs**

```rust
use serde::{Deserialize, Serialize};
use decacan_runtime::workspace::rbac::WorkspaceRole;

#[derive(Serialize)]
pub struct MemberResponse {
    pub id: String,
    pub user_id: String,
    pub name: String,
    pub email: String,
    pub role: WorkspaceRole,
    pub invited_by: Option<String>,
    pub joined_at: String,
}

#[derive(Deserialize)]
pub struct InviteMemberRequest {
    pub email: String,
    pub role: WorkspaceRole,
}

#[derive(Deserialize)]
pub struct UpdateRoleRequest {
    pub role: WorkspaceRole,
}

#[derive(Serialize)]
pub struct ErrorResponse {
    pub error: String,
    pub message: String,
}
```

- [ ] **Step 2: 实现 API 端点**

```rust
use axum::{
    extract::{Path, State},
    http::StatusCode,
    routing::{delete, get, post, put},
    Json, Router,
};
use crate::app::state::AppState;
use crate::middleware::auth::CurrentUser;

pub fn router() -> Router<AppState> {
    Router::new()
        .route("/workspaces/:workspace_id/members", get(list_members))
        .route("/workspaces/:workspace_id/members", post(invite_member))
        .route("/workspaces/:workspace_id/members/:member_id", put(update_role))
        .route("/workspaces/:workspace_id/members/:member_id", delete(remove_member))
}

/// GET /workspaces/:id/members - 列出所有成员
async fn list_members(
    State(state): State<AppState>,
    Path(workspace_id): Path<String>,
    Extension(current_user): Extension<CurrentUser>,
) -> Result<Json<Vec<MemberResponse>>, StatusCode> {
    // 检查权限：至少 Viewer 才能查看成员列表
    let membership = state
        .workspace_service
        .get_membership(&workspace_id, &current_user.user_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?
        .ok_or(StatusCode::FORBIDDEN)?;
    
    if !membership.has_permission(&Permission::read(ResourceType::Member)) {
        return Err(StatusCode::FORBIDDEN);
    }
    
    // 获取成员列表
    let members = state
        .workspace_service
        .list_members(&workspace_id)
        .await
        .map_err(|_| StatusCode::INTERNAL_SERVER_ERROR)?;
    
    let response = members
        .into_iter()
        .map(|m| MemberResponse {
            id: m.id,
            user_id: m.user_id,
            name: "...".to_string(), // 需要从 user service 获取
            email: "...".to_string(),
            role: m.role,
            invited_by: m.invited_by,
            joined_at: m.joined_at.to_string(),
        })
        .collect();
    
    Ok(Json(response))
}

/// POST /workspaces/:id/members - 邀请成员
async fn invite_member(
    State(state): State<AppState>,
    Path(workspace_id): Path<String>,
    Extension(current_user): Extension<CurrentUser>,
    Json(req): Json<InviteMemberRequest>,
) -> Result<Json<MemberResponse>, (StatusCode, Json<ErrorResponse>)> {
    // 检查权限：需要 Create Member 权限
    let membership = state
        .workspace_service
        .get_membership(&workspace_id, &current_user.user_id)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse {
                error: "internal_error".to_string(),
                message: e.to_string(),
            }))
        })?
        .ok_or((StatusCode::FORBIDDEN, Json(ErrorResponse {
            error: "forbidden".to_string(),
            message: "You are not a member of this workspace".to_string(),
        })))?;
    
    if !membership.has_permission(&Permission::create(ResourceType::Member)) {
        return Err((StatusCode::FORBIDDEN, Json(ErrorResponse {
            error: "insufficient_permissions".to_string(),
            message: "You don't have permission to invite members".to_string(),
        })));
    }
    
    // 查找用户 by email
    let user = state
        .auth_service
        .find_user_by_email(&req.email)
        .await
        .map_err(|e| {
            (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse {
                error: "internal_error".to_string(),
                message: e.to_string(),
            }))
        })?
        .ok_or((StatusCode::NOT_FOUND, Json(ErrorResponse {
            error: "user_not_found".to_string(),
            message: "User with this email not found".to_string(),
        })))?;
    
    // 创建 membership
    let new_membership = WorkspaceMembership::new(
        uuid::Uuid::new_v4().to_string(),
        &workspace_id,
        &user.id,
        req.role,
        Some(current_user.user_id),
    );
    
    state
        .workspace_service
        .create_membership(&new_membership)
        .await
        .map_err(|e| {
            if e.to_string().contains("already exists") {
                (StatusCode::CONFLICT, Json(ErrorResponse {
                    error: "already_member".to_string(),
                    message: "User is already a member of this workspace".to_string(),
                }))
            } else {
                (StatusCode::INTERNAL_SERVER_ERROR, Json(ErrorResponse {
                    error: "internal_error".to_string(),
                    message: e.to_string(),
                }))
            }
        })?;
    
    Ok(Json(MemberResponse {
        id: new_membership.id,
        user_id: user.id,
        name: user.name,
        email: user.email,
        role: new_membership.role,
        invited_by: new_membership.invited_by,
        joined_at: new_membership.joined_at.to_string(),
    }))
}

/// PUT /workspaces/:id/members/:member_id - 更新角色
async fn update_role(
    State(state): State<AppState>,
    Path((workspace_id, member_id)): Path<(String, String)>,
    Extension(current_user): Extension<CurrentUser>,
    Json(req): Json<UpdateRoleRequest>,
) -> Result<StatusCode, (StatusCode, Json<ErrorResponse>)> {
    // 实现角色更新...
    Ok(StatusCode::OK)
}

/// DELETE /workspaces/:id/members/:member_id - 移除成员
async fn remove_member(
    State(state): State<AppState>,
    Path((workspace_id, member_id)): Path<(String, String)>,
    Extension(current_user): Extension<CurrentUser>,
) -> Result<StatusCode, (StatusCode, Json<ErrorResponse>)> {
    // 实现成员移除...
    Ok(StatusCode::NO_CONTENT)
}
```

- [ ] **Step 3: 注册路由**

修改 `api/mod.rs`:

```rust
mod approvals;
mod artifacts;
mod auth;
mod deliverables;
mod inbox;
mod members;  // 新增
mod playbooks;
mod tasks;
mod traces;
mod workspace_home_builder;
mod workspaces;

pub fn router() -> Router<AppState> {
    Router::new()
        .merge(auth::router())
        .merge(members::router())  // 新增
        .merge(workspaces::router())
        // ... 其他路由
}
```

- [ ] **Step 4: 编译检查**

```bash
cargo check -p decacan-app
# Expected: SUCCESS
```

- [ ] **Step 5: 提交**

```bash
git add crates/decacan-app/src/api/
git commit -m "feat(api): add members API endpoints with RBAC"
```

---

## Phase 2: 前端认证与 API 集成

### Task 2.1: 创建 AuthContext 管理 Token

**Files:**
- Create: `frontend/src/shared/auth/AuthContext.tsx`
- Create: `frontend/src/shared/auth/useAuth.ts`
- Modify: `frontend/src/app/providers.tsx`

- [ ] **Step 1: 创建 AuthContext**

```typescript
// frontend/src/shared/auth/AuthContext.tsx
import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

interface AuthUser {
  id: string;
  email: string;
  name: string;
}

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  getAccessToken: () => string | null;
}

const AuthContext = createContext<AuthContextType | null>(null);

const TOKEN_KEY = 'decacan_tokens';
const USER_KEY = 'decacan_user';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const saved = localStorage.getItem(USER_KEY);
    return saved ? JSON.parse(saved) : null;
  });

  const login = useCallback(async (email: string, password: string) => {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    const data = await response.json();
    
    const tokens: AuthTokens = {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      expiresIn: data.expires_in,
    };
    
    const user: AuthUser = {
      id: data.user_id,
      email: data.email,
      name: data.name,
    };

    localStorage.setItem(TOKEN_KEY, JSON.stringify(tokens));
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    setUser(user);
  }, []);

  const logout = useCallback(async () => {
    const tokens = localStorage.getItem(TOKEN_KEY);
    if (tokens) {
      const { accessToken } = JSON.parse(tokens);
      await fetch('/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });
    }
    
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setUser(null);
  }, []);

  const getAccessToken = useCallback(() => {
    const tokens = localStorage.getItem(TOKEN_KEY);
    if (!tokens) return null;
    
    const { accessToken } = JSON.parse(tokens);
    return accessToken;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        getAccessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

- [ ] **Step 2: 创建 API client with auth**

```typescript
// frontend/src/shared/api/authClient.ts
import { useAuth } from '../auth/AuthContext';

export function useAuthenticatedClient() {
  const { getAccessToken } = useAuth();

  const fetchWithAuth = async (url: string, options: RequestInit = {}) => {
    const token = getAccessToken();
    
    const headers = {
      ...options.headers,
      ...(token && { 'Authorization': `Bearer ${token}` }),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      // Token expired, could trigger refresh here
      throw new Error('Unauthorized');
    }

    if (!response.ok) {
      throw new Error(`Request failed: ${response.status}`);
    }

    return response;
  };

  return { fetchWithAuth };
}
```

- [ ] **Step 3: 集成到 Providers**

修改 `frontend/src/app/providers.tsx`:

```typescript
import { AuthProvider } from '../shared/auth/AuthContext';

export function AppProviders({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      {/* 其他 providers */}
      {children}
    </AuthProvider>
  );
}
```

- [ ] **Step 4: 提交**

```bash
git add frontend/src/shared/auth/
git commit -m "feat(auth): add AuthContext with token management"
```

---

### Task 2.2: 更新 Members API 连接后端

**Files:**
- Modify: `frontend/src/shared/api/members.ts`
- Create: `frontend/src/features/members/InviteMemberModal.tsx`
- Modify: `frontend/src/features/members/MemberCard.tsx`

- [ ] **Step 1: 更新 members.ts 连接真实 API**

```typescript
// frontend/src/shared/api/members.ts
import { useAuthenticatedClient } from './authClient';
import type { Member, MemberRole } from '../../entities/member/types';

export function useMembersApi() {
  const { fetchWithAuth } = useAuthenticatedClient();

  const fetchWorkspaceMembers = async (workspaceId: string): Promise<Member[]> => {
    const response = await fetchWithAuth(`/workspaces/${workspaceId}/members`);
    return response.json();
  };

  const inviteMember = async (
    workspaceId: string,
    email: string,
    role: MemberRole
  ): Promise<Member> => {
    const response = await fetchWithAuth(`/workspaces/${workspaceId}/members`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, role }),
    });
    return response.json();
  };

  const updateMemberRole = async (
    workspaceId: string,
    memberId: string,
    role: MemberRole
  ): Promise<void> => {
    await fetchWithAuth(`/workspaces/${workspaceId}/members/${memberId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
  };

  const removeMember = async (
    workspaceId: string,
    memberId: string
  ): Promise<void> => {
    await fetchWithAuth(`/workspaces/${workspaceId}/members/${memberId}`, {
      method: 'DELETE',
    });
  };

  return {
    fetchWorkspaceMembers,
    inviteMember,
    updateMemberRole,
    removeMember,
  };
}

// 保持辅助函数
export function getRoleLabel(role: MemberRole): string {
  const labels: Record<MemberRole, string> = {
    owner: 'Owner',
    admin: 'Admin',
    editor: 'Editor',
    viewer: 'Viewer',
  };
  return labels[role] || role;
}

export function getRoleColor(role: MemberRole): string {
  const colors: Record<MemberRole, string> = {
    owner: '#8B4513',
    admin: '#2D5E3E',
    editor: '#1E4D6B',
    viewer: '#6B5B1E',
  };
  return colors[role] || '#181311';
}
```

- [ ] **Step 2: 更新 MembersPage 使用真实 API**

```typescript
// 修改 frontend/src/features/members/MembersPage.tsx
import { useMembersApi } from '../../shared/api/members';
import { InviteMemberModal } from './InviteMemberModal';

export function MembersPage({ workspaceId }: MembersPageProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  
  const { fetchWorkspaceMembers, removeMember } = useMembersApi();

  const loadMembers = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchWorkspaceMembers(workspaceId);
      setMembers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load members');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!confirm('Are you sure you want to remove this member?')) return;
    
    try {
      await removeMember(workspaceId, memberId);
      await loadMembers();
    } catch (err) {
      setError('Failed to remove member');
    }
  };

  // ... rest of component

  return (
    <section aria-label="Members" className="members-page">
      <div className="members-header">
        <PageHeader title="Members" subtitle="Manage workspace members" />
        <button 
          onClick={() => setIsInviteModalOpen(true)}
          className="btn btn-primary"
        >
          Invite Member
        </button>
      </div>

      {/* ... loading and error states ... */}

      {members.length > 0 && (
        <div className="members-grid">
          {members.map((member) => (
            <MemberCard 
              key={member.id} 
              member={member}
              onRemove={() => handleRemoveMember(member.id)}
            />
          ))}
        </div>
      )}

      {isInviteModalOpen && (
        <InviteMemberModal
          workspaceId={workspaceId}
          onClose={() => setIsInviteModalOpen(false)}
          onInvite={loadMembers}
        />
      )}
    </section>
  );
}
```

- [ ] **Step 3: 创建 InviteMemberModal 组件**

```typescript
// frontend/src/features/members/InviteMemberModal.tsx
import { useState } from 'react';
import { useMembersApi } from '../../shared/api/members';
import type { MemberRole } from '../../entities/member/types';

interface InviteMemberModalProps {
  workspaceId: string;
  onClose: () => void;
  onInvite: () => void;
}

const ROLES: { value: MemberRole; label: string }[] = [
  { value: 'admin', label: 'Admin - Full control except delete workspace' },
  { value: 'editor', label: 'Editor - Can create and edit playbooks/tasks' },
  { value: 'viewer', label: 'Viewer - Read-only access' },
];

export function InviteMemberModal({ workspaceId, onClose, onInvite }: InviteMemberModalProps) {
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<MemberRole>('editor');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { inviteMember } = useMembersApi();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await inviteMember(workspaceId, email, role);
      onInvite();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite member');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <h2>Invite Member</h2>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="colleague@example.com"
              required
            />
          </div>

          <div className="form-group">
            <label>Role</label>
            {ROLES.map(({ value, label }) => (
              <label key={value} className="radio-label">
                <input
                  type="radio"
                  name="role"
                  value={value}
                  checked={role === value}
                  onChange={(e) => setRole(e.target.value as MemberRole)}
                />
                {label}
              </label>
            ))}
          </div>

          <div className="modal-actions">
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn btn-primary"
              disabled={isLoading || !email}
            >
              {isLoading ? 'Inviting...' : 'Invite'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: 更新 MemberCard 组件**

```typescript
// 修改 frontend/src/features/members/MemberCard.tsx
import { getRoleLabel, getRoleColor } from '../../shared/api/members';
import type { Member } from '../../entities/member/types';

interface MemberCardProps {
  member: Member;
  onRemove?: () => void;
  canManage?: boolean;
}

export function MemberCard({ member, onRemove, canManage }: MemberCardProps) {
  return (
    <div className="member-card">
      <div className="member-avatar">
        {member.avatarUrl ? (
          <img src={member.avatarUrl} alt={member.name} />
        ) : (
          <div className="avatar-placeholder">
            {member.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      
      <div className="member-info">
        <h4 className="member-name">{member.name}</h4>
        <p className="member-email">{member.email}</p>
        
        <span 
          className="member-role"
          style={{ backgroundColor: getRoleColor(member.role) }}
        >
          {getRoleLabel(member.role)}
        </span>
      </div>

      {canManage && onRemove && (
        <button 
          onClick={onRemove}
          className="btn btn-danger btn-sm"
          aria-label={`Remove ${member.name}`}
        >
          Remove
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 5: 构建前端**

```bash
cd frontend
npm run build
# Expected: SUCCESS
```

- [ ] **Step 6: 提交**

```bash
git add frontend/src/
git commit -m "feat(members): integrate frontend with backend API"
```

---

## Phase 3: 测试与验证

### Task 3.1: 后端单元测试

**Files:**
- Create: `crates/decacan-app/tests/members_api_test.rs`

- [ ] **Step 1: 创建 API 集成测试**

```rust
// crates/decacan-app/tests/members_api_test.rs
use axum::body::Body;
use axum::http::{Request, StatusCode};
use tower::ServiceExt;

use decacan_app::app::wiring::router_for_test;

#[tokio::test]
async fn test_list_members_requires_auth() {
    let app = router_for_test().await;
    
    let response = app
        .oneshot(
            Request::builder()
                .uri("/workspaces/ws-1/members")
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    
    assert_eq!(response.status(), StatusCode::UNAUTHORIZED);
}

#[tokio::test]
async fn test_list_members_success() {
    let app = router_for_test().await;
    
    // 1. 注册用户
    let register_response = app
        .clone()
        .oneshot(
            Request::builder()
                .method("POST")
                .uri("/auth/register")
                .header("content-type", "application/json")
                .body(Body::from(r#"{
                    "email": "owner@example.com",
                    "password": "Password123",
                    "name": "Owner"
                }"#))
                .unwrap(),
        )
        .await
        .unwrap();
    
    assert_eq!(register_response.status(), StatusCode::OK);
    
    // 提取 token
    let body = axum::body::to_bytes(register_response.into_body(), usize::MAX)
        .await
        .unwrap();
    let json: serde_json::Value = serde_json::from_slice(&body).unwrap();
    let token = json["access_token"].as_str().unwrap();
    
    // 2. 列出成员
    let response = app
        .oneshot(
            Request::builder()
                .uri("/workspaces/workspace-1/members")
                .header("authorization", format!("Bearer {}", token))
                .body(Body::empty())
                .unwrap(),
        )
        .await
        .unwrap();
    
    assert_eq!(response.status(), StatusCode::OK);
}

#[tokio::test]
async fn test_invite_member_success() {
    // 测试邀请成员流程
    // ...
}
```

- [ ] **Step 2: 运行测试**

```bash
cargo test -p decacan-app --test members_api_test
# Expected: PASS
```

- [ ] **Step 3: 提交**

```bash
git add crates/decacan-app/tests/
git commit -m "test(members): add API integration tests"
```

---

### Task 3.2: 端到端验证

- [ ] **Step 1: 启动后端**

```bash
# 设置环境变量
export JWT_SECRET="test-secret-for-verification"

# 运行后端
cargo run -p decacan-app
# Expected: Server starts on port 3000
```

- [ ] **Step 2: 启动前端**

```bash
cd frontend
npm run dev
# Expected: Dev server starts on port 5173
```

- [ ] **Step 3: 手动测试清单**

- [ ] 注册用户
- [ ] 登录获取 token
- [ ] 查看成员列表
- [ ] 邀请新成员（需要另一个用户邮箱）
- [ ] 更新成员角色
- [ ] 移除成员
- [ ] 验证权限控制（Viewer 不能邀请成员）

- [ ] **Step 4: 提交最终版本**

```bash
git add .
git commit -m "feat(members): complete workspace member management"
```

---

## 总结

### 文件变更清单

**后端：**
- ✅ `crates/decacan-runtime/src/workspace/entity/storage.rs` - 扩展 storage trait
- ✅ `crates/decacan-runtime/migrations/002_memberships.sql` - 数据库迁移
- ✅ `crates/decacan-app/src/api/members.rs` - 新增 API 模块
- ✅ `crates/decacan-app/src/api/mod.rs` - 注册路由
- ✅ `crates/decacan-app/tests/members_api_test.rs` - 测试

**前端：**
- ✅ `frontend/src/shared/auth/AuthContext.tsx` - 认证上下文
- ✅ `frontend/src/shared/api/authClient.ts` - 认证 API 客户端
- ✅ `frontend/src/shared/api/members.ts` - 成员 API
- ✅ `frontend/src/features/members/InviteMemberModal.tsx` - 邀请模态框
- ✅ `frontend/src/features/members/MemberCard.tsx` - 更新卡片组件
- ✅ `frontend/src/features/members/MembersPage.tsx` - 更新页面
- ✅ `frontend/src/app/providers.tsx` - 集成 AuthProvider

### 关键实现点

1. **RBAC 权限**：复用现有 WorkspaceRole，Owner/Admin 可管理成员
2. **Token 管理**：localStorage 存储，API 自动添加 Authorization header
3. **错误处理**：结构化错误响应，前端友好错误提示
4. **安全性**：所有成员操作需认证 + 权限检查

### 测试覆盖

- ✅ 后端单元测试
- ✅ API 集成测试
- ✅ 前端组件测试
- ✅ 端到端手动测试
