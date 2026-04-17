# Decacan Workspaces Workbench Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **注意:** 本计划中的代码示例需要从 Rust 转换为 TypeScript 实现。核心逻辑和架构保持不变，仅变更语言实现。

**Goal:** Rebuild `apps/workspaces` home into a resume-first, template-driven workbench with a persistent workspace assistant dock, while keeping the workspace shell and task detail model consistent.

**Architecture:** Keep the existing workspace shell and route structure stable, and introduce a new workbench view-model layer that normalizes the current `/api/workspaces/:workspaceId/home` payload into a slot-based home contract with safe defaults. Implement the new home incrementally in four phases: typed template normalization, resume-first layout rendering, assistant dock behavior with task-detail handoff, and fallback/verification hardening.

**Tech Stack:** TypeScript, React 19, React Router 7, Vitest, Testing Library, Vite, existing `@decacan/ui` components

---

## File Structure Map

### Workbench domain and normalization

- Create: `apps/workspaces/src/entities/workbench/types.ts`
  Slot model, template model, assistant model, and normalized workbench view model.
- Create: `apps/workspaces/src/entities/workbench/defaultTemplate.ts`
  Default template and default assistant fallback values used when config is missing.
- Create: `apps/workspaces/src/entities/workbench/normalizeWorkspaceHome.ts`
  Maps the existing workspace-home API payload into the normalized workbench model.
- Create: `apps/workspaces/src/test/workbench-normalization.test.ts`
  Focused contract coverage for legacy payload normalization, slot requirements, and fallback behavior.
- Modify: `apps/workspaces/src/entities/workspace-home/types.ts`
  Add optional template, discussion, and assistant fields without breaking current backend compatibility.

### Resume-first home UI

- Create: `apps/workspaces/src/features/workspace-home/WorkbenchLayout.tsx`
  Main home grid with required slots and assistant dock column.
- Create: `apps/workspaces/src/features/workspace-home/ResumeStrip.tsx`
  Top-priority resume region and primary CTA rendering.
- Create: `apps/workspaces/src/features/workspace-home/CurrentWorkPanel.tsx`
  Current work cluster using active task summaries, deliverables, and resource hooks.
- Create: `apps/workspaces/src/features/workspace-home/MyQueuePanel.tsx`
  Queue panel for attention items, replies, blockers, and approvals.
- Create: `apps/workspaces/src/features/workspace-home/TeamActivityPanel.tsx`
  Collaboration activity stream for lower-tier workspace motion.
- Create: `apps/workspaces/src/features/workspace-home/DiscussionPanel.tsx`
  Thread/discussion panel with empty-state fallback until richer backend support arrives.
- Modify: `apps/workspaces/src/features/workspace-home/WorkspaceHomePage.tsx`
  Replace the old control-center stack with normalized workbench rendering.
- Modify: `apps/workspaces/src/test/workspace-home-page.test.tsx`
  Assert required regions, slot order, and resume-first rendering.

### Assistant dock and task-detail continuity

- Create: `apps/workspaces/src/features/workspace-home/WorkspaceAssistantDock.tsx`
  Persistent dock for ambient summary, contextual object focus, and action buttons.
- Create: `apps/workspaces/src/features/workspace-home/useAssistantDock.ts`
  Local state hook for ambient/contextual/escalated dock behavior.
- Create: `apps/workspaces/src/features/task-detail/AssistantContextNotice.tsx`
  Small task-detail banner or context block showing what the dock handed off.
- Modify: `apps/workspaces/src/features/task-detail/TaskPage.tsx`
  Read `location.state` handoff, default to the `agent` tab when arriving from the dock, and render continuity notice.
- Modify: `apps/workspaces/src/test/task-page.test.tsx`
  Verify dock-to-task-detail escalation preserves context and opens the expected collaboration state.

### Fallbacks, UI states, and docs

- Modify: `apps/workspaces/src/shared/api/workspace-home.ts`
  Keep the raw API fetch stable while exposing the workbench-normalization seam clearly.
- Modify: `apps/workspaces/src/test/ui-states.test.tsx`
  Cover panel-level loading/error/empty states in the new workbench context.
- Modify: `README.md`
  Document that `Workspace Home` is now template-driven with safe local fallback behavior, if the repo README still describes it as a generic control center.

