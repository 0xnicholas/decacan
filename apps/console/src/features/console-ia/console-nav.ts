import {
  Bot,
  BriefcaseBusiness,
  LayoutDashboard,
  Settings2,
  type LucideIcon,
} from 'lucide-react';

export type ConsoleDomainId = 'workspaces' | 'agents' | 'dashboard' | 'manage';
export type MenuPermission = 'console.home' | 'studio.playbooks';

export interface ConsoleNavItem {
  title: string;
  path: string;
  requiredPermission?: MenuPermission;
}

export interface ConsoleNavDomain {
  id: ConsoleDomainId;
  title: string;
  icon: LucideIcon;
  path: string;
  requiredPermission?: MenuPermission;
  children: readonly ConsoleNavItem[];
}

export const CONSOLE_NAV: readonly ConsoleNavDomain[] = [
  {
    id: 'workspaces',
    title: 'Workspaces',
    icon: BriefcaseBusiness,
    path: '/workspaces',
    requiredPermission: 'console.home',
    children: [
      { title: 'Workbench', path: '/workspaces/workbench' },
      { title: 'All Workspaces', path: '/workspaces/all' },
      { title: 'Approvals', path: '/workspaces/approvals' },
      { title: 'Runs', path: '/workspaces/runs' },
      { title: 'Members', path: '/workspaces/members' },
    ],
  },
  {
    id: 'agents',
    title: 'Agents',
    icon: Bot,
    path: '/agents',
    requiredPermission: 'console.home',
    children: [
      { title: 'Quickstart', path: '/agents/quickstart' },
      { title: 'All Agents', path: '/agents/all' },
      {
        title: 'Playbooks',
        path: '/agents/playbooks',
        requiredPermission: 'studio.playbooks',
      },
      { title: 'Teams', path: '/agents/teams' },
      { title: 'Capabilities', path: '/agents/capabilities' },
      { title: 'Policies', path: '/agents/policies' },
    ],
  },
  {
    id: 'dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
    path: '/dashboard',
    requiredPermission: 'console.home',
    children: [
      { title: 'Analytics', path: '/dashboard/analytics' },
      { title: 'My Work', path: '/dashboard/my-work' },
      { title: 'Attention', path: '/dashboard/attention' },
    ],
  },
  {
    id: 'manage',
    title: 'Manage',
    icon: Settings2,
    path: '/manage',
    requiredPermission: 'console.home',
    children: [
      { title: 'Account', path: '/manage/account' },
      { title: 'Users', path: '/manage/users' },
      { title: 'Audit Logs', path: '/manage/audit-logs' },
      { title: 'Integrations', path: '/manage/integrations' },
      { title: 'Settings', path: '/manage/settings' },
    ],
  },
] as const;
