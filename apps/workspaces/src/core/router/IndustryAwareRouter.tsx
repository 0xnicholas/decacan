import React, { Suspense } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { createLazyComponent } from './dynamicLoader';
import { WorkspaceShell } from '../../shared/layout/WorkspaceShell';
import { useIndustryConfig } from '../../app/providers/index';

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

function WorkspaceEntryRedirect() {
  // Redirect to default workspace or show workspace selector
  return <div>Redirecting...</div>;
}

// Map route names to components
const industryRouteComponents: Record<string, React.ComponentType> = {
  'script': LazyScriptPage,
  'storyboard': LazyStoryboardPage,
  'art': LazyArtResourcesPage,
  'topics': LazyTopicsPage,
  'analytics': LazyAnalyticsPage,
  'schedule': LazySchedulePage,
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
    <Routes>
      {/* Workspace pages with shell */}
      <Route path="/workspaces/:workspaceId" element={<WorkspaceShell />}>
        <Route index element={<WorkspaceHomeWrapper />} />
        {/* Industry-specific additional routes */}
        {additionalRoutes}
        {/* Catch-all for undefined routes */}
        <Route path="*" element={<WorkspaceSegmentOverflowPlaceholder />} />
      </Route>

      <Route path="/" element={<WorkspaceEntryRedirect />} />
      <Route path="*" element={<div>404 - Page Not Found</div>} />
    </Routes>
  );
}

// Also export as AppRouter for compatibility
export function AppRouter() {
  return <IndustryAwareRouter />;
}
