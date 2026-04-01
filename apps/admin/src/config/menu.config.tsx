import {
  LayoutDashboard,
  LayoutGrid,
  Book,
  // Users,  // TODO: Enable when TeamSpec Studio is implemented
  // Puzzle, // TODO: Enable when Capability Registry is implemented
  // Shield, // TODO: Enable when Policy Engine is implemented
  // Building, // TODO: Enable when Workspaces is implemented
  // ScrollText, // TODO: Enable when Audit Logs is implemented
  // Settings, // TODO: Enable when Settings is implemented
} from 'lucide-react';
import { type MenuConfig } from './types';

export const MENU_SIDEBAR: MenuConfig = [
  { heading: 'Overview' },
  {
    title: 'Console',
    icon: LayoutDashboard,
    path: '/',
  },
  { heading: 'Configuration' },
  {
    title: 'Playbook Studio',
    icon: Book,
    children: [
      { title: 'All Playbooks', path: '/playbooks' },
      { title: 'Create New', path: '/playbooks/new' },
    ],
  },
  // TODO: Enable when TeamSpec Studio is implemented
  // {
  //   title: 'TeamSpec Studio',
  //   icon: Users,
  //   children: [
  //     { title: 'Built-in Teams', path: '/teamspecs/builtin' },
  //     { title: 'Custom Teams', path: '/teamspecs/custom' },
  //     { title: 'Create Team', path: '/teamspecs/new' },
  //   ],
  // },
  // TODO: Enable when Capability Registry is implemented
  // {
  //   title: 'Capability Registry',
  //   icon: Puzzle,
  //   path: '/capabilities',
  // },
  // TODO: Enable when Policy Engine is implemented
  // {
  //   title: 'Policy Engine',
  //   icon: Shield,
  //   children: [
  //     { title: 'Tool Policies', path: '/policies/tools' },
  //     { title: 'Approval Chains', path: '/policies/approvals' },
  //   ],
  // },
  // TODO: Enable when Management features are implemented
  // { heading: 'Management' },
  // {
  //   title: 'Workspaces',
  //   icon: Building,
  //   path: '/workspaces',
  // },
  // {
  //   title: 'Audit Logs',
  //   icon: ScrollText,
  //   path: '/audit-logs',
  // },
  // {
  //   title: 'Settings',
  //   icon: Settings,
  //   path: '/settings',
  // },
];

export const MENU_SIDEBAR_COMPACT: MenuConfig = [
  {
    title: 'Console',
    icon: LayoutGrid,
    path: '/',
  },
  // TODO: Enable when Users feature is implemented
  // {
  //   title: 'Users',
  //   icon: Users,
  //   path: '/users',
  // },
  // TODO: Enable when Settings is implemented
  // {
  //   title: 'Settings',
  //   icon: Settings,
  //   path: '/settings',
  // },
];

export const MENU_MEGA: MenuConfig = [];
export const MENU_MEGA_MOBILE: MenuConfig = [];
export const MENU_SIDEBAR_CUSTOM: MenuConfig = [];
