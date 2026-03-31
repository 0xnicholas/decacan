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

const Header = () => {
  const { pathname } = useLocation();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const isMobile = useIsMobile();

  // Close sheet when route changes
  useEffect(() => {
    setIsSheetOpen(false);
  }, [pathname]);

  return (
    <header className="flex lg:hidden items-center fixed z-10 top-0 start-0 end-0 shrink-0 bg-muted h-(--header-height)">
      <Container className="flex items-center justify-between flex-wrap gap-3">
        <Link to="/">
          <img
            src={toAbsoluteUrl('/media/app/mini-logo-gray.svg')}
            className="dark:hidden min-h-[30px]"
            alt="image"
          />
          <img
            src={toAbsoluteUrl('/media/app/mini-logo-gray-dark.svg')}
            className="hidden dark:block min-h-[30px]"
            alt="image"
          />
        </Link>

        {isMobile && (
          <Sheet open={isSheetOpen} onOpenChange={setIsSheetOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" mode="icon">
                <Menu />
              </Button>
            </SheetTrigger>
            <SheetContent
              className="p-0 gap-0 w-[275px]"
              side="left"
              close={false}
            >
              <SheetHeader className="p-0 space-y-0" />
              <SheetBody className="p-0 flex flex-col grow">
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
};

export { Header };
