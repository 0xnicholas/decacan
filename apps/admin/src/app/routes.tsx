import { RouteObject } from 'react-router-dom';
import { DashboardPage } from '../features/dashboard/dashboard-page';
import { PlaybookListPage } from '../features/playbook-studio/pages/PlaybookListPage';
import { PlaybookEditPage } from '../features/playbook-studio/pages/PlaybookEditPage';
import { PlaybookCreatePage } from '../features/playbook-studio/pages/PlaybookCreatePage';
import { ComingSoonPage } from '../features/common/ComingSoonPage';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <DashboardPage />,
  },
  {
    path: '/playbooks',
    element: <PlaybookListPage />,
  },
  {
    path: '/playbooks/new',
    element: <PlaybookCreatePage />,
  },
  {
    path: '/playbooks/:id/edit',
    element: <PlaybookEditPage />,
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
