import { RouteObject } from 'react-router-dom';
import { Navigate } from 'react-router-dom';
import { DashboardPage } from '../features/dashboard/dashboard-page';
import { PlaybookListPage } from '../features/playbook-studio/pages/PlaybookListPage';
import { PlaybookEditPage } from '../features/playbook-studio/pages/PlaybookEditPage';
import { PlaybookCreatePage } from '../features/playbook-studio/pages/PlaybookCreatePage';
import { ComingSoonPage } from '../features/common/ComingSoonPage';
import { PermissionGuard } from '../features/auth/PermissionGuard';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/playbooks',
    element: (
      <PermissionGuard
        permission="studio.playbooks"
        fallback={<Navigate to="/" replace />}
      >
        <PlaybookListPage />
      </PermissionGuard>
    ),
  },
  {
    path: '/playbooks/new',
    element: (
      <PermissionGuard
        permission="studio.playbooks"
        fallback={<Navigate to="/" replace />}
      >
        <PlaybookCreatePage />
      </PermissionGuard>
    ),
  },
  {
    path: '/playbooks/:id/edit',
    element: (
      <PermissionGuard
        permission="studio.playbooks"
        fallback={<Navigate to="/" replace />}
      >
        <PlaybookEditPage />
      </PermissionGuard>
    ),
  },
  // Placeholder routes for other features
  {
    path: '/teamspecs/*',
    element: <ComingSoonPage feature="TeamSpec Studio" />,
  },
  {
    path: '/capabilities',
    element: <ComingSoonPage feature="Capability Registry" />,
  },
  {
    path: '/policies/*',
    element: <ComingSoonPage feature="Policy Engine" />,
  },
  {
    path: '/workspaces',
    element: <ComingSoonPage feature="Workspace Management" />,
  },
  {
    path: '/audit-logs',
    element: <ComingSoonPage feature="Audit Logs" />,
  },
  {
    path: '/settings',
    element: <ComingSoonPage feature="Settings" />,
  },
];
