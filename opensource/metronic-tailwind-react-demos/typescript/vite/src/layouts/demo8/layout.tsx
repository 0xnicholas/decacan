import { useEffect } from 'react';
import { StoreClientTopbar } from '@/pages/store-client/components/common/topbar';
import { SearchDialog } from '@/partials/dialogs/search/search-dialog';
import { ChatSheet } from '@/partials/topbar/chat-sheet';
import { Download, MessageCircleMore, Search } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { MENU_SIDEBAR } from '@/config/menu.config';
import { useBodyClass } from '@/hooks/use-body-class';
import { useMenu } from '@/hooks/use-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSettings } from '@/providers/settings-provider';
import { Button } from '@/components/ui/button';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { Sidebar } from './components/sidebar';
import { Toolbar, ToolbarActions, ToolbarHeading } from './components/toolbar';

export function Demo8Layout() {
  const isMobile = useIsMobile();
  const { setOption } = useSettings();
  const { pathname } = useLocation();
  const { getCurrentItem } = useMenu(pathname);
  const item = getCurrentItem(MENU_SIDEBAR);

  // Using the custom hook to set classes on the body
  useBodyClass(`
    [--header-height:60px]
    [--sidebar-width:90px]
    bg-muted!
  `);

  useEffect(() => {
    setOption('layout', 'demo8');
  }, [setOption]);

  return (
    <>
      <Helmet>
        <title>{item?.title}</title>
      </Helmet>

      <div className="flex grow">
        {isMobile && <Header />}

        <div className="flex flex-col lg:flex-row grow pt-(--header-height) lg:pt-0">
          {!isMobile && <Sidebar />}

          <div className="flex flex-col grow rounded-xl bg-background border border-input lg:ms-(--sidebar-width) mt-0 m-4 lg:m-5">
            <div className="flex flex-col grow kt-scrollable-y-auto lg:[scrollbar-width:auto] pt-5">
              <main className="grow" role="content">
                <Toolbar>
                  <ToolbarHeading />

                  <ToolbarActions>
                    <>
                      {pathname.startsWith('/store-client') ? (
                        <StoreClientTopbar />
                      ) : (
                        <>
                          <SearchDialog
                            trigger={
                              <Button
                                variant="ghost"
                                mode="icon"
                                className="hover:[&_svg]:text-primary"
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
                                className="hover:[&_svg]:text-primary"
                              >
                                <MessageCircleMore className="size-4.5!" />
                              </Button>
                            }
                          />
                          <Button
                            variant="outline"
                            asChild
                            className="ms-2.5 hover:text-primary hover:[&_svg]:text-primary"
                          >
                            <Link to={'/account/home/get-started'}>
                              <Download />
                              Export
                            </Link>
                          </Button>
                        </>
                      )}
                    </>
                  </ToolbarActions>
                </Toolbar>

                <Outlet />
              </main>
            </div>

            <Footer />
          </div>
        </div>
      </div>
    </>
  );
}
