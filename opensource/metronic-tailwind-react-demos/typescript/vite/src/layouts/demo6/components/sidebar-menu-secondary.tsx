'use client';

import { Fragment } from 'react';
import {
  Activity,
  BarChart,
  ChevronDown,
  Database,
  FileText,
  Lock,
  Share2,
  Star,
  Users,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  AccordionMenu,
  AccordionMenuClassNames,
  AccordionMenuItem,
  AccordionMenuSeparator,
  AccordionMenuSub,
  AccordionMenuSubContent,
  AccordionMenuSubTrigger,
} from '@/components/ui/accordion-menu';

interface Item {
  title: string;
  value: string;
  plus?: boolean;
  children: ItemChild[];
}

interface ItemChild {
  icon?: LucideIcon;
  title: string;
  path: string;
  active?: boolean;
}

export function SidebarMenuSecondary() {
  const items: Item[] = [
    {
      title: 'Spaces',
      value: 'spaces',
      plus: true,
      children: [
        {
          icon: BarChart,
          title: 'Metrics Hub',
          path: 'public-profile/profiles/creator',
        },
        {
          icon: Database,
          title: 'Data Lab',
          active: true,
          path: 'public-profile/profiles/company',
        },
        {
          icon: Share2,
          title: 'Creative Commons',
          path: 'public-profile/profiles/nft',
        },
        {
          icon: Activity,
          title: 'KPI Monitor',
          path: 'public-profile/profiles/blogger',
        },
      ],
    },
    {
      title: 'Favorites',
      value: 'favorites',
      plus: false,
      children: [
        {
          icon: Star,
          title: 'Post Date',
          path: 'network/user-cards/mini-cards',
        },
        {
          icon: FileText,
          title: 'Licencias Creative',
          path: 'network/user-cards/team-crew',
        },
        {
          icon: Users,
          title: 'Open Content',
          path: 'network/user-cards/author',
        },
        { icon: Lock, title: 'Copyright', path: 'network/user-cards/nft' },
      ],
    },
  ];

  const classNames: AccordionMenuClassNames = {
    root: 'flex flex-col w-full gap-1.5 px-3.5',
    group: 'gap-px',
    item: 'group h-9 hover:bg-transparent border border-transparent text-accent-foreground hover:text-primary hover:bg-background hover:border-border data-[selected=true]:text-primary data-[selected=true]:bg-background data-[selected=true]:border-border data-[selected=true]:font-medium',
    sub: '',
    subTrigger:
      'justify-between h-9 hover:bg-transparent border border-transparent text-accent-foreground hover:text-primary data-[selected=true]:text-primary data-[selected=true]:bg-background data-[selected=true]:border-border data-[selected=true]:font-medium [&_[data-slot=accordion-menu-sub-indicator]]:hidden',
    subContent: 'p-0',
    subWrapper: 'space-y-1.5',
    indicator: 'text-sm text-muted-foreground',
  };

  return (
    <>
      <AccordionMenu
        type="single"
        collapsible
        classNames={classNames}
        defaultValue="spaces"
      >
        {items.map((item, index) => (
          <Fragment key={index}>
            <AccordionMenuSub value={item.value}>
              <AccordionMenuSubTrigger>
                <div className="flex items-center gap-2">
                  <ChevronDown className={cn('text-sm')} />
                  <span>{item.title}</span>
                </div>
              </AccordionMenuSubTrigger>
              <AccordionMenuSubContent
                type="single"
                collapsible
                parentValue={item.value}
              >
                {item.children.map((child, childIndex) => (
                  <AccordionMenuItem
                    key={childIndex}
                    value={child.path}
                    className={cn(child.active && 'active')}
                  >
                    <Link to={child.path} className="flex items-center gap-2">
                      {child.icon && (
                        <span className="rounded-md size-7 flex items-center justify-center border border-border text-foreground group-hover:border-transparent">
                          <child.icon className="size-4" />
                        </span>
                      )}
                      {child.title}
                    </Link>
                  </AccordionMenuItem>
                ))}
              </AccordionMenuSubContent>
            </AccordionMenuSub>
            {index !== items.length - 1 && (
              <AccordionMenuSeparator className="border-b border-input my-2 mx-1.5" />
            )}
          </Fragment>
        ))}
      </AccordionMenu>
    </>
  );
}
