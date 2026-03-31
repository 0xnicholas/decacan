import { useEffect, useState } from 'react';
import { addDays, format } from 'date-fns';
import { CalendarDays } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Helmet } from 'react-helmet-async';
import { Outlet, useLocation } from 'react-router';
import { MENU_SIDEBAR } from '@/config/menu.config';
import { useBodyClass } from '@/hooks/use-body-class';
import { useMenu } from '@/hooks/use-menu';
import { useIsMobile } from '@/hooks/use-mobile';
import { useSettings } from '@/providers/settings-provider';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Footer } from './components/footer';
import { Header } from './components/header';
import { Navbar } from './components/navbar';
import { Sidebar } from './components/sidebar';
import { Toolbar, ToolbarActions, ToolbarHeading } from './components/toolbar';

const Demo5Layout = () => {
  const isMobile = useIsMobile();
  const { pathname } = useLocation();
  const { setOption } = useSettings();
  const { getCurrentItem } = useMenu(pathname);
  const item = getCurrentItem(MENU_SIDEBAR);

  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2025, 0, 20),
    to: addDays(new Date(2025, 0, 20), 20),
  });

  // Using the custom hook to set multiple CSS variables and class properties
  useBodyClass(`
    [--header-height:54px]
    [--sidebar-width:200px]  
  `);

  useEffect(() => {
    setOption('layout', 'demo5');
    setOption('container', 'fluid');
  }, [setOption]);

  return (
    <>
      <Helmet>
        <title>{item?.title}</title>
      </Helmet>
      <div className="flex grow flex-col in-data-[sticky-header=on]:pt-(--header-height)">
        <Header />

        <Navbar />

        <div className="w-full flex px-0 lg:ps-4">
          {!isMobile && <Sidebar />}

          <main className="flex flex-col grow">
            {!pathname.includes('/public-profile/') && (
              <Toolbar>
                <ToolbarHeading />
                <ToolbarActions>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button id="date" variant="outline" mode="input">
                        <CalendarDays />
                        {date?.from ? (
                          date.to ? (
                            <span>
                              {format(date.from, 'LLL dd, y')} -{' '}
                              {format(date.to, 'LLL dd, y')}
                            </span>
                          ) : (
                            format(date.from, 'LLL dd, y')
                          )
                        ) : (
                          <span>Pick a date range</span>
                        )}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                      <Calendar
                        mode="range"
                        defaultMonth={date?.from}
                        selected={date}
                        onSelect={setDate}
                        numberOfMonths={2}
                      />
                    </PopoverContent>
                  </Popover>
                </ToolbarActions>
              </Toolbar>
            )}

            <Outlet />

            <Footer />
          </main>
        </div>
      </div>
    </>
  );
};

export { Demo5Layout };
