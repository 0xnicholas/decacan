import { LayoutGrid } from 'lucide-react';
import { CONSOLE_NAV, type MenuPermission } from '@/features/console-ia/console-nav';
import { consoleRouteDefaults } from '@/features/console-ia/route-defaults';
import { type MenuConfig } from './types';

export function filterMenuByPermission(
  items: MenuConfig,
  hasPermission: (permission: MenuPermission) => boolean,
): MenuConfig {
  return items.flatMap((item) => {
    if (item.requiredPermission && !hasPermission(item.requiredPermission)) {
      return [];
    }

    if (item.children) {
      const children = filterMenuByPermission(item.children, hasPermission);
      if (!children.length) {
        return [];
      }

      return [{ ...item, children }];
    }

    return [item];
  });
}

export const MENU_SIDEBAR: MenuConfig = CONSOLE_NAV.map((domain) => ({
  title: domain.title,
  icon: domain.icon,
  path: domain.path,
  rootPath: domain.path,
  requiredPermission: domain.requiredPermission,
  children: domain.children.map((item) => ({
    title: item.title,
    path: item.path,
    rootPath: item.path,
    requiredPermission: item.requiredPermission,
  })),
}));

export const MENU_SIDEBAR_COMPACT: MenuConfig = [
  {
    title: 'Console',
    icon: LayoutGrid,
    path: consoleRouteDefaults.dashboard,
    requiredPermission: 'console.home',
  },
];

export const MENU_MEGA: MenuConfig = [];
export const MENU_MEGA_MOBILE: MenuConfig = [];
export const MENU_SIDEBAR_CUSTOM: MenuConfig = [];
