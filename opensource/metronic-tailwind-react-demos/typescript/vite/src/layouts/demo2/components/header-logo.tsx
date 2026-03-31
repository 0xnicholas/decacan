import { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { MENU_ROOT } from '@/config/menu.config';
import { toAbsoluteUrl } from '@/lib/helpers';
import { cn } from '@/lib/utils';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

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
    <div className="flex items-center gap-2 lg:gap-5 2xl:-ms-[60px]">
      {/* Logo Section */}
      <Link to="/" className="shrink-0">
        <img
          src={toAbsoluteUrl('/media/app/mini-logo-circle.svg')}
          className="dark:hidden min-h-[42px]"
          alt="logo"
        />
        <img
          src={toAbsoluteUrl('/media/app/mini-logo-circle-dark.svg')}
          className="hidden dark:inline-block min-h-[42px]"
          alt="logo"
        />
      </Link>

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
            <ChevronDown className="size-4 text-muted-foreground" />
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
