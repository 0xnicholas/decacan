import type { ReactElement } from 'react';
import { Navigate, type RouteObject, useParams } from 'react-router-dom';
import { PermissionGuard } from '../features/auth/PermissionGuard';
import { ComingSoonPage } from '../features/common/ComingSoonPage';
import { DashboardPage } from '../features/dashboard/dashboard-page';
import { PlaybookCreatePage } from '../features/playbook-studio/pages/PlaybookCreatePage';
import { PlaybookEditPage } from '../features/playbook-studio/pages/PlaybookEditPage';
import { PlaybookListPage } from '../features/playbook-studio/pages/PlaybookListPage';
import { AllWorkspacesPage } from '../features/workspaces/pages/AllWorkspacesPage';
import { ApprovalsPage } from '../features/workspaces/pages/ApprovalsPage';
import { MembersPage } from '../features/workspaces/pages/MembersPage';
import { RunsPage } from '../features/workspaces/pages/RunsPage';
import { WorkbenchPage } from '../features/workspaces/pages/WorkbenchPage';
import {
  agentContentRoutes,
  consoleRouteDefaults,
} from '../features/console-ia/route-defaults';

function renderProtectedPlaybooks(element: ReactElement) {
  return (
    <PermissionGuard
      permission="studio.playbooks"
      fallback={<Navigate to={consoleRouteDefaults.dashboard} replace />}
    >
      {element}
    </PermissionGuard>
  );
}

function LegacyPlaybookEditRedirect() {
  const { id } = useParams();

  return <Navigate to={`/agents/playbooks/${id}/edit`} replace />;
}

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Navigate to={consoleRouteDefaults.dashboard} replace />,
  },
  {
    path: '/workspaces',
    element: <Navigate to={consoleRouteDefaults.workspaces} replace />,
  },
  {
    path: '/workspaces/workbench',
    element: <WorkbenchPage />,
  },
  {
    path: '/workspaces/all',
    element: <AllWorkspacesPage />,
  },
  {
    path: '/workspaces/approvals',
    element: <ApprovalsPage />,
  },
  {
    path: '/workspaces/runs',
    element: <RunsPage />,
  },
  {
    path: '/workspaces/members',
    element: <MembersPage />,
  },
  {
    path: '/agents',
    element: <Navigate to={consoleRouteDefaults.agents} replace />,
  },
  {
    path: '/agents/quickstart',
    element: <ComingSoonPage feature="Quickstart" />,
  },
  {
    path: '/agents/all',
    element: <ComingSoonPage feature="All Agents" />,
  },
  {
    path: agentContentRoutes.create,
    element: <ComingSoonPage feature="Create Agent" />,
  },
  {
    path: agentContentRoutes.detail,
    element: <ComingSoonPage feature="Agent Detail" />,
  },
  {
    path: '/agents/playbooks',
    element: renderProtectedPlaybooks(<PlaybookListPage />),
  },
  {
    path: '/agents/playbooks/new',
    element: renderProtectedPlaybooks(<PlaybookCreatePage />),
  },
  {
    path: '/agents/playbooks/:id/edit',
    element: renderProtectedPlaybooks(<PlaybookEditPage />),
  },
  {
    path: '/agents/teams',
    element: <ComingSoonPage feature="Teams" />,
  },
  {
    path: '/agents/capabilities',
    element: <ComingSoonPage feature="Capabilities" />,
  },
  {
    path: '/agents/policies',
    element: <ComingSoonPage feature="Policies" />,
  },
  {
    path: '/dashboard',
    element: <Navigate to={consoleRouteDefaults.dashboard} replace />,
  },
  {
    path: '/dashboard/analytics',
    element: <DashboardPage />,
  },
  {
    path: '/dashboard/my-work',
    element: <DashboardPage />,
  },
  {
    path: '/dashboard/attention',
    element: <ComingSoonPage feature="Attention" />,
  },
  {
    path: '/manage',
    element: <Navigate to={consoleRouteDefaults.manage} replace />,
  },
  {
    path: '/manage/account',
    element: <ComingSoonPage feature="Account" />,
  },
  {
    path: '/manage/users',
    element: <ComingSoonPage feature="Users" />,
  },
  {
    path: '/manage/audit-logs',
    element: <ComingSoonPage feature="Audit Logs" />,
  },
  {
    path: '/manage/integrations',
    element: <ComingSoonPage feature="Integrations" />,
  },
  {
    path: '/manage/settings',
    element: <ComingSoonPage feature="Settings" />,
  },
  {
    path: '/playbooks',
    element: <Navigate to="/agents/playbooks" replace />,
  },
  {
    path: '/playbooks/new',
    element: <Navigate to="/agents/playbooks/new" replace />,
  },
  {
    path: '/playbooks/:id/edit',
    element: <LegacyPlaybookEditRedirect />,
  },
  {
    path: '/settings',
    element: <Navigate to="/manage/settings" replace />,
  },
  {
    path: '/audit-logs',
    element: <Navigate to="/manage/audit-logs" replace />,
  },
  {
    path: '/capabilities',
    element: <Navigate to="/agents/capabilities" replace />,
  },
  {
    path: '/policies/*',
    element: <Navigate to="/agents/policies" replace />,
  },
];
