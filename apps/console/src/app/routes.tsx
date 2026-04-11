import type { ReactElement } from 'react';
import { Navigate, type RouteObject, useParams } from 'react-router-dom';
import { agentsConsoleApi } from '../features/agents/api/agentsConsoleApi';
import { AgentAssetLibraryPage } from '../features/agents/pages/AgentAssetLibraryPage';
import { AgentDetailPage } from '../features/agents/pages/AgentDetailPage';
import { AllAgentsPage } from '../features/agents/pages/AllAgentsPage';
import { CreateAgentPage } from '../features/agents/pages/CreateAgentPage';
import { QuickstartPage } from '../features/agents/pages/QuickstartPage';
import { PermissionGuard } from '../features/auth/PermissionGuard';
import { AnalyticsPage } from '../features/dashboard/pages/AnalyticsPage';
import { AttentionPage } from '../features/dashboard/pages/AttentionPage';
import { MyWorkPage } from '../features/dashboard/pages/MyWorkPage';
import { AccountPage } from '../features/manage/pages/AccountPage';
import { AuditLogsPage } from '../features/manage/pages/AuditLogsPage';
import { IntegrationsPage } from '../features/manage/pages/IntegrationsPage';
import { SettingsPage } from '../features/manage/pages/SettingsPage';
import { UsersPage } from '../features/manage/pages/UsersPage';
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

const agentReferenceData = agentsConsoleApi.getReferenceData();

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
    element: <QuickstartPage />,
  },
  {
    path: '/agents/all',
    element: <AllAgentsPage />,
  },
  {
    path: agentContentRoutes.create,
    element: <CreateAgentPage />,
  },
  {
    path: agentContentRoutes.detail,
    element: <AgentDetailPage />,
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
    element: (
      <AgentAssetLibraryPage
        description="Browse the team library that agents can bind to for operational ownership."
        items={agentReferenceData.teams}
        title="Teams"
      />
    ),
  },
  {
    path: '/agents/capabilities',
    element: (
      <AgentAssetLibraryPage
        description="Review the reusable capability library that can be attached to an agent configuration."
        items={agentReferenceData.capabilities}
        title="Capabilities"
      />
    ),
  },
  {
    path: '/agents/policies',
    element: (
      <AgentAssetLibraryPage
        description="Review the policy library that governs how agents move through approvals and safety checks."
        items={agentReferenceData.policies}
        title="Policies"
      />
    ),
  },
  {
    path: '/dashboard',
    element: <Navigate to={consoleRouteDefaults.dashboard} replace />,
  },
  {
    path: '/dashboard/analytics',
    element: <AnalyticsPage />,
  },
  {
    path: '/dashboard/my-work',
    element: <MyWorkPage />,
  },
  {
    path: '/dashboard/attention',
    element: <AttentionPage />,
  },
  {
    path: '/manage',
    element: <Navigate to={consoleRouteDefaults.manage} replace />,
  },
  {
    path: '/manage/account',
    element: <AccountPage />,
  },
  {
    path: '/manage/users',
    element: <UsersPage />,
  },
  {
    path: '/manage/audit-logs',
    element: <AuditLogsPage />,
  },
  {
    path: '/manage/integrations',
    element: <IntegrationsPage />,
  },
  {
    path: '/manage/settings',
    element: <SettingsPage />,
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
