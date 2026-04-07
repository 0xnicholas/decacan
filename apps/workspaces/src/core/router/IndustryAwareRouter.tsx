import React, { Suspense } from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { createLazyComponent } from './dynamicLoader';
import { WorkspaceShell } from '../../shared/layout/WorkspaceShell';
import { useIndustryConfig } from '../../app/providers';

// Lazy-loaded components with industry support
const LazyWorkspaceHomePage = createLazyComponent('workspace-home', 'WorkspaceHomePage');

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

export function IndustryAwareRouter() {
  const config = useIndustryConfig();
  
  // Get visible routes based on industry config
  const isRouteVisible = (route: string): boolean => {
    if (!config.routes?.hiddenRoutes) return true;
    return !config.routes.hiddenRoutes.includes(route);
  };

  return (
    <Routes>
      {/* Workspace pages with shell */}
      <Route path="/workspaces/:workspaceId" element={<WorkspaceShell />}>
        <Route index element={<WorkspaceHomeWrapper />} />
        {/* Add other routes conditionally based on industry config */}
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
