import { type LucideIcon } from 'lucide-react';

export interface MenuItem {
  title?: string;
  icon?: LucideIcon;
  path?: string;
  rootPath?: string;
  requiredPermission?: 'console.home' | 'studio.playbooks';
  childrenIndex?: number;
  heading?: string;
  children?: MenuConfig;
  disabled?: boolean;
  collapse?: boolean;
  collapseTitle?: string;
  expandTitle?: string;
  badge?: string;
  separator?: boolean;
}

export type MenuConfig = MenuItem[];

export interface Settings {
  container: 'fixed' | 'fluid';
  layout: string;
  layouts: {
    default: {
      sidebarCollapse: boolean;
      sidebarTheme: 'light' | 'dark';
    };
  };
}
