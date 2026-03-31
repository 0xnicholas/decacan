import { useEffect, useState } from 'react';
import { SearchDialog } from '@/partials/dialogs/search/search-dialog';
import { ChevronsUpDown, Plus, Search } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { MENU_ROOT } from '@/config/menu.config';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export function SidebarHeader() {
  const { pathname } = useLocation();
  const [selectedMenuItem, setSelectedMenuItem] = useState(MENU_ROOT[1]);

  useEffect(() => {
    MENU_ROOT.forEach((item) => {
      if (item.rootPath && pathname.includes(item.rootPath)) {
        setSelectedMenuItem(item);
      }
    });
  }, [pathname]);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="flex items-center justify-between gap-2.5 px-3.5 h-[70px]">
        <Link to="/">
          <img
            src={toAbsoluteUrl('/media/app/mini-logo-circle-success.svg')}
            className="h-[34px]"
            alt=""
          />
        </Link>

        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer text-mono font-medium flex items-center justify-between gap-2 w-[190px]">
            Metronic
            <ChevronsUpDown className="size-3.5! me-1" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            sideOffset={10}
            side="bottom"
            align="start"
            className="dark w-(--radix-popper-anchor-width)"
          >
            {MENU_ROOT.map((item, index) => (
              <DropdownMenuItem
                key={index}
                asChild
                className={cn(item === selectedMenuItem && 'bg-accent')}
              >
                <Link to={item.path || ''}>
                  {item.icon && <item.icon />}
                  {item.title}
                </Link>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex items-center gap-2.5 px-3.5">
        <Button
          asChild
          variant="secondary"
          className="text-white justify-center w-full max-w-[198px]"
        >
          <Link to="/public-profile/projects/3-columns">
            <Plus /> Add New
          </Link>
        </Button>

        <SearchDialog
          trigger={
            <Button
              mode="icon"
              variant="secondary"
              className="justify-center text-white shrink-0"
            >
              <Search className="size-4.5!" />
            </Button>
          }
        />
      </div>
    </div>
  );
}
