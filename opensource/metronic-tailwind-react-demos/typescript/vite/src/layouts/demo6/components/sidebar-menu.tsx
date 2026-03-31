import { SidebarMenuPrimary } from './sidebar-menu-primary';
import { SidebarMenuSecondary } from './sidebar-menu-secondary';

export function SidebarMenu() {
  return (
    <div className="kt-scrollable-y-auto grow max-h-[calc(100vh-11.5rem)]">
      <SidebarMenuPrimary />
      <div className="border-b border-input my-4 mx-5"></div>
      <SidebarMenuSecondary />
    </div>
  );
}
