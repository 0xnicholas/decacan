import React, { Suspense } from 'react';
import { Routes, Route, useParams, useNavigate } from 'react-router-dom';
import { createLazyComponent } from './dynamicLoader';
import { WorkspaceShell } from '../../shared/layout/WorkspaceShell';
import { WorkspaceProvider } from '../../shared/layout/WorkspaceContext';
import { useIndustryConfig } from '../../app/providers/index';
import { AIAssistantPanel } from '../../features/assistant/AIAssistantPanel';
import { ActivityPage } from '../../features/activity/ActivityPage';
import { ApprovalsPage } from '../../features/approvals/ApprovalsPage';
import { DeliverableDetailPage } from '../../features/deliverables/DeliverableDetailPage';
import { DeliverablesPage } from '../../features/deliverables/DeliverablesPage';
import { LaunchPage } from '../../features/launch/LaunchPage';
import { WorkspaceEntryRedirect } from '../../features/launch/WorkspaceEntryRedirect';
import { MembersPage } from '../../features/members/MembersPage';
import { TaskPage } from '../../features/task-detail/TaskPage';
import { TasksPage } from '../../features/tasks/TasksPage';

// Lazy-loaded components with industry support
const LazyWorkspaceHomePage = createLazyComponent('workspace-home', 'WorkspaceHomePage');

// Industry-specific page components (loaded dynamically)
const LazyScriptPage = createLazyComponent('script', 'ScriptPage');
const LazyStoryboardPage = createLazyComponent('storyboard', 'StoryboardPage');
const LazyArtResourcesPage = createLazyComponent('art-resources', 'ArtResourcesPage');
const LazyTopicsPage = createLazyComponent('topics', 'TopicsPage');
const LazyAnalyticsPage = createLazyComponent('analytics', 'AnalyticsPage');
const LazySchedulePage = createLazyComponent('schedule', 'SchedulePage');

// Wrapper components with loading states
function SuspenseWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    }>
      {children}
    </Suspense>
  );
}

// Wrapper for industry-specific routes
interface IndustryRouteWrapperProps {
  component: React.ComponentType<{ workspaceId: string }>;
}

function IndustryRouteWrapper({ component: Component }: IndustryRouteWrapperProps) {
  const { workspaceId } = useParams();
  return workspaceId ? (
    <SuspenseWrapper>
      <Component workspaceId={workspaceId} />
    </SuspenseWrapper>
  ) : null;
}

function WorkspaceHomeWrapper() {
  const { workspaceId } = useParams();
  
  return workspaceId ? (
    <SuspenseWrapper>
      <LazyWorkspaceHomePage workspaceId={workspaceId} />
    </SuspenseWrapper>
  ) : null;
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
  return workspaceId && deliverableId ? (
    <DeliverableDetailPage workspaceId={workspaceId} deliverableId={deliverableId} />
  ) : null;
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

// Map route names to components
const industryRouteComponents: Record<string, React.ComponentType> = {
  'ScriptPage': LazyScriptPage,
  'StoryboardPage': LazyStoryboardPage,
  'ArtResourcesPage': LazyArtResourcesPage,
  'TopicsPage': LazyTopicsPage,
  'AnalyticsPage': LazyAnalyticsPage,
  'SchedulePage': LazySchedulePage,
};

export function IndustryAwareRouter() {
  const config = useIndustryConfig();

  // Generate additional routes from industry config
  const additionalRoutes = (config.routes?.additionalRoutes ?? []).map((route): React.ReactNode => {
    const Component = industryRouteComponents[route.component];
    if (!Component) {
      console.warn(`No component found for route: ${route.path}`);
      return null;
    }
    return (
      <Route 
        key={route.path} 
        path={route.path} 
        element={<IndustryRouteWrapper component={Component} />}
      />
    );
  });

  return (
    <WorkspaceProvider rightPanel={<AIAssistantPanel />}>
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
          {/* Industry-specific additional routes */}
          {additionalRoutes}
          {/* Catch-all for undefined routes */}
          <Route path="*" element={<WorkspaceSegmentOverflowPlaceholder />} />
        </Route>

        <Route path="/" element={<WorkspaceEntryRedirect />} />
        <Route path="*" element={<div>404 - Page Not Found</div>} />
      </Routes>
    </WorkspaceProvider>
  );
}

// Also export as AppRouter for compatibility
export function AppRouter() {
  return <IndustryAwareRouter />;
}
