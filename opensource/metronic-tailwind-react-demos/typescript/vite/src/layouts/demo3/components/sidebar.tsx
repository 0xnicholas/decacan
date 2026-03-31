import { SidebarMenu } from './sidebar-menu';

export function Sidebar() {
  return (
    <div className="fixed w-(--sidebar-width) lg:top-(--header-height) top-0 bottom-0 z-20 lg:flex flex-col items-stretch shrink-0 group py-3 lg:py-0">
      <div className="flex grow shrink-0">
        <div className="kt-scrollable-y-auto grow gap-2.5 shrink-0 flex items-center flex-col max-h-[calc(100vh-3rem)]">
          <SidebarMenu />
        </div>
      </div>
    </div>
  );
}
