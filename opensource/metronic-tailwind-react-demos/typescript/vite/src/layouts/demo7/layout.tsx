import { useEffect, useState } from 'react';
import { addDays, format } from 'date-fns';
import { CalendarDays, Download } from 'lucide-react';
import { DateRange } from 'react-day-picker';
import { Helmet } from 'react-helmet-async';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { MENU_SIDEBAR } from '@/config/menu.config';
import { useBodyClass } from '@/hooks/use-body-class';
import { useMenu } from '@/hooks/use-menu';
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
import { Toolbar, ToolbarActions, ToolbarHeading } from './components/toolbar';

const Demo7Layout = () => {
  const { setOption } = useSettings();
  const { pathname } = useLocation();
  const { getCurrentItem } = useMenu(pathname);
  const item = getCurrentItem(MENU_SIDEBAR);

  const [date, setDate] = useState<DateRange | undefined>({
    from: new Date(2025, 0, 20),
    to: addDays(new Date(2025, 0, 20), 20),
  });

  // Using the custom hook to set multiple CSS variables and class properties
  useBodyClass(`
    [--header-height-default:95px]
    data-[sticky-header=on]:[--header-height:60px]
    [--header-height:var(--header-height-default)]	
    [--header-height-mobile:70px]	
  `);

  useEffect(() => {
    setOption('layout', 'demo7');
  }, [setOption]);

  return (
    <>
      <Helmet>
        <title>{item?.title}</title>
      </Helmet>
      <div className="flex grow flex-col in-data-[sticky-header=on]:pt-(--header-height-default)">
        <Header />

        <div className="grow" role="content">
          {!pathname.includes('/public-profile/') && (
            <Toolbar>
              <ToolbarHeading />

              <ToolbarActions>
                <Button variant="outline" asChild>
                  <Link to={'/account/home/get-started'}>
                    <Download />
                    Export
                  </Link>
                </Button>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button id="date" variant="outline">
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
        </div>

        <Footer />
      </div>
    </>
  );
};

export { Demo7Layout };
