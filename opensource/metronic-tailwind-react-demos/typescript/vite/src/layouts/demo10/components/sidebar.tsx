import { SidebarFooter } from './sidebar-footer';
import { SidebarHeader } from './sidebar-header';
import { SidebarMenu } from './sidebar-menu';

export function Sidebar() {
  return (
    <div className="flex-col fixed top-0 bottom-0 z-20 lg:flex items-stretch shrink-0 w-(--sidebar-width) dark">
      <SidebarHeader />
      <SidebarMenu />
      <SidebarFooter />
    </div>
  );
}
