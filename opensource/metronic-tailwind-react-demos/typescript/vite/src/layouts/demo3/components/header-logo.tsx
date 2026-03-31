import { useEffect, useState } from 'react';
import { ChevronDown, Menu } from 'lucide-react';
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
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { SidebarMenu } from './sidebar-menu';

export function HeaderLogo() {
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
    <div className="flex items-center gap-2.5">
      {/* Logo */}
      <div className="flex items-center justify-center lg:w-(--sidebar-width) shrink-0">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" mode="icon" className="-ms-2 lg:hidden">
              <Menu className="size-4!" />
            </Button>
          </SheetTrigger>
          <SheetContent
            className="p-0 gap-0 w-(--sidebar-width)"
            side="left"
            close={false}
          >
            <SheetHeader className="p-0 space-y-0" />
            <SheetBody className="p-0 overflow-y-auto">
              <SidebarMenu />
            </SheetBody>
          </SheetContent>
        </Sheet>

        <Link to="/" className="mx-1">
          <img
            src={toAbsoluteUrl('/media/app/mini-logo-primary.svg')}
            className="dark:hidden min-h-[24px]"
            alt="logo"
          />
          <img
            src={toAbsoluteUrl('/media/app/mini-logo-primary-dark.svg')}
            className="hidden dark:inline-block min-h-[24px]"
            alt="logo"
          />
        </Link>
      </div>

      {/* Menu Section */}
      <div className="flex items-center gap-3">
        <h3 className="text-accent-foreground text-base hidden md:block">
          Metronic Team
        </h3>
        <span className="text-sm text-muted-foreground font-medium hidden md:inline">
          /
        </span>

        <DropdownMenu>
          <DropdownMenuTrigger className="cursor-pointer text-mono font-medium flex items-center gap-2">
            {selectedMenuItem.title}
            <ChevronDown className="size-3.5! text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent sideOffset={10} side="bottom" align="start">
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
    </div>
  );
}
