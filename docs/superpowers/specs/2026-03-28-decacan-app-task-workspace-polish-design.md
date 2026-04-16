# Decacan App Task Workspace Polish Design

> **架构更新（2026-04-16）**：项目已全面迁移至 TypeScript/Node.js，后端核心位于 `packages/orchestrator`。本文档中的 Rust/crates 相关实现细节为历史记录，当前技术栈为 Hono + Drizzle ORM + Zod。


## Goal

Polish the existing `decacan-app` task detail experience into a clearer two-column workstation. This round prioritizes a summary-first sidebar and a modest layer of live task feedback without turning the page into a chat or debugging console.

## Scope

This design extends the existing `launch -> task detail` flow. It does not add a dashboard, new routes, task search, or a full multi-task management system.

In scope:
- convert the task detail page into a stable two-column workstation
- add a summary-first context sidebar
- add a lightweight live activity strip and SSE-backed connection state
- keep approval and artifact actions easy to find
- surface recent tasks as secondary context

Out of scope:
- open-ended agent chat
- complex task switching
- client-side event patching
- new backend product entities

## Layout

The task page becomes a `Context Sidebar + Main Task Workspace` layout.

### Left Sidebar

The left side is context only. It should not become a second action surface.

Information order:
1. workspace
2. playbook
3. task status and status summary
4. plan progress summary
5. primary artifact shortcut
6. recent tasks

The page should still read correctly even if recent tasks are empty.

### Right Main Area

The right side remains the execution view.

Information order:
1. task header
2. live activity strip
3. plan and progress
4. approvals
5. artifacts
6. timeline

When approvals are pending, the approval panel stays above artifacts. Timeline remains supportive evidence, not the primary focal point.

## Live Activity

Live behavior should stay simple and legible:
- fetch the task detail snapshot on load
- subscribe to task SSE events
- show the latest product event in a compact strip
- show a lightweight connection state such as `Live`, `Reconnecting`, or `Offline`
- refetch the task snapshot when relevant events arrive

The frontend should not try to maintain a browser-side task state machine. The snapshot API remains the source of truth.

## Component Boundaries

Add or reshape the task-detail frontend into these units:

- `ContextSidebar`
  Renders workspace, playbook, status, progress, artifact shortcut, and recent tasks.
- `LiveActivityStrip`
  Renders latest event summary plus SSE connection state.
- `TaskPage`
  Owns the two-column composition and panel ordering.
- `useTaskDetail`
  Owns snapshot loading, SSE subscription, latest-event state, and reconnect state.

Existing panels such as `TaskHeader`, `PlanProgressPanel`, `ApprovalPanel`, `ArtifactPanel`, and `TimelinePanel` remain, but they render inside the new workstation structure.

## Data Expectations

This round should rely on existing frontend-consumed task aggregate data. If recent tasks need a new lightweight API, it should stay minimal and presentation-focused. The page should not block on richer backend redesign work.

## Testing

The primary verification is frontend behavior:
- task page renders a two-column workstation with summary sidebar content
- pending approval still appears ahead of artifact content
- latest event summary is visible
- SSE updates cause the live strip and task snapshot to refresh
- recent tasks render as secondary context when available

Rust-side contract work is only needed if a small supporting endpoint is introduced.
