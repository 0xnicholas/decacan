import { Navigate, Route, Routes, useParams } from "react-router-dom";

import { ActivityPage } from "../features/activity/ActivityPage";
import { ApprovalsPage } from "../features/approvals/ApprovalsPage";
import { MembersPage } from "../features/members/MembersPage";
import { DeliverableDetailPage } from "../features/deliverables/DeliverableDetailPage";
import { DeliverablesPage } from "../features/deliverables/DeliverablesPage";
import { LaunchPage } from "../features/launch/LaunchPage";
import { WorkspaceEntryRedirect } from "../features/launch/WorkspaceEntryRedirect";
import { TaskPage } from "../features/task-detail/TaskPage";
import { TasksPage } from "../features/tasks/TasksPage";
import { WorkspaceHomePage } from "../features/workspace-home/WorkspaceHomePage";
import { WorkspaceShell } from "../shared/layout/WorkspaceShell";

function _WorkspaceSectionPlaceholder() {
  return (
    <section className="flex flex-col gap-3">
      <p className="text-sm uppercase tracking-widest text-foreground/50">Workspace</p>
      <h1 className="text-2xl font-semibold">Section</h1>
      <p className="text-foreground/70 max-w-lg">Content for this route will be implemented in later tasks.</p>
    </section>
  );
}

function _WorkspaceUnknownSectionPlaceholder() {
  return (
    <main className="min-h-screen p-12">
      <p className="text-sm uppercase tracking-widest text-foreground/50 mb-3">Decacan</p>
      <h1 className="text-3xl font-semibold">Loading task</h1>
    </main>
  );
}

function WorkspaceSegmentOverflowPlaceholder() {
  return (
    <section className="flex flex-col gap-3">
      <p className="text-sm uppercase tracking-widest text-foreground/50">Workspace</p>
      <h1 className="text-2xl font-semibold">Route not available</h1>
      <p className="text-foreground/70 max-w-lg">Content for this route will be implemented in later tasks.</p>
    </section>
  );
}

// Wrapper components to extract params
function WorkspaceHomeWrapper() {
  const { workspaceId } = useParams();
  return workspaceId ? <WorkspaceHomePage workspaceId={workspaceId} /> : null;
}

function TasksPageWrapper() {
  const { workspaceId } = useParams();
  return workspaceId ? <TasksPage workspaceId={workspaceId} /> : null;
}

function TaskPageWorkspaceWrapper() {
  const { workspaceId, taskId } = useParams();
  return workspaceId && taskId ? <TaskPage taskId={taskId} workspaceId={workspaceId} /> : null;
}

function DeliverablesPageWrapper() {
  const { workspaceId } = useParams();
  return workspaceId ? <DeliverablesPage workspaceId={workspaceId} /> : null;
}

function DeliverableDetailWrapper() {
  const { workspaceId, deliverableId } = useParams();
  return workspaceId && deliverableId ? <DeliverableDetailPage workspaceId={workspaceId} deliverableId={deliverableId} /> : null;
}

function ApprovalsPageWrapper() {
  const { workspaceId } = useParams();
  return workspaceId ? <ApprovalsPage workspaceId={workspaceId} /> : null;
}

function ActivityPageWrapper() {
  const { workspaceId } = useParams();
  return workspaceId ? <ActivityPage workspaceId={workspaceId} /> : null;
}

function MembersPageWrapper() {
  const { workspaceId } = useParams();
  return workspaceId ? <MembersPage workspaceId={workspaceId} /> : null;
}

function TaskPageWrapper() {
  const { taskId } = useParams();
  return taskId ? <TaskPage taskId={taskId} /> : null;
}

function WorkspaceLaunchWrapper() {
  const { workspaceId } = useParams();
  return workspaceId ? <LaunchPage workspaceId={workspaceId} /> : null;
}

export function LegacyAppRouter() {
  return (
    <Routes>
      <Route path="/tasks/:taskId" element={<TaskPageWrapper />} />
      <Route path="/workspaces/:workspaceId/new-task" element={<WorkspaceLaunchWrapper />} />

      {/* Workspace pages with shell */}
      <Route path="/workspaces/:workspaceId" element={<WorkspaceShell />}>
        <Route index element={<WorkspaceHomeWrapper />} />
        <Route path="tasks" element={<TasksPageWrapper />} />
        <Route path="tasks/:taskId" element={<TaskPageWorkspaceWrapper />} />
        <Route path="deliverables" element={<DeliverablesPageWrapper />} />
        <Route path="deliverables/:deliverableId" element={<DeliverableDetailWrapper />} />
        <Route path="approvals" element={<ApprovalsPageWrapper />} />
        <Route path="activity" element={<ActivityPageWrapper />} />
        <Route path="members" element={<MembersPageWrapper />} />
        <Route path="*" element={<WorkspaceSegmentOverflowPlaceholder />} />
      </Route>

      <Route path="/" element={<WorkspaceEntryRedirect />} />
      
      {/* Catch all - redirect to default workspace */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}