import { SidebarFooter } from './sidebar-footer';
import { SidebarHeader } from './sidebar-header';
import { SidebarMenu } from './sidebar-menu';

export function Sidebar() {
  return (
    <div className="fixed top-0 bottom-0 z-20 lg:flex flex-col shrink-0 w-(--sidebar-width) bg-(--page-bg) dark:bg-(--page-bg-dark)">
      <SidebarHeader />
      <SidebarMenu />
      <SidebarFooter />
    </div>
  );
}
