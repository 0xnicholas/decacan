# Decacan Frontend Independent Development Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete the frontend implementation by adding Activity and Members pages, unifying UI states (loading/error/empty) across all pages—all without backend dependency.

**Architecture:** Build on existing feature-based structure (`features/`, `entities/`, `shared/`). Use existing API layer patterns and mock data for Activity/Members. Keep all changes frontend-only and backward-compatible with current API contracts.

**Tech Stack:** React 18, TypeScript, Vite, Vitest, React Testing Library, native EventSource, CSS Modules-ready (current: global CSS)

---

## Current State Assessment

### ✅ Already Implemented (29 tests passing)
- `LaunchPage` - Task creation with playbook selection
- `WorkspaceShell` - Persistent navigation with TopBar + WorkspaceNav
- `WorkspaceHomePage` - Control center with 4 panels
- `TasksPage` - List/board/my-tasks views
- `TaskPage` - Full collaboration surface with SSE
- `DeliverablesPage` + `DeliverableDetailPage`
- `ApprovalsPage` - Approval queue
- `InboxPage` - Personal inbox
- `MyWorkPage` - Executor-focused view

### ❌ Missing / Placeholder
- `ActivityPage` - Shows placeholder only
- `MembersPage` - Shows placeholder only
- No unified loading/error/empty states across pages

### 📝 Scope Out of This Plan
- Code splitting / lazy loading (separate performance optimization plan)
- Visual regression testing (future enhancement)
- Real-time activity updates via SSE (future feature)

---

## File Structure

### New Files to Create

**Pages (Features):**
- `frontend/src/features/activity/ActivityPage.tsx` - Workspace activity feed
- `frontend/src/features/activity/ActivityFilters.tsx` - Filter controls
- `frontend/src/features/members/MembersPage.tsx` - Team members list
- `frontend/src/features/members/MemberCard.tsx` - Individual member display

**Shared UI Components:**
- `frontend/src/shared/ui/LoadingState.tsx` - Consistent loading spinner
- `frontend/src/shared/ui/ErrorState.tsx` - Error with retry
- `frontend/src/shared/ui/EmptyState.tsx` - Empty with context
- `frontend/src/shared/ui/PageHeader.tsx` - Reusable page header
- `frontend/src/shared/ui/index.ts` - UI components index

**API Layer:**
- `frontend/src/shared/api/activity.ts` - Activity API client
- `frontend/src/shared/api/members.ts` - Members API client

**Entity Types:**
- `frontend/src/entities/activity/types.ts` - Activity domain types
- `frontend/src/entities/member/types.ts` - Member domain types

**Tests:**
- `frontend/src/test/activity-page.test.tsx`
- `frontend/src/test/members-page.test.tsx`
- `frontend/src/test/ui-states.test.tsx`

### Files to Modify

**Router:**
- `frontend/src/app/router.tsx` - Wire ActivityPage and MembersPage

**Styles:**
- `frontend/src/app/styles.css` - Add UI state styles, page header styles, activity/members styles

**Existing Pages (for unified states):**
- `frontend/src/features/workspace-home/WorkspaceHomePage.tsx` - Add unified states
- `frontend/src/features/tasks/TasksPage.tsx` - Add unified states
- `frontend/src/features/deliverables/DeliverablesPage.tsx` - Add unified states
- `frontend/src/features/approvals/ApprovalsPage.tsx` - Add unified states

---

## Task 1: Create Shared UI State Components

**Files:**
- Create: `frontend/src/shared/ui/LoadingState.tsx`
- Create: `frontend/src/shared/ui/ErrorState.tsx`
- Create: `frontend/src/shared/ui/EmptyState.tsx`
- Create: `frontend/src/shared/ui/PageHeader.tsx`
- Create: `frontend/src/shared/ui/index.ts`
- Test: `frontend/src/test/ui-states.test.tsx`
- Modify: `frontend/src/app/styles.css`

- [ ] **Step 1: Create shared UI directory**

Run: `mkdir -p /Users/nicholasl/Documents/build-whatever/decacan/frontend/src/shared/ui`

- [ ] **Step 2: Write failing UI state tests**

Create `frontend/src/test/ui-states.test.tsx`:

```tsx
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../shared/ui";

describe("UI State Components", () => {
  describe("LoadingState", () => {
    it("renders loading spinner with message", () => {
      render(<LoadingState message="Loading tasks..." />);
      expect(screen.getByText("Loading tasks...")).toBeInTheDocument();
      expect(screen.getByRole("status")).toBeInTheDocument();
    });

    it("renders default message when none provided", () => {
      render(<LoadingState />);
      expect(screen.getByText("Loading...")).toBeInTheDocument();
    });
  });

  describe("ErrorState", () => {
    it("renders error message", () => {
      render(<ErrorState message="Failed to load" />);
      expect(screen.getByText("Something went wrong")).toBeInTheDocument();
      expect(screen.getByText("Failed to load")).toBeInTheDocument();
    });

    it("renders retry button when onRetry provided", async () => {
      const user = userEvent.setup();
      const onRetry = vi.fn();
      render(<ErrorState message="Failed to load" onRetry={onRetry} />);
      
      const retryButton = screen.getByRole("button", { name: /retry/i });
      expect(retryButton).toBeInTheDocument();
      
      await user.click(retryButton);
      expect(onRetry).toHaveBeenCalledTimes(1);
    });

    it("does not render retry button when onRetry not provided", () => {
      render(<ErrorState message="Failed to load" />);
      expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });
  });

  describe("EmptyState", () => {
    it("renders title and message", () => {
      render(<EmptyState title="No tasks" message="Tasks will appear here" />);
      expect(screen.getByText("No tasks")).toBeInTheDocument();
      expect(screen.getByText("Tasks will appear here")).toBeInTheDocument();
    });

    it("renders action button when action provided", async () => {
      const user = userEvent.setup();
      const onClick = vi.fn();
      render(
        <EmptyState
          title="No tasks"
          message="Tasks will appear here"
          action={{ label: "Create task", onClick }}
        />
      );
      
      const actionButton = screen.getByRole("button", { name: "Create task" });
      expect(actionButton).toBeInTheDocument();
      
      await user.click(actionButton);
      expect(onClick).toHaveBeenCalledTimes(1);
    });
  });

  describe("PageHeader", () => {
    it("renders title", () => {
      render(<PageHeader title="Activity" />);
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Activity");
    });

    it("renders subtitle when provided", () => {
      render(<PageHeader title="Activity" subtitle="Recent workspace events" />);
      expect(screen.getByText("Recent workspace events")).toBeInTheDocument();
    });

    it("does not render subtitle when not provided", () => {
      render(<PageHeader title="Activity" />);
      expect(screen.queryByText(/recent/i)).not.toBeInTheDocument();
    });
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- --run src/test/ui-states.test.tsx`

Expected: FAIL - Components don't exist or imports fail

- [ ] **Step 4: Create LoadingState component**

Create `frontend/src/shared/ui/LoadingState.tsx`:

```tsx
interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading..." }: LoadingStateProps) {
  return (
    <div className="ui-state loading-state" role="status" aria-live="polite">
      <div className="loading-spinner" />
      <p className="loading-message">{message}</p>
    </div>
  );
}
```

- [ ] **Step 5: Create ErrorState component**

Create `frontend/src/shared/ui/ErrorState.tsx`:

