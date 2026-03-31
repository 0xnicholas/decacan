import { useLocation } from 'react-router-dom';
import { SidebarMenuDashboard } from './sidebar-menu-dashboard';
import { SidebarMenuDefault } from './sidebar-menu-default';

export function Sidebar() {
  const { pathname } = useLocation();

  return (
    <div className="flex items-stretch shrink-0 px-2 w-(--sidebar-width) bg-background">
      {pathname === '/' ? <SidebarMenuDashboard /> : <SidebarMenuDefault />}
    </div>
  );
}
