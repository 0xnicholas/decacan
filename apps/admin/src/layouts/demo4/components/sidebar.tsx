import { SidebarPrimary } from './sidebar-primary';
import { SidebarSecondary } from './sidebar-secondary';

export function Sidebar() {
  return (
    <div className="fixed top-0 bottom-0 z-20 flex items-stretch shrink-0 w-(--sidebar-width) bg-muted">
      <SidebarPrimary />
      <SidebarSecondary />
    </div>
  );
}
