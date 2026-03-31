import { StoreClientTopbar } from '@/pages/store-client/components/common/topbar';
import { SearchDialog } from '@/partials/dialogs/search/search-dialog';
import { AppsDropdownMenu } from '@/partials/topbar/apps-dropdown-menu';
import { ChatSheet } from '@/partials/topbar/chat-sheet';
import { NotificationsSheet } from '@/partials/topbar/notifications-sheet';
import { UserDropdownMenu } from '@/partials/topbar/user-dropdown-menu';
import {
  LayoutGrid,
  MessageCircleMore,
  MessageSquareDot,
  Search,
  Users,
} from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';

export function HeaderTopbar() {
  const { pathname } = useLocation();

  return (
    <div className="flex items-center gap-2 lg:gap-3.5">
      <>
        {pathname.startsWith('/store-client') ? (
          <StoreClientTopbar />
        ) : (
          <>
            <Button variant="outline" asChild>
              <Link to="/account/members/team-members">
                <Users />
                Add <span className="hidden md:inline">Teammate</span>
              </Link>
            </Button>

            <div className="flex items-center gap-1">
              <SearchDialog
                trigger={
                  <Button
                    variant="ghost"
                    mode="icon"
                    shape="circle"
                    className="hover:bg-transparent hover:[&_svg]:text-primary"
                  >
                    <Search className="size-4.5!" />
                  </Button>
                }
              />
              <ChatSheet
                trigger={
                  <Button
                    variant="ghost"
                    mode="icon"
                    shape="circle"
                    className="hover:bg-transparent hover:[&_svg]:text-primary"
                  >
                    <MessageCircleMore className="size-4.5!" />
                  </Button>
                }
              />
              <AppsDropdownMenu
                trigger={
                  <Button
                    variant="ghost"
                    mode="icon"
                    shape="circle"
                    className="hover:bg-transparent hover:[&_svg]:text-primary"
                  >
                    <LayoutGrid className="size-4.5!" />
                  </Button>
                }
              />
              <NotificationsSheet
                trigger={
                  <Button
                    variant="ghost"
                    mode="icon"
                    shape="circle"
                    className="hover:bg-transparent hover:[&_svg]:text-primary"
                  >
                    <MessageSquareDot className="size-4.5!" />
                  </Button>
                }
              />
            </div>

            <UserDropdownMenu
              trigger={
                <img
                  className="cursor-pointer size-9 rounded-full border-2 border-mono/25 shrink-0"
                  src={toAbsoluteUrl('/media/avatars/300-2.png')}
                  alt="User Avatar"
                />
              }
            />
          </>
        )}
      </>
    </div>
  );
}