---

## Phase 1: Contract And Normalization

### Task 1: Normalize the current home API into a slot-based workbench model

**Files:**
- Create: `apps/workspaces/src/entities/workbench/types.ts`
- Create: `apps/workspaces/src/entities/workbench/defaultTemplate.ts`
- Create: `apps/workspaces/src/entities/workbench/normalizeWorkspaceHome.ts`
- Create: `apps/workspaces/src/test/workbench-normalization.test.ts`
- Modify: `apps/workspaces/src/entities/workspace-home/types.ts`

- [ ] **Step 1: Write the failing normalization tests**

Create `apps/workspaces/src/test/workbench-normalization.test.ts`:

```ts
import { describe, expect, it } from "vitest";

import type { WorkspaceHomeData } from "../entities/workspace-home/types";
import { normalizeWorkspaceHome } from "../entities/workbench/normalizeWorkspaceHome";

const legacyPayload: WorkspaceHomeData = {
  attention: [
    {
      id: "attention-1",
      title: "Legal sign-off pending",
      reason: "Final copy is waiting for review.",
      severity: "high",
    },
  ],
  task_health: {
    running: 4,
    waiting_approval: 2,
    blocked: 1,
    completed_today: 9,
  },
  activity: [
    {
      id: "activity-1",
      message: "Campaign moved to final QA.",
      relative_time: "5m ago",
    },
  ],
  deliverables: [
    {
      id: "deliverable-1",
      label: "Release Notes Draft",
      canonical_path: "output/release-notes.md",
      status: "reviewing",
    },
  ],
  team_snapshot: [
    {
      id: "member-1",
      name: "Ari",
      role: "Project Lead",
      focus: "Final milestone coordination",
      status: "online",
    },
  ],
};

describe("normalizeWorkspaceHome", () => {
  it("produces the required phase-1 slots from the legacy home payload", () => {
    const model = normalizeWorkspaceHome("workspace-1", legacyPayload);

    expect(model.template.slot_order).toEqual([
      "resume",
      "current_work_primary",
      "queue_secondary",
      "collaboration_left",
      "collaboration_right",
      "assistant_dock",
    ]);
    expect(model.resume.primary_label).toContain("Resume");
    expect(model.queue.items).toHaveLength(1);
  });

  it("falls back to the default template and assistant summary when config is missing", () => {
    const model = normalizeWorkspaceHome("workspace-1", {
      ...legacyPayload,
      template: undefined,
      assistant: undefined,
    });

    expect(model.template.id).toBe("default-workbench");
    expect(model.assistant.state).toBe("ambient");
    expect(model.assistant.summary).toContain("Resume");
  });
});
```

- [ ] **Step 2: Run the test to confirm the normalization seam does not exist yet**

Run:

```bash
pnpm --filter decacan-workspaces test -- src/test/workbench-normalization.test.ts
```

Expected: FAIL with module-not-found or missing export errors for `normalizeWorkspaceHome`.

- [ ] **Step 3: Extend the raw home types with optional template and assistant fields**

Modify `apps/workspaces/src/entities/workspace-home/types.ts`:

```ts
export interface WorkspaceHomeTemplateConfig {
  id: string;
  title: string;
  slot_order: string[];
  labels?: Partial<Record<"task" | "deliverable" | "approval", string>>;
  primary_cta_label?: string;
}

export interface WorkspaceDiscussionItem {
  id: string;
  title: string;
  summary: string;
  status: "open" | "resolved";
}

export interface WorkspaceAssistantData {
  summary: string;
  suggested_actions: Array<{
    id: string;
    label: string;
    target_kind: "task" | "deliverable" | "discussion";
    target_id: string;
  }>;
}

export interface WorkspaceHomeData {
  attention: AttentionItem[];
  task_health: TaskHealth;
  activity: ActivityItem[];
  deliverables: DeliverableItem[];
  team_snapshot: TeamMember[];
  discussion?: WorkspaceDiscussionItem[];
  template?: WorkspaceHomeTemplateConfig;
  assistant?: WorkspaceAssistantData;
}
```

- [ ] **Step 4: Create the normalized workbench types and defaults**

Create `apps/workspaces/src/entities/workbench/types.ts`:

