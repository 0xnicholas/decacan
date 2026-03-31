import { useEffect, useState } from 'react';
import { Menu } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { toAbsoluteUrl } from '@/lib/helpers';
import { useIsMobile } from '@/hooks/use-mobile';
import { Button } from '@/components/ui/button';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetHeader,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Container } from '@/components/common/container';
import { SidebarFooter } from './sidebar-footer';
import { SidebarHeader } from './sidebar-header';
import { SidebarMenu } from './sidebar-menu';

export function Header() {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  // Close sheet when route changes
  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  return (
    <header className="flex lg:hidden items-center fixed z-10 top-0 start-0 end-0 shrink-0 bg-mono dark:bg-background h-(--header-height)">
      <Container className="flex items-center justify-between flex-wrap gap-3">
        <Link to="/">
          <img
            src={toAbsoluteUrl('/media/app/mini-logo-circle-success.svg')}
            className="h-[34px]"
            alt=""
          />
        </Link>

        {isMobile && (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="dim" mode="icon" className="hover:text-white">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent
              className="dark p-0 gap-0 w-[250px]"
              side="left"
              close={false}
            >
              <SheetHeader className="p-0 space-y-0" />
              <SheetBody className="p-0 grow flex flex-col overflow-y-auto">
                <SidebarHeader />
                <SidebarMenu />
                <SidebarFooter />
              </SheetBody>
            </SheetContent>
          </Sheet>
        )}
      </Container>
    </header>
  );
}
