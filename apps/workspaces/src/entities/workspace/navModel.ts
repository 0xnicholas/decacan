import type { WorkspaceSection } from './routeModel';

export interface NavItemMeta {
  key: WorkspaceSection | string;
  navLabel: string;
  pathSegment: string | null;
}

export const defaultNavItems: NavItemMeta[] = [
  { key: 'home', navLabel: 'Home', pathSegment: null },
  { key: 'tasks', navLabel: 'Tasks', pathSegment: 'tasks' },
  { key: 'deliverables', navLabel: 'Deliverables', pathSegment: 'deliverables' },
  { key: 'approvals', navLabel: 'Approvals', pathSegment: 'approvals' },
  { key: 'activity', navLabel: 'Activity', pathSegment: 'activity' },
  { key: 'members', navLabel: 'Members', pathSegment: 'members' },
];

const profileNavExtensions: Record<string, NavItemMeta[]> = {
  'short-drama-v1': [
    { key: 'script', navLabel: '剧本管理', pathSegment: 'script' },
    { key: 'storyboard', navLabel: '分镜板', pathSegment: 'storyboard' },
    { key: 'art-resources', navLabel: '美术资源库', pathSegment: 'art-resources' },
  ],
};

export function getNavItemsForProfile(profileId: string | null): NavItemMeta[] {
  if (!profileId) return defaultNavItems;
  const extended = profileNavExtensions[profileId] ?? [];
  return [...defaultNavItems, ...extended];
}