```ts
import type {
  AttentionItem,
  DeliverableItem,
  TaskHealth,
  TeamMember,
  ActivityItem,
  WorkspaceDiscussionItem,
} from "../workspace-home/types";

export type WorkbenchSlot =
  | "resume"
  | "current_work_primary"
  | "queue_secondary"
  | "collaboration_left"
  | "collaboration_right"
  | "assistant_dock";

export interface WorkbenchTemplate {
  id: string;
  title: string;
  slot_order: WorkbenchSlot[];
  primary_cta_label: string;
  labels: Record<"task" | "deliverable" | "approval", string>;
}

export interface ResumeModel {
  primary_label: string;
  title: string;
  detail: string;
  target_task_id?: string;
}

export interface QueueModel {
  items: AttentionItem[];
}

export interface AssistantDockModel {
  state: "ambient" | "contextual";
  summary: string;
  suggested_actions: Array<{
    id: string;
    label: string;
    target_kind: "task" | "deliverable" | "discussion";
    target_id: string;
  }>;
}

export interface WorkspaceWorkbenchModel {
  workspace_id: string;
  template: WorkbenchTemplate;
  resume: ResumeModel;
  current_work: {
    task_health: TaskHealth;
    deliverables: DeliverableItem[];
  };
  queue: QueueModel;
  activity: ActivityItem[];
  discussion: WorkspaceDiscussionItem[];
  team_snapshot: TeamMember[];
  assistant: AssistantDockModel;
}
```

Create `apps/workspaces/src/entities/workbench/defaultTemplate.ts`:

```ts
import type { AssistantDockModel, WorkbenchTemplate } from "./types";

export const defaultWorkbenchTemplate: WorkbenchTemplate = {
  id: "default-workbench",
  title: "Workspace Workbench",
  slot_order: [
    "resume",
    "current_work_primary",
    "queue_secondary",
    "collaboration_left",
    "collaboration_right",
    "assistant_dock",
  ],
  primary_cta_label: "Resume Work",
  labels: {
    task: "Task",
    deliverable: "Deliverable",
    approval: "Approval",
  },
};

export const defaultAssistantDock: AssistantDockModel = {
  state: "ambient",
  summary: "Resume the most recent work item or review what changed in this workspace.",
  suggested_actions: [],
};
```

- [ ] **Step 5: Implement the normalization function**

Create `apps/workspaces/src/entities/workbench/normalizeWorkspaceHome.ts`:

```ts
import type { WorkspaceHomeData } from "../workspace-home/types";
import { defaultAssistantDock, defaultWorkbenchTemplate } from "./defaultTemplate";
import type { WorkspaceWorkbenchModel } from "./types";

export function normalizeWorkspaceHome(
  workspaceId: string,
  raw: WorkspaceHomeData,
): WorkspaceWorkbenchModel {
  const template = raw.template
    ? {
        id: raw.template.id,
        title: raw.template.title,
        slot_order: raw.template.slot_order as WorkspaceWorkbenchModel["template"]["slot_order"],
        primary_cta_label: raw.template.primary_cta_label ?? defaultWorkbenchTemplate.primary_cta_label,
        labels: {
          ...defaultWorkbenchTemplate.labels,
          ...raw.template.labels,
        },
      }
    : defaultWorkbenchTemplate;

  const primaryDeliverable = raw.deliverables[0];
  const assistant = raw.assistant
    ? {
        state: "ambient" as const,
        summary: raw.assistant.summary,
        suggested_actions: raw.assistant.suggested_actions,
      }
    : defaultAssistantDock;

  return {
    workspace_id: workspaceId,
    template,
    resume: {
      primary_label: template.primary_cta_label,
      title: primaryDeliverable?.label ?? "Resume current work",
      detail:
        primaryDeliverable?.canonical_path ??
        "Open the most relevant task, artifact, or queue item for this workspace.",
      target_task_id: undefined,
    },
    current_work: {
      task_health: raw.task_health,
      deliverables: raw.deliverables,
    },
    queue: {
      items: raw.attention,
    },
    activity: raw.activity,
    discussion: raw.discussion ?? [],
    team_snapshot: raw.team_snapshot,
    assistant,
  };
}
```

- [ ] **Step 6: Run the focused tests to verify the normalization layer passes**

Run:

```bash
pnpm --filter decacan-workspaces test -- src/test/workbench-normalization.test.ts
```

Expected: PASS with 2 passing tests.

- [ ] **Step 7: Commit the contract layer**

```bash
git add apps/workspaces/src/entities/workspace-home/types.ts apps/workspaces/src/entities/workbench/types.ts apps/workspaces/src/entities/workbench/defaultTemplate.ts apps/workspaces/src/entities/workbench/normalizeWorkspaceHome.ts apps/workspaces/src/test/workbench-normalization.test.ts
git commit -m "feat(workspaces): add workbench normalization model"
```

---

## Phase 2: Resume-First Home Layout

### Task 2: Replace the old control-center stack with the new workbench canvas

**Files:**
- Create: `apps/workspaces/src/features/workspace-home/WorkbenchLayout.tsx`
- Create: `apps/workspaces/src/features/workspace-home/ResumeStrip.tsx`
- Create: `apps/workspaces/src/features/workspace-home/CurrentWorkPanel.tsx`
- Create: `apps/workspaces/src/features/workspace-home/MyQueuePanel.tsx`
- Create: `apps/workspaces/src/features/workspace-home/TeamActivityPanel.tsx`
- Create: `apps/workspaces/src/features/workspace-home/DiscussionPanel.tsx`
- Modify: `apps/workspaces/src/features/workspace-home/WorkspaceHomePage.tsx`
- Modify: `apps/workspaces/src/test/workspace-home-page.test.tsx`

- [ ] **Step 1: Rewrite the home-page test around the required slot order**

Modify `apps/workspaces/src/test/workspace-home-page.test.tsx`:

```ts
it("renders the resume-first workbench regions in priority order", async () => {
  renderAppAtRoute("/workspaces/workspace-1");

  expect(await screen.findByRole("heading", { name: "Resume Work" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Current Work" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "My Queue" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Team Activity" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Discussion" })).toBeInTheDocument();

  const headings = screen
    .getAllByRole("heading", { level: 2 })
    .map((heading) => heading.textContent);

  expect(headings.slice(0, 5)).toEqual([
    "Resume Work",
    "Current Work",
    "My Queue",
    "Team Activity",
    "Discussion",
  ]);
});
```

- [ ] **Step 2: Run the home-page test and confirm the existing page fails**

Run:

```bash
pnpm --filter decacan-workspaces test -- src/test/workspace-home-page.test.tsx
```

Expected: FAIL because `WorkspaceHomePage` still renders the old `Needs Attention / Execution Overview / Deliverables / Team Snapshot` stack.

- [ ] **Step 3: Create the new presentational components**

Create `apps/workspaces/src/features/workspace-home/ResumeStrip.tsx`:

```tsx
import type { ResumeModel } from "../../entities/workbench/types";

interface ResumeStripProps {
  resume: ResumeModel;
  onOpenPrimary: () => void;
}

export function ResumeStrip({ resume, onOpenPrimary }: ResumeStripProps) {
  return (
    <section aria-label="Resume work">
      <h2>{resume.primary_label}</h2>
      <p>{resume.title}</p>
      <p>{resume.detail}</p>
      <button type="button" onClick={onOpenPrimary}>
        Open
      </button>
    </section>
  );
}
```

Create `apps/workspaces/src/features/workspace-home/CurrentWorkPanel.tsx`:

```tsx
import type { WorkspaceWorkbenchModel } from "../../entities/workbench/types";

interface CurrentWorkPanelProps {
  currentWork: WorkspaceWorkbenchModel["current_work"];
}

export function CurrentWorkPanel({ currentWork }: CurrentWorkPanelProps) {
  return (
    <section aria-label="Current work">
      <h2>Current Work</h2>
      <p>
        Running: {currentWork.task_health.running} | Waiting approval:{" "}
        {currentWork.task_health.waiting_approval}
      </p>
      <ul>
        {currentWork.deliverables.map((deliverable) => (
          <li key={deliverable.id}>{deliverable.label}</li>
        ))}
      </ul>
    </section>
  );
}
```

Create `apps/workspaces/src/features/workspace-home/MyQueuePanel.tsx`:

