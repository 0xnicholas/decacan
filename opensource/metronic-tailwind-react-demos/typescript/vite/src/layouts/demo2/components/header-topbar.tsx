import { StoreClientTopbar } from '@/pages/store-client/components/common/topbar';
import { SearchDialog } from '@/partials/dialogs/search/search-dialog';
import { ChatSheet } from '@/partials/topbar/chat-sheet';
import { NotificationsSheet } from '@/partials/topbar/notifications-sheet';
import { UserDropdownMenu } from '@/partials/topbar/user-dropdown-menu';
import { MessageCircleMore, MessageSquareDot, Search } from 'lucide-react';
import { useLocation } from 'react-router';
import { toAbsoluteUrl } from '@/lib/helpers';
import { Button } from '@/components/ui/button';

export function HeaderTopbar() {
  const { pathname } = useLocation();

  return (
    <>
      {pathname.startsWith('/store-client') ? (
        <StoreClientTopbar />
      ) : (
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <SearchDialog
              trigger={
                <Button
                  variant="ghost"
                  mode="icon"
                  shape="circle"
                  className="size-9"
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
                  className="size-9"
                >
                  <MessageCircleMore className="size-4.5!" />
                </Button>
              }
            />
            <NotificationsSheet
              trigger={
                <Button
                  variant="ghost"
                  mode="icon"
                  size="sm"
                  shape="circle"
                  className="size-9"
                >
                  <MessageSquareDot className="size-4.5!" />
                </Button>
              }
            />
          </div>
          <UserDropdownMenu
            trigger={
              <img
                className="cursor-pointer size-9 rounded-full justify-center border border-gray-500 shrink-0"
                src={toAbsoluteUrl('/media/avatars/gray/5.png')}
                alt=""
              />
            }
          />
        </div>
      )}
    </>
  );
}
