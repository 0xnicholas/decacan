import { SidebarFooter } from './sidebar-footer';
import { SidebarHeader } from './sidebar-header';
import { SidebarMenu } from './sidebar-menu';

export function Sidebar() {
  return (
    <div className="grow fixed top-0 bottom-0 z-20 flex flex-col items-stretch shrink-0 bg-muted w-(--sidebar-width)">
      <SidebarHeader />
      <SidebarMenu />
      <SidebarFooter />
    </div>
  );
}