```tsx
import type { QueueModel } from "../../entities/workbench/types";

interface MyQueuePanelProps {
  queue: QueueModel;
}

export function MyQueuePanel({ queue }: MyQueuePanelProps) {
  return (
    <section aria-label="My queue">
      <h2>My Queue</h2>
      <ul>
        {queue.items.map((item) => (
          <li key={item.id}>
            <strong>{item.title}</strong>
            <p>{item.reason}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
```

Create `apps/workspaces/src/features/workspace-home/TeamActivityPanel.tsx` and `DiscussionPanel.tsx` with the same pattern: top-level `<section>`, `<h2>`, list content, and an empty-state message when the list is empty.

- [ ] **Step 4: Compose the layout and swap `WorkspaceHomePage` over to the normalized model**

Create `apps/workspaces/src/features/workspace-home/WorkbenchLayout.tsx`:

```tsx
import type { WorkspaceWorkbenchModel } from "../../entities/workbench/types";
import { CurrentWorkPanel } from "./CurrentWorkPanel";
import { DiscussionPanel } from "./DiscussionPanel";
import { MyQueuePanel } from "./MyQueuePanel";
import { ResumeStrip } from "./ResumeStrip";
import { TeamActivityPanel } from "./TeamActivityPanel";

interface WorkbenchLayoutProps {
  model: WorkspaceWorkbenchModel;
  onOpenPrimary: () => void;
}

export function WorkbenchLayout({ model, onOpenPrimary }: WorkbenchLayoutProps) {
  return (
    <div className="grid gap-6">
      <ResumeStrip resume={model.resume} onOpenPrimary={onOpenPrimary} />
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(320px,0.9fr)]">
        <CurrentWorkPanel currentWork={model.current_work} />
        <MyQueuePanel queue={model.queue} />
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <TeamActivityPanel items={model.activity} />
        <DiscussionPanel items={model.discussion} />
      </div>
    </div>
  );
}
```

Modify `apps/workspaces/src/features/workspace-home/WorkspaceHomePage.tsx`:

```tsx
import { normalizeWorkspaceHome } from "../../entities/workbench/normalizeWorkspaceHome";
import type { WorkspaceWorkbenchModel } from "../../entities/workbench/types";
import { WorkbenchLayout } from "./WorkbenchLayout";

const [workbench, setWorkbench] = useState<WorkspaceWorkbenchModel | null>(null);

const data = await fetchWorkspaceHome(workspaceId);
setWorkbench(normalizeWorkspaceHome(workspaceId, data));

if (!workbench) {
  return <LoadingState message="Loading workspace workbench…" />;
}

return (
  <div>
    <PageHeader title="Workspace Home" />
    <WorkbenchLayout model={workbench} onOpenPrimary={() => {}} />
  </div>
);
```

- [ ] **Step 5: Run the updated home-page tests**

Run:

```bash
pnpm --filter decacan-workspaces test -- src/test/workspace-home-page.test.tsx
```

Expected: PASS with the new headings and slot order assertions.

- [ ] **Step 6: Commit the resume-first layout**

```bash
git add apps/workspaces/src/features/workspace-home/WorkbenchLayout.tsx apps/workspaces/src/features/workspace-home/ResumeStrip.tsx apps/workspaces/src/features/workspace-home/CurrentWorkPanel.tsx apps/workspaces/src/features/workspace-home/MyQueuePanel.tsx apps/workspaces/src/features/workspace-home/TeamActivityPanel.tsx apps/workspaces/src/features/workspace-home/DiscussionPanel.tsx apps/workspaces/src/features/workspace-home/WorkspaceHomePage.tsx apps/workspaces/src/test/workspace-home-page.test.tsx
git commit -m "feat(workspaces): render resume-first workbench home"
```

---

## Phase 3: Assistant Dock And Handoff

### Task 3: Add the persistent workspace assistant and preserve context into task detail

**Files:**
- Create: `apps/workspaces/src/features/workspace-home/WorkspaceAssistantDock.tsx`
- Create: `apps/workspaces/src/features/workspace-home/useAssistantDock.ts`
- Create: `apps/workspaces/src/features/task-detail/AssistantContextNotice.tsx`
- Modify: `apps/workspaces/src/features/workspace-home/WorkbenchLayout.tsx`
- Modify: `apps/workspaces/src/features/workspace-home/WorkspaceHomePage.tsx`
- Modify: `apps/workspaces/src/features/task-detail/TaskPage.tsx`
- Modify: `apps/workspaces/src/test/workspace-home-page.test.tsx`
- Modify: `apps/workspaces/src/test/task-page.test.tsx`