```tsx
interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="ui-state error-state" role="alert">
      <p className="error-title">Something went wrong</p>
      <p className="error-message">{message}</p>
      {onRetry && (
        <button type="button" className="secondary-button" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 6: Create EmptyState component**

Create `frontend/src/shared/ui/EmptyState.tsx`:

```tsx
interface EmptyStateProps {
  title: string;
  message: string;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function EmptyState({ title, message, action }: EmptyStateProps) {
  return (
    <div className="ui-state empty-state">
      <p className="empty-title">{title}</p>
      <p className="empty-message">{message}</p>
      {action && (
        <button type="button" className="secondary-button" onClick={action.onClick}>
          {action.label}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 7: Create PageHeader component**

Create `frontend/src/shared/ui/PageHeader.tsx`:

```tsx
interface PageHeaderProps {
  title: string;
  subtitle?: string;
}

export function PageHeader({ title, subtitle }: PageHeaderProps) {
  return (
    <header className="page-header">
      <h1>{title}</h1>
      {subtitle && <p className="page-subtitle">{subtitle}</p>}
    </header>
  );
}
```

- [ ] **Step 8: Create UI components index**

Create `frontend/src/shared/ui/index.ts`:

```tsx
export { LoadingState } from "./LoadingState";
export { ErrorState } from "./ErrorState";
export { EmptyState } from "./EmptyState";
export { PageHeader } from "./PageHeader";
```

- [ ] **Step 9: Add CSS styles**

Add to `frontend/src/app/styles.css` at the end of the file (after existing content):

```css
/* UI State Components */
.ui-state {
  display: grid;
  place-items: center;
  gap: 16px;
  padding: 48px 24px;
  text-align: center;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(24, 19, 17, 0.1);
  border-top-color: #181311;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-message {
  margin: 0;
  color: rgba(24, 19, 17, 0.7);
}

.error-state {
  color: rgba(119, 50, 43, 0.9);
}

.error-title {
  margin: 0;
  font-weight: 700;
  font-size: 1.1rem;
}

.error-message {
  margin: 0;
  opacity: 0.8;
}

.empty-title {
  margin: 0;
  font-weight: 700;
  font-size: 1.2rem;
}

.empty-message {
  margin: 0;
  color: rgba(24, 19, 17, 0.7);
  max-width: 400px;
}

/* Page Header */
.page-header {
  margin-bottom: 32px;
}

.page-header h1 {
  margin: 0 0 8px;
  font-size: 2rem;
}

.page-subtitle {
  margin: 0;
  color: rgba(24, 19, 17, 0.7);
}
```

- [ ] **Step 10: Run tests to verify they pass**

Run: `npm test -- --run src/test/ui-states.test.tsx`

Expected: PASS (10 tests)

- [ ] **Step 11: Commit**

```bash
git add frontend/src/shared/ui frontend/src/test/ui-states.test.tsx frontend/src/app/styles.css
git commit -m "feat: add shared UI state components (loading, error, empty, header)"
```

---

## Task 2: Implement Activity Page

**Files:**
- Create: `frontend/src/entities/activity/types.ts`
- Create: `frontend/src/shared/api/activity.ts`
- Create: `frontend/src/features/activity/ActivityFilters.tsx`
- Create: `frontend/src/features/activity/ActivityPage.tsx`
- Create: `frontend/src/test/activity-page.test.tsx`
- Modify: `frontend/src/app/router.tsx`
- Modify: `frontend/src/app/styles.css`

- [ ] **Step 1: Create activity feature directory**

Run: `mkdir -p /Users/nicholasl/Documents/build-whatever/decacan/frontend/src/features/activity`

- [ ] **Step 2: Write failing Activity page test**

Create `frontend/src/test/activity-page.test.tsx`:

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, beforeEach } from "vitest";
import { ActivityPage } from "../features/activity/ActivityPage";

describe("ActivityPage", () => {
  beforeEach(() => {
    window.history.replaceState({}, "", "/workspaces/workspace-1/activity");
  });

  it("renders activity feed with events", async () => {
    render(<ActivityPage workspaceId="workspace-1" />);
    
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Activity");
    expect(screen.getByText("Recent workspace events")).toBeInTheDocument();
    
    // Should show loading initially
    expect(screen.getByText("Loading activity...")).toBeInTheDocument();
    
    // Then show events
    await waitFor(() => {
      expect(screen.getByText(/Alice requested approval for "Review summary.md"/)).toBeInTheDocument();
    }, { timeout: 1000 });
    
    expect(screen.getByText(/DevAgent completed/)).toBeInTheDocument();
  });

  it("filters activity by type", async () => {
    const user = userEvent.setup();
    render(<ActivityPage workspaceId="workspace-1" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Alice/)).toBeInTheDocument();
    });
    
    const filterSelect = screen.getByLabelText("Filter by type");
    expect(filterSelect).toBeInTheDocument();
    
    // Change filter to task_completed
    await user.selectOptions(filterSelect, "task_completed");
    
    // Should only show task_completed events
    await waitFor(() => {
      expect(screen.getByText(/DevAgent completed/)).toBeInTheDocument();
    });
  });

  it("shows empty state when filter returns no results", async () => {
    const user = userEvent.setup();
    render(<ActivityPage workspaceId="workspace-1" />);
    
    await waitFor(() => {
      expect(screen.getByText(/Alice/)).toBeInTheDocument();
    });
    
    // Filter to member_joined (no mock data for this type)
    const filterSelect = screen.getByLabelText("Filter by type");
    await user.selectOptions(filterSelect, "member_joined");
    
    await waitFor(() => {
      expect(screen.getByText("No activity found")).toBeInTheDocument();
    });
  });

  it("handles errors gracefully", async () => {
    const user = userEvent.setup();
    // Render with invalid workspace to trigger error
    render(<ActivityPage workspaceId="error-workspace" />);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
    
    // Should have retry button
    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
    
    // Clicking retry should attempt to reload
    await user.click(retryButton);
    expect(screen.getByText("Loading activity...")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- --run src/test/activity-page.test.tsx`

Expected: FAIL - ActivityPage and dependencies don't exist

- [ ] **Step 4: Create Activity entity types**

Create `frontend/src/entities/activity/types.ts`:

```tsx
export type ActivityEventType = 
  | "task_created" 
  | "task_completed" 
  | "approval_requested" 
  | "approval_resolved" 
  | "deliverable_created" 
  | "member_joined";

export interface ActivityEvent {
  id: string;
  type: ActivityEventType;
  actor: {
    id: string;
    name: string;
  };
  target: {
    type: "task" | "deliverable" | "approval" | "workspace";
    id: string;
    title: string;
  };
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface ActivityFilters {
  types?: ActivityEventType[];
  actorId?: string;
  dateFrom?: string;
  dateTo?: string;
}
```

- [ ] **Step 5: Create Activity API client**

Create `frontend/src/shared/api/activity.ts`:

```tsx
import type { ActivityEvent, ActivityEventType, ActivityFilters } from "../../entities/activity/types";

const MOCK_ACTIVITY: ActivityEvent[] = [
  {
    id: "act-1",
    type: "approval_requested",
    actor: { id: "user-1", name: "Alice" },
    target: { type: "approval", id: "appr-1", title: "Review summary.md" },
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
  },
  {
    id: "act-2",
    type: "task_completed",
    actor: { id: "agent-1", name: "DevAgent" },
    target: { type: "task", id: "task-1", title: "Refactor auth module" },
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
  },
  {
    id: "act-3",
    type: "deliverable_created",
    actor: { id: "user-2", name: "Bob" },
    target: { type: "deliverable", id: "del-1", title: "API Documentation" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
  },
  {
    id: "act-4",
    type: "task_created",
    actor: { id: "user-1", name: "Alice" },
    target: { type: "task", id: "task-2", title: "Update README" },
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
  },
];

export async function fetchWorkspaceActivity(
  workspaceId: string,
  filters?: ActivityFilters,
): Promise<ActivityEvent[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  // Simulate error for testing
  if (workspaceId === "error-workspace") {
    throw new Error("Failed to fetch activity data");
  }
  
  let filtered = [...MOCK_ACTIVITY];
  
  // Apply type filter
  if (filters?.types && filters.types.length > 0) {
    filtered = filtered.filter(event => filters.types?.includes(event.type));
  }
  
  return filtered;
}

export function getEventTypeLabel(type: ActivityEventType): string {
  const labels: Record<ActivityEventType, string> = {
    task_created: "Task Created",
    task_completed: "Task Completed",
    approval_requested: "Approval Requested",
    approval_resolved: "Approval Resolved",
    deliverable_created: "Deliverable Created",
    member_joined: "Member Joined",
  };
  return labels[type];
}
```

- [ ] **Step 6: Create ActivityFilters component**

Create `frontend/src/features/activity/ActivityFilters.tsx`:

```tsx
import { getEventTypeLabel, type ActivityEventType, type ActivityFilters } from "../../entities/activity/types";

interface ActivityFiltersProps {
  filters: ActivityFilters;
  onChange: (filters: ActivityFilters) => void;
}

const EVENT_TYPES: ActivityEventType[] = [
  "task_created",
  "task_completed",
  "approval_requested",
  "approval_resolved",
  "deliverable_created",
  "member_joined",
];

export function ActivityFilters({ filters, onChange }: ActivityFiltersProps) {
  return (
    <div className="activity-filters">
      <label htmlFor="type-filter">Filter by type</label>
      <select
        id="type-filter"
        value={filters.types?.[0] ?? ""}
        onChange={(e) => {
          const value = e.target.value as ActivityEventType | "";
          onChange({
            ...filters,
            types: value ? [value] : undefined,
          });
        }}
      >
        <option value="">All types</option>
        {EVENT_TYPES.map((type) => (
          <option key={type} value={type}>
            {getEventTypeLabel(type)}
          </option>
        ))}
      </select>
    </div>
  );
}
```

- [ ] **Step 7: Create ActivityPage component**

Create `frontend/src/features/activity/ActivityPage.tsx`:

```tsx
import { useEffect, useState } from "react";
import type { ActivityEvent, ActivityFilters } from "../../entities/activity/types";
import { fetchWorkspaceActivity } from "../../shared/api/activity";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../../shared/ui";
import { ActivityFilters } from "./ActivityFilters";

interface ActivityPageProps {
  workspaceId: string;
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function getEventDescription(event: ActivityEvent): string {
  const actor = event.actor.name;
  const target = event.target.title;

  switch (event.type) {
    case "task_created":
      return `${actor} created task "${target}"`;
    case "task_completed":
      return `${actor} completed "${target}"`;
    case "approval_requested":
      return `${actor} requested approval for "${target}"`;
    case "approval_resolved":
      return `${actor} resolved approval for "${target}"`;
    case "deliverable_created":
      return `${actor} created deliverable "${target}"`;
    case "member_joined":
      return `${actor} joined the workspace`;
    default:
      return `${actor} performed action on "${target}"`;
  }
}

export function ActivityPage({ workspaceId }: ActivityPageProps) {
  const [events, setEvents] = useState<ActivityEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [filters, setFilters] = useState<ActivityFilters>({});

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchWorkspaceActivity(workspaceId, filters);
        if (!cancelled) {
          setEvents(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to load activity"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [workspaceId, filters]);

  if (loading) {
    return (
      <section className="activity-page">
        <PageHeader title="Activity" subtitle="Recent workspace events" />
        <LoadingState message="Loading activity..." />
      </section>
    );
  }

  if (error) {
    return (
      <section className="activity-page">
        <PageHeader title="Activity" subtitle="Recent workspace events" />
        <ErrorState
          message={error.message}
          onRetry={() => {
            setFilters({ ...filters });
          }}
        />
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="activity-page">
        <PageHeader title="Activity" subtitle="Recent workspace events" />
        <ActivityFilters filters={filters} onChange={setFilters} />
        <EmptyState
          title="No activity found"
          message={
            filters.types?.length 
              ? "No events match the selected filter. Try changing the filter criteria."
              : "Workspace activity will appear here as tasks progress and team members collaborate."
          }
        />
      </section>
    );
  }

  return (
    <section className="activity-page">
      <PageHeader title="Activity" subtitle="Recent workspace events" />
      <ActivityFilters filters={filters} onChange={setFilters} />

      <ul className="activity-feed" role="list">
        {events.map((event) => (
          <li key={event.id} className="activity-item">
            <span className="activity-time">{formatRelativeTime(event.createdAt)}</span>
            <p className="activity-description">{getEventDescription(event)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

- [ ] **Step 8: Add Activity page styles**

Add to `frontend/src/app/styles.css` at the end:

```css
/* Activity Page */
.activity-page {
  max-width: 800px;
}

.activity-filters {
  margin-bottom: 24px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.activity-filters label {
  font-size: 0.9rem;
  color: rgba(24, 19, 17, 0.7);
}

.activity-filters select {
  padding: 8px 12px;
  border: 1px solid rgba(24, 19, 17, 0.2);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.8);
  font: inherit;
  cursor: pointer;
}

.activity-feed {
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 16px;
}

.activity-item {
  padding: 16px 20px;
  background: rgba(255, 252, 246, 0.7);
  border: 1px solid rgba(24, 19, 17, 0.08);
  border-radius: 12px;
  transition: box-shadow 0.2s ease;
}

.activity-item:hover {
  box-shadow: 0 4px 12px rgba(24, 19, 17, 0.08);
}

.activity-time {
  font-size: 0.85rem;
  color: rgba(24, 19, 17, 0.6);
  display: block;
  margin-bottom: 4px;
}

.activity-description {
  margin: 0;
  line-height: 1.5;
}
```

- [ ] **Step 9: Wire ActivityPage in router**

Read `frontend/src/app/router.tsx` to understand current structure, then modify:

```tsx
// Add import near other imports at top
import { ActivityPage } from "../features/activity/ActivityPage";

// Find the section routing logic and add after approvals case:
} else if (workspaceRoute.section === "approvals") {
  workspaceSectionContent = <ApprovalsPage workspaceId={workspaceRoute.workspaceId} />;
} else if (workspaceRoute.section === "activity") {
  workspaceSectionContent = <ActivityPage workspaceId={workspaceRoute.workspaceId} />;
} else {
  workspaceSectionContent = <WorkspaceSectionPlaceholder section={workspaceRoute.section} />;
}
```

- [ ] **Step 10: Run tests to verify they pass**

Run: `npm test -- --run src/test/activity-page.test.tsx`

Expected: PASS (4 tests)

- [ ] **Step 11: Commit**

```bash
git add frontend/src/features/activity frontend/src/entities/activity frontend/src/shared/api/activity.ts frontend/src/test/activity-page.test.tsx frontend/src/app/router.tsx frontend/src/app/styles.css
git commit -m "feat: implement Activity page with filters and feed"
```

---

## Task 3: Implement Members Page

**Files:**
- Create: `frontend/src/entities/member/types.ts`
- Create: `frontend/src/shared/api/members.ts`
- Create: `frontend/src/features/members/MemberCard.tsx`
- Create: `frontend/src/features/members/MembersPage.tsx`
- Create: `frontend/src/test/members-page.test.tsx`
- Modify: `frontend/src/app/router.tsx`
- Modify: `frontend/src/app/styles.css`

- [ ] **Step 1: Create members feature directory**

Run: `mkdir -p /Users/nicholasl/Documents/build-whatever/decacan/frontend/src/features/members`

- [ ] **Step 2: Write failing Members page test**

Create `frontend/src/test/members-page.test.tsx`:

```tsx
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { MembersPage } from "../features/members/MembersPage";

describe("MembersPage", () => {
  it("renders workspace members list", async () => {
    render(<MembersPage workspaceId="workspace-1" />);
    
    expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent("Members");
    
    await waitFor(() => {
      expect(screen.getByText("Alice Chen")).toBeInTheDocument();
    }, { timeout: 1000 });
    
    expect(screen.getByText("Bob Smith")).toBeInTheDocument();
    expect(screen.getByText("DevAgent")).toBeInTheDocument();
  });

  it("shows member roles and workload", async () => {
    render(<MembersPage workspaceId="workspace-1" />);
    
    await waitFor(() => {
      expect(screen.getByText("Admin")).toBeInTheDocument();
    });
    
    expect(screen.getByText("Lead")).toBeInTheDocument();
    expect(screen.getByText("Executor")).toBeInTheDocument();
    
    // Check workload
    expect(screen.getAllByText(/active tasks/i)[0]).toBeInTheDocument();
    expect(screen.getAllByText(/pending approvals/i)[0]).toBeInTheDocument();
  });

  it("shows recent activity for members", async () => {
    render(<MembersPage workspaceId="workspace-1" />);
    
    await waitFor(() => {
      expect(screen.getByText("Alice Chen")).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Approved PR #234/)).toBeInTheDocument();
    expect(screen.getByText(/Completed task 'Refactor API'/)).toBeInTheDocument();
  });

  it("handles errors with retry", async () => {
    const user = userEvent.setup();
    render(<MembersPage workspaceId="error-workspace" />);
    
    await waitFor(() => {
      expect(screen.getByText(/failed to load/i)).toBeInTheDocument();
    });
    
    const retryButton = screen.getByRole("button", { name: /retry/i });
    expect(retryButton).toBeInTheDocument();
    
    await user.click(retryButton);
    expect(screen.getByText("Loading members...")).toBeInTheDocument();
  });
});
```

- [ ] **Step 3: Run test to verify it fails**

Run: `npm test -- --run src/test/members-page.test.tsx`

Expected: FAIL - MembersPage doesn't exist

- [ ] **Step 4: Create Member entity types**

Create `frontend/src/entities/member/types.ts`:

```tsx
export type MemberRole = "admin" | "lead" | "executor" | "viewer";

export interface Member {
  id: string;
  name: string;
  email: string;
  role: MemberRole;
  avatarUrl?: string;
  joinedAt: string;
  workload: {
    activeTasks: number;
    pendingApprovals: number;
  };
  recentActivity: {
    lastActive: string;
    recentAction: string;
  };
}
```

- [ ] **Step 5: Create Members API client**

Create `frontend/src/shared/api/members.ts`:

```tsx
import type { Member } from "../../entities/member/types";

const MOCK_MEMBERS: Member[] = [
  {
    id: "user-1",
    name: "Alice Chen",
    email: "alice@example.com",
    role: "admin",
    joinedAt: "2024-01-15T00:00:00Z",
    workload: {
      activeTasks: 3,
      pendingApprovals: 1,
    },
    recentActivity: {
      lastActive: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
      recentAction: "Approved PR #234",
    },
  },
  {
    id: "user-2",
    name: "Bob Smith",
    email: "bob@example.com",
    role: "lead",
    joinedAt: "2024-02-20T00:00:00Z",
    workload: {
      activeTasks: 5,
      pendingApprovals: 0,
    },
    recentActivity: {
      lastActive: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      recentAction: "Created task 'Update docs'",
    },
  },
  {
    id: "agent-1",
    name: "DevAgent",
    email: "agent@decacan.local",
    role: "executor",
    joinedAt: "2024-03-01T00:00:00Z",
    workload: {
      activeTasks: 8,
      pendingApprovals: 2,
    },
    recentActivity: {
      lastActive: new Date(Date.now() - 1000 * 60 * 2).toISOString(),
      recentAction: "Completed task 'Refactor API'",
    },
  },
];

export async function fetchWorkspaceMembers(workspaceId: string): Promise<Member[]> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  
  if (workspaceId === "error-workspace") {
    throw new Error("Failed to fetch members data");
  }
  
  return MOCK_MEMBERS;
}
```

- [ ] **Step 6: Create MemberCard component**

Create `frontend/src/features/members/MemberCard.tsx`:

```tsx
import type { Member, MemberRole } from "../../entities/member/types";

interface MemberCardProps {
  member: Member;
}

function formatRole(role: MemberRole): string {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function getRoleBadgeClass(role: MemberRole): string {
  switch (role) {
    case "admin":
      return "role-admin";
    case "lead":
      return "role-lead";
    case "executor":
      return "role-executor";
    default:
      return "role-viewer";
  }
}

function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / (1000 * 60));

  if (diffMins < 1) return "just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  return "recently";
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

export function MemberCard({ member }: MemberCardProps) {
  return (
    <article className="member-card">
      <div className="member-avatar">
        {member.avatarUrl ? (
          <img src={member.avatarUrl} alt={member.name} />
        ) : (
          <span className="member-initials">{getInitials(member.name)}</span>
        )}
      </div>

      <div className="member-info">
        <h3 className="member-name">{member.name}</h3>
        <p className="member-email">{member.email}</p>
        <span className={`member-role ${getRoleBadgeClass(member.role)}`}>
          {formatRole(member.role)}
        </span>
      </div>

      <div className="member-workload">
        <div className="workload-item">
          <span className="workload-value">{member.workload.activeTasks}</span>
          <span className="workload-label">Active tasks</span>
        </div>
        <div className="workload-item">
          <span className="workload-value">{member.workload.pendingApprovals}</span>
          <span className="workload-label">Pending approvals</span>
        </div>
      </div>

      <div className="member-activity">
        <p className="activity-action">{member.recentActivity.recentAction}</p>
        <p className="activity-time">{formatRelativeTime(member.recentActivity.lastActive)}</p>
      </div>
    </article>
  );
}
```

- [ ] **Step 7: Create MembersPage component**

Create `frontend/src/features/members/MembersPage.tsx`:

```tsx
import { useEffect, useState } from "react";
import type { Member } from "../../entities/member/types";
import { fetchWorkspaceMembers } from "../../shared/api/members";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../../shared/ui";
import { MemberCard } from "./MemberCard";

interface MembersPageProps {
  workspaceId: string;
}

export function MembersPage({ workspaceId }: MembersPageProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);

      try {
        const data = await fetchWorkspaceMembers(workspaceId);
        if (!cancelled) {
          setMembers(data);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof Error ? err : new Error("Failed to load members"));
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [workspaceId]);

  if (loading) {
    return (
      <section className="members-page">
        <PageHeader title="Members" subtitle="Workspace team" />
        <LoadingState message="Loading members..." />
      </section>
    );
  }

  if (error) {
    return (
      <section className="members-page">
        <PageHeader title="Members" subtitle="Workspace team" />
        <ErrorState
          message={error.message}
          onRetry={() => {
            // Trigger reload by toggling a state or calling load again
            setMembers([]);
            setError(null);
            setLoading(true);
          }}
        />
      </section>
    );
  }

  if (members.length === 0) {
    return (
      <section className="members-page">
        <PageHeader title="Members" subtitle="Workspace team" />
        <EmptyState
          title="No members yet"
          message="Invite team members to collaborate on this workspace."
        />
      </section>
    );
  }

  return (
    <section className="members-page">
      <PageHeader title="Members" subtitle={`${members.length} team members`} />

      <div className="members-grid" role="list">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} />
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 8: Add Members page styles**

Add to `frontend/src/app/styles.css` at the end:

```css
/* Members Page */
.members-page {
  max-width: 900px;
}

.members-grid {
  display: grid;
  gap: 16px;
}

.member-card {
  display: grid;
  grid-template-columns: auto 1fr auto auto;
  gap: 20px;
  align-items: center;
  padding: 20px;
  background: rgba(255, 252, 246, 0.7);
  border: 1px solid rgba(24, 19, 17, 0.08);
  border-radius: 16px;
  transition: box-shadow 0.2s ease;
}

.member-card:hover {
  box-shadow: 0 4px 12px rgba(24, 19, 17, 0.08);
}

.member-avatar {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(24, 19, 17, 0.1);
  display: grid;
  place-items: center;
  overflow: hidden;
  flex-shrink: 0;
}

.member-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.member-initials {
  font-weight: 700;
  font-size: 1.1rem;
  color: rgba(24, 19, 17, 0.7);
}

.member-info {
  display: grid;
  gap: 4px;
  min-width: 0;
}

.member-name {
  margin: 0;
  font-size: 1.1rem;
  font-weight: 600;
}

.member-email {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(24, 19, 17, 0.6);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-role {
  width: fit-content;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
}

.role-admin {
  background: rgba(45, 94, 62, 0.15);
  color: rgba(45, 94, 62, 0.9);
}

.role-lead {
  background: rgba(45, 80, 120, 0.15);
  color: rgba(45, 80, 120, 0.9);
}

.role-executor {
  background: rgba(120, 80, 45, 0.15);
  color: rgba(120, 80, 45, 0.9);
}

.role-viewer {
  background: rgba(24, 19, 17, 0.1);
  color: rgba(24, 19, 17, 0.7);
}

.member-workload {
  display: flex;
  gap: 24px;
  flex-shrink: 0;
}

.workload-item {
  text-align: center;
}

.workload-value {
  display: block;
  font-size: 1.4rem;
  font-weight: 700;
  line-height: 1;
}

.workload-label {
  font-size: 0.75rem;
  color: rgba(24, 19, 17, 0.6);
}

.member-activity {
  text-align: right;
  min-width: 180px;
  flex-shrink: 0;
}

.member-activity .activity-action {
  margin: 0;
  font-size: 0.9rem;
  color: rgba(24, 19, 17, 0.8);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.member-activity .activity-time {
  margin: 4px 0 0;
  font-size: 0.8rem;
  color: rgba(24, 19, 17, 0.5);
}

@media (max-width: 768px) {
  .member-card {
    grid-template-columns: auto 1fr;
    gap: 16px;
  }
  
  .member-workload,
  .member-activity {
    grid-column: 1 / -1;
    display: flex;
    justify-content: flex-start;
    gap: 24px;
    text-align: left;
  }
  
  .member-activity {
    flex-direction: column;
    gap: 4px;
  }
}
```

- [ ] **Step 9: Wire MembersPage in router**

Read `frontend/src/app/router.tsx` and modify:

```tsx
// Add import near other imports
import { MembersPage } from "../features/members/MembersPage";

// Find the section routing and add after activity case:
} else if (workspaceRoute.section === "activity") {
  workspaceSectionContent = <ActivityPage workspaceId={workspaceRoute.workspaceId} />;
} else if (workspaceRoute.section === "members") {
  workspaceSectionContent = <MembersPage workspaceId={workspaceRoute.workspaceId} />;
} else {
  workspaceSectionContent = <WorkspaceSectionPlaceholder section={workspaceRoute.section} />;
}
```

- [ ] **Step 10: Run tests to verify they pass**

Run: `npm test -- --run src/test/members-page.test.tsx`

Expected: PASS (4 tests)

- [ ] **Step 11: Commit**

```bash
git add frontend/src/features/members frontend/src/entities/member frontend/src/shared/api/members.ts frontend/src/test/members-page.test.tsx frontend/src/app/router.tsx frontend/src/app/styles.css
git commit -m "feat: implement Members page with cards and workload display"
```

---

## Task 4: Apply Unified States to Existing Pages

**Files:**
- Modify: `frontend/src/features/workspace-home/WorkspaceHomePage.tsx`
- Modify: `frontend/src/features/tasks/TasksPage.tsx`
- Modify: `frontend/src/features/deliverables/DeliverablesPage.tsx`
- Modify: `frontend/src/features/approvals/ApprovalsPage.tsx`

### Step-by-step modifications for each page:

- [ ] **Step 1: Update WorkspaceHomePage**

Read `frontend/src/features/workspace-home/WorkspaceHomePage.tsx` first, then modify:

```tsx
// Add import at the top
import { EmptyState, ErrorState, LoadingState, PageHeader } from "../../shared/ui";

// Replace any inline loading/error states with shared components
// For example, if there's a loading state:
if (loading) {
  return (
    <section className="workspace-home-page">
      <PageHeader title="Home" subtitle="Workspace overview" />
      <LoadingState message="Loading workspace data..." />
    </section>
  );
}

// Replace error state
if (error) {
  return (
    <section className="workspace-home-page">
      <PageHeader title="Home" subtitle="Workspace overview" />
      <ErrorState
        message={error.message}
        onRetry={() => {
          // retry logic
        }}
      />
    </section>
  );
}

// Add empty state if data is empty
if (!data || data.length === 0) {
  return (
    <section className="workspace-home-page">
      <PageHeader title="Home" subtitle="Workspace overview" />
      <EmptyState
        title="No data available"
        message="Workspace data will appear here once tasks and activities are created."
      />
    </section>
  );
}
```

- [ ] **Step 2: Update TasksPage**

Read `frontend/src/features/tasks/TasksPage.tsx` and apply similar changes:
- Add shared UI imports
- Replace inline loading/error states
- Add empty state if task list is empty

- [ ] **Step 3: Update DeliverablesPage**

Read `frontend/src/features/deliverables/DeliverablesPage.tsx` and apply similar changes:
- Add shared UI imports
- Replace inline loading/error states
- Add empty state if deliverables list is empty

- [ ] **Step 4: Update ApprovalsPage**

Read `frontend/src/features/approvals/ApprovalsPage.tsx` and apply similar changes:
- Add shared UI imports
- Replace inline loading/error states
- Add empty state if approvals list is empty

- [ ] **Step 5: Run all tests to verify no regressions**

Run: `npm test`

Expected: All 37 tests PASS (29 original + 10 UI + 4 Activity + 4 Members)

- [ ] **Step 6: Commit**

```bash
git add frontend/src/features/workspace-home frontend/src/features/tasks frontend/src/features/deliverables frontend/src/features/approvals
git commit -m "refactor: apply unified UI states to existing pages"
```

---

## Task 5: Final Verification and Polish

**Files:**
- All test files
- All page files

- [ ] **Step 1: Run full test suite**

Run: `npm test`

Expected: All 37+ tests PASS

- [ ] **Step 2: Verify build**

Run: `npm run build`

Expected: Clean build with no errors

- [ ] **Step 3: Check TypeScript**

Run: `npx tsc --noEmit`

Expected: No TypeScript errors

- [ ] **Step 4: Run backend tests to ensure no breaking changes**

Run: `cargo test -p decacan-app --test http_smoke`

Expected: All backend tests PASS

- [ ] **Step 5: Verify router integration**

Run: `npm run dev` and test navigation to `/workspaces/:id/activity` and `/workspaces/:id/members`

Expected: ActivityPage and MembersPage render correctly

- [ ] **Step 6: Final commit**

```bash
git add .
git commit -m "feat: complete Activity and Members pages with unified UI states"
```

---

## Summary of Changes

### New Features
- **Activity Page**: Real-time workspace event feed with type filters
  - Supports 6 event types: task created/completed, approval requested/resolved, deliverable created, member joined
  - Relative time display (just now, 5m ago, 2h ago, etc.)
  - Smart empty states (distinguishes between no data and filtered results)
  
- **Members Page**: Team roster with workload and recent activity
  - Avatar with initials fallback
  - Role badges (Admin, Lead, Executor, Viewer) with color coding
  - Workload summary (active tasks, pending approvals)
  - Recent activity with timestamp
  - Responsive layout (adapts to mobile)

### Shared Components
- **LoadingState**: Consistent loading spinner with customizable message
- **ErrorState**: Error display with optional retry action
- **EmptyState**: Empty state with title, message, and optional action button
- **PageHeader**: Reusable page title/subtitle component
- **UI Index**: Centralized exports via `shared/ui/index.ts`

### Technical Improvements
- **Unified UI states**: All pages now use consistent loading, error, and empty states
- **Better error handling**: All data fetching includes error states with retry
- **Type safety**: New entity types for Activity and Member
- **Mock data**: Activity and Members APIs use realistic mock data
- **Responsive design**: Members page adapts to mobile screens

### Files Added (12)
- `frontend/src/shared/ui/LoadingState.tsx`
- `frontend/src/shared/ui/ErrorState.tsx`
- `frontend/src/shared/ui/EmptyState.tsx`
- `frontend/src/shared/ui/PageHeader.tsx`
- `frontend/src/shared/ui/index.ts`
- `frontend/src/entities/activity/types.ts`
- `frontend/src/shared/api/activity.ts`
- `frontend/src/features/activity/ActivityFilters.tsx`
- `frontend/src/features/activity/ActivityPage.tsx`
- `frontend/src/entities/member/types.ts`
- `frontend/src/shared/api/members.ts`
- `frontend/src/features/members/MemberCard.tsx`
- `frontend/src/features/members/MembersPage.tsx`

### Files Modified (6)
- `frontend/src/app/router.tsx` - Wire new pages
- `frontend/src/app/styles.css` - Add comprehensive styles
- `frontend/src/features/workspace-home/WorkspaceHomePage.tsx` - Add unified states
- `frontend/src/features/tasks/TasksPage.tsx` - Add unified states
- `frontend/src/features/deliverables/DeliverablesPage.tsx` - Add unified states
- `frontend/src/features/approvals/ApprovalsPage.tsx` - Add unified states

### Tests Added (3 files, 18 tests)
- `frontend/src/test/ui-states.test.tsx` (10 tests)
- `frontend/src/test/activity-page.test.tsx` (4 tests)
- `frontend/src/test/members-page.test.tsx` (4 tests)

**Total expected tests: 47** (29 existing + 18 new)

---

## Scope Exclusions (Future Plans)

The following items are intentionally excluded from this plan and can be addressed separately:

1. **Code splitting / lazy loading**: Would require refactoring all existing tests and adding default exports
2. **Real-time activity updates**: Activity feed currently loads once on mount; SSE integration for live updates
3. **Member management**: Adding/removing members, changing roles
4. **Activity pagination**: Current implementation shows all events; pagination for large workspaces
5. **Advanced filtering**: Date range filters, actor filters, combined filters
6. **Visual regression testing**: Screenshots comparison testing

These features can be implemented in future iterations once this foundation is solid.
