import {
  LayoutDashboard,
  LayoutGrid,
  Book,
  Users,
  Puzzle,
  Shield,
  Building,
  ScrollText,
  Settings,
} from 'lucide-react';
import { type MenuConfig } from './types';

export const MENU_SIDEBAR: MenuConfig = [
  { heading: 'Overview' },
  {
    title: 'Dashboard',
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
  {
    title: 'TeamSpec Studio',
    icon: Users,
    children: [
      { title: 'Built-in Teams', path: '/teamspecs/builtin' },
      { title: 'Custom Teams', path: '/teamspecs/custom' },
      { title: 'Create Team', path: '/teamspecs/new' },
    ],
  },
  {
    title: 'Capability Registry',
    icon: Puzzle,
    path: '/capabilities',
  },
  {
    title: 'Policy Engine',
    icon: Shield,
    children: [
      { title: 'Tool Policies', path: '/policies/tools' },
      { title: 'Approval Chains', path: '/policies/approvals' },
    ],
  },
  { heading: 'Management' },
  {
    title: 'Workspaces',
    icon: Building,
    path: '/workspaces',
  },
  {
    title: 'Audit Logs',
    icon: ScrollText,
    path: '/audit-logs',
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/settings',
  },
];

export const MENU_SIDEBAR_COMPACT: MenuConfig = [
  {
    title: 'Dashboard',
    icon: LayoutGrid,
    path: '/',
  },
  {
    title: 'Users',
    icon: Users,
    path: '/users',
  },
  {
    title: 'Settings',
    icon: Settings,
    path: '/settings',
  },
];

export const MENU_MEGA: MenuConfig = [];
export const MENU_MEGA_MOBILE: MenuConfig = [];
export const MENU_SIDEBAR_CUSTOM: MenuConfig = [];