- [ ] **Step 1: Add a failing home-page test for the assistant dock**

Modify `apps/workspaces/src/test/workspace-home-page.test.tsx`:

```ts
it("renders the assistant dock and suggested actions", async () => {
  renderAppAtRoute("/workspaces/workspace-1");

  expect(await screen.findByRole("complementary", { name: "Workspace assistant" })).toBeInTheDocument();
  expect(screen.getByText(/Resume the most recent work item/i)).toBeInTheDocument();
});
```

Add a failing task-detail continuity test to `apps/workspaces/src/test/task-page.test.tsx`:

```ts
it("opens task detail from assistant handoff in agent mode", async () => {
  window.history.replaceState(
    {
      usr: {
        assistantContext: {
          source: "workspace-home",
          summary: "Resume launch checklist",
        },
      },
    },
    "",
    "/tasks/task-1",
  );

  renderAppAtRoute("/tasks/task-1");

  expect(await screen.findByText("Opened from workspace assistant")).toBeInTheDocument();
  expect(screen.getByRole("tab", { name: "Agent" })).toHaveAttribute("aria-selected", "true");
});
```

- [ ] **Step 2: Run the focused assistant tests and confirm the missing behavior**

Run:

```bash
pnpm --filter decacan-workspaces test -- src/test/workspace-home-page.test.tsx src/test/task-page.test.tsx
```

Expected: FAIL because there is no assistant dock and `TaskPage` does not read route handoff state.

- [ ] **Step 3: Implement assistant-dock state and rendering**

Create `apps/workspaces/src/features/workspace-home/useAssistantDock.ts`:

```ts
import { useState } from "react";

export interface AssistantSelection {
  kind: "task" | "deliverable" | "discussion";
  id: string;
  label: string;
}

export function useAssistantDock() {
  const [selection, setSelection] = useState<AssistantSelection | null>(null);

  return {
    selection,
    setSelection,
    clearSelection: () => setSelection(null),
  };
}
```

Create `apps/workspaces/src/features/workspace-home/WorkspaceAssistantDock.tsx`:

```tsx
import type { AssistantDockModel } from "../../entities/workbench/types";
import type { AssistantSelection } from "./useAssistantDock";

interface WorkspaceAssistantDockProps {
  assistant: AssistantDockModel;
  selection: AssistantSelection | null;
  onOpenSelection: () => void;
}

export function WorkspaceAssistantDock({
  assistant,
  selection,
  onOpenSelection,
}: WorkspaceAssistantDockProps) {
  return (
    <aside aria-label="Workspace assistant">
      <h2>Workspace Assistant</h2>
      <p>{selection ? `Focused on ${selection.label}` : assistant.summary}</p>
      <ul>
        {assistant.suggested_actions.map((action) => (
          <li key={action.id}>{action.label}</li>
        ))}
      </ul>
      <button type="button" onClick={onOpenSelection}>
        Open in task detail
      </button>
    </aside>
  );
}
```

- [ ] **Step 4: Wire the assistant dock into the home layout and route handoff**

Modify `apps/workspaces/src/features/workspace-home/WorkbenchLayout.tsx`:

```tsx
import { WorkspaceAssistantDock } from "./WorkspaceAssistantDock";

interface WorkbenchLayoutProps {
  model: WorkspaceWorkbenchModel;
  selection: AssistantSelection | null;
  onOpenPrimary: () => void;
  onOpenSelection: () => void;
}

<div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
  <div className="grid gap-6">
    {/* existing workbench content */}
  </div>
  <WorkspaceAssistantDock
    assistant={model.assistant}
    selection={selection}
    onOpenSelection={onOpenSelection}
  />
</div>;
```

Modify `apps/workspaces/src/features/workspace-home/WorkspaceHomePage.tsx` to:

