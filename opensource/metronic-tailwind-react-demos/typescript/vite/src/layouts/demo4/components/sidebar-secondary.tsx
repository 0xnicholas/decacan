import { useLocation } from 'react-router';
import { SidebarMenuDashboard } from './sidebar-menu-dashboard';
import { SidebarMenuDefault } from './sidebar-menu-default';

export function SidebarSecondary() {
  const { pathname } = useLocation();

  return (
    <div className="grow shrink-0 ps-3.5 kt-scrollable-y-hover max-h-[calc(100vh-2rem)] pe-1 my-5">
      {pathname === '/' ? <SidebarMenuDashboard /> : <SidebarMenuDefault />}
    </div>
  );
}
