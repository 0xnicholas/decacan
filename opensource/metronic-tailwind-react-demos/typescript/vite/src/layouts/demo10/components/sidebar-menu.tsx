import { SidebarMenuPrimary } from './sidebar-menu-primary';
import { SidebarMenuSecondary } from './sidebar-menu-secondary';

export function SidebarMenu() {
  return (
    <div className="space-y-5 kt-scrollable-y-auto grow shrink-0 my-5 [--scrollbar-thumb-color:var(--input)] max-h-[calc(100vh-13rem)]">
      <SidebarMenuPrimary />
      <SidebarMenuSecondary />
    </div>
  );
}