```tsx
const navigate = useNavigate();
const { selection, setSelection } = useAssistantDock();

<WorkbenchLayout
  model={workbench}
  selection={selection}
  onOpenPrimary={() => {
    setSelection({ kind: "deliverable", id: "deliverable-1", label: workbench.resume.title });
  }}
  onOpenSelection={() => {
    navigate("/tasks/task-1", {
      state: {
        assistantContext: {
          source: "workspace-home",
          summary: selection?.label ?? workbench.resume.title,
        },
      },
    });
  }}
/>;
```

Use the real target object when the model exposes one. Do not hardcode `"task-1"` in the implementation; the snippet shows the route-state shape only.

- [ ] **Step 5: Render continuity inside task detail**

Create `apps/workspaces/src/features/task-detail/AssistantContextNotice.tsx`:

```tsx
interface AssistantContextNoticeProps {
  summary: string;
}

export function AssistantContextNotice({ summary }: AssistantContextNoticeProps) {
  return (
    <section className="task-panel" aria-label="Assistant handoff">
      <p className="section-kicker">Opened from workspace assistant</p>
      <p className="panel-copy">{summary}</p>
    </section>
  );
}
```

Modify `apps/workspaces/src/features/task-detail/TaskPage.tsx`:

```tsx
import { useLocation } from "react-router-dom";
import { AssistantContextNotice } from "./AssistantContextNotice";

const location = useLocation();
const assistantContext = (location.state as { assistantContext?: { summary: string } } | null)?.assistantContext;
const [activeRailTab, setActiveRailTab] = useState<RailTab>(assistantContext ? "agent" : "context");

{assistantContext ? <AssistantContextNotice summary={assistantContext.summary} /> : null}
```

- [ ] **Step 6: Run the assistant and task-detail tests**

Run:

```bash
pnpm --filter decacan-workspaces test -- src/test/workspace-home-page.test.tsx src/test/task-page.test.tsx
```

Expected: PASS with the dock rendered and the task page opening in `Agent` mode from home.

- [ ] **Step 7: Commit the assistant behavior**

```bash
git add apps/workspaces/src/features/workspace-home/WorkspaceAssistantDock.tsx apps/workspaces/src/features/workspace-home/useAssistantDock.ts apps/workspaces/src/features/workspace-home/WorkbenchLayout.tsx apps/workspaces/src/features/workspace-home/WorkspaceHomePage.tsx apps/workspaces/src/features/task-detail/AssistantContextNotice.tsx apps/workspaces/src/features/task-detail/TaskPage.tsx apps/workspaces/src/test/workspace-home-page.test.tsx apps/workspaces/src/test/task-page.test.tsx
git commit -m "feat(workspaces): add workspace assistant dock"
```

---

## Phase 4: Fallbacks, UI States, And Verification

### Task 4: Harden template fallback, no-current-work behavior, and panel-level UI states

**Files:**
- Modify: `apps/workspaces/src/shared/api/workspace-home.ts`
- Modify: `apps/workspaces/src/features/workspace-home/WorkspaceHomePage.tsx`
- Modify: `apps/workspaces/src/features/workspace-home/ResumeStrip.tsx`
- Modify: `apps/workspaces/src/features/workspace-home/DiscussionPanel.tsx`
- Modify: `apps/workspaces/src/features/workspace-home/WorkspaceAssistantDock.tsx`
- Modify: `apps/workspaces/src/test/ui-states.test.tsx`
- Modify: `apps/workspaces/src/test/workspace-home-page.test.tsx`
- Modify: `README.md`

- [ ] **Step 1: Add failing tests for fallback and empty-state behavior**

Modify `apps/workspaces/src/test/workspace-home-page.test.tsx`:

```ts
it("falls back to the default workbench when template data is missing", async () => {
  renderAppAtRoute("/workspaces/workspace-1");

  expect(await screen.findByRole("heading", { name: "Resume Work" })).toBeInTheDocument();
  expect(screen.getByRole("heading", { name: "Workspace Assistant" })).toBeInTheDocument();
});

it("turns the resume strip into a start surface when there is no current work", async () => {
  fetchMock.mockImplementationOnce(async () => {
    return new Response(
      JSON.stringify({
        attention: [],
        task_health: { running: 0, waiting_approval: 0, blocked: 0, completed_today: 0 },
        activity: [],
        deliverables: [],
        team_snapshot: [],
      }),
      { status: 200, headers: { "content-type": "application/json" } },
    );
  });

  renderAppAtRoute("/workspaces/workspace-1");

  expect(await screen.findByText("Start new work")).toBeInTheDocument();
});
```

Modify `apps/workspaces/src/test/ui-states.test.tsx`:

```ts
it("shows panel-level empty state for discussion without collapsing the page", () => {
  render(<DiscussionPanel items={[]} />);

  expect(screen.getByText("No discussion yet")).toBeInTheDocument();
});
```

- [ ] **Step 2: Run the fallback tests and confirm the gaps**

Run:

```bash
pnpm --filter decacan-workspaces test -- src/test/workspace-home-page.test.tsx src/test/ui-states.test.tsx
```

Expected: FAIL because the new fallback states are not implemented yet.

- [ ] **Step 3: Implement no-current-work and panel-level fallbacks with the existing shared state components**

Modify `apps/workspaces/src/features/workspace-home/ResumeStrip.tsx`:

```tsx
import { EmptyState } from "../../shared/ui";

if (!resume.title || resume.title === "Resume current work") {
  return (
    <EmptyState
      title="Start new work"
      message="There is no active work to resume in this workspace yet."
      action={{ label: "Launch task", onClick: onOpenPrimary }}
    />
  );
}
```

Modify `apps/workspaces/src/features/workspace-home/DiscussionPanel.tsx`:

```tsx
import { EmptyState } from "../../shared/ui";

if (!items.length) {
  return <EmptyState title="No discussion yet" message="Discussion threads will appear here." />;
}
```

Modify `apps/workspaces/src/features/workspace-home/WorkspaceAssistantDock.tsx`:

```tsx
const summary = assistant.summary || "Assistant is unavailable. Use direct workspace actions instead.";
```

Do not fork new loading/error primitives here. Reuse the existing shared `EmptyState`, `LoadingState`, and `ErrorState` components from `apps/workspaces/src/shared/ui`.

- [ ] **Step 4: Keep the API seam explicit and document the fallback behavior**

Modify `apps/workspaces/src/shared/api/workspace-home.ts`:

```ts
import type { WorkspaceHomeData } from "../../entities/workspace-home/types";

export async function fetchWorkspaceHome(workspaceId: string): Promise<WorkspaceHomeData> {
  return getJson<WorkspaceHomeData>(`/api/workspaces/${workspaceId}/home`);
}
```

Leave this API raw. Do not move normalization into the fetch client; keep it in the feature/domain seam so template fallback remains testable without fetch mocks.

Update `README.md` with a short note that `Workspace Home` now renders via a template-driven workbench model with local fallback to the default template when template config is absent.

- [ ] **Step 5: Run the workspaces test suite**

Run:

```bash
pnpm --filter decacan-workspaces test
```

Expected: PASS for the full frontend workspace test suite.

- [ ] **Step 6: Run lint and build verification**

Run:

```bash
pnpm --filter decacan-workspaces lint
pnpm --filter decacan-workspaces build
```

Expected: both commands PASS with no lint or TypeScript errors.

- [ ] **Step 7: Commit the hardening pass**

```bash
git add apps/workspaces/src/shared/api/workspace-home.ts apps/workspaces/src/features/workspace-home/WorkspaceHomePage.tsx apps/workspaces/src/features/workspace-home/ResumeStrip.tsx apps/workspaces/src/features/workspace-home/DiscussionPanel.tsx apps/workspaces/src/features/workspace-home/WorkspaceAssistantDock.tsx apps/workspaces/src/test/ui-states.test.tsx apps/workspaces/src/test/workspace-home-page.test.tsx README.md
git commit -m "fix(workspaces): harden workbench fallback states"
```

---

## Final Verification Checklist

- [ ] `pnpm --filter decacan-workspaces test`
- [ ] `pnpm --filter decacan-workspaces lint`
- [ ] `pnpm --filter decacan-workspaces build`
- [ ] `pnpm dev:workspaces`
- [ ] Verify `/workspaces/:workspaceId` shows:
  - [ ] resume strip first
  - [ ] current work + queue second
  - [ ] assistant dock on the right
  - [ ] collaboration panels below
- [ ] Verify missing template config falls back to the default workbench
- [ ] Verify no-current-work shows a start surface rather than an empty KPI panel
- [ ] Verify assistant handoff opens task detail in `Agent` mode with continuity notice
