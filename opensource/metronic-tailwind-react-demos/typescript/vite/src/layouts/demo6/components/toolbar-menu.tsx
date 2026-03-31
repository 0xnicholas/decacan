'use client';

import { Calendar, ChevronDown } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ToolbarMenu = () => {
  const months = [
    { title: 'January, 2024' },
    { title: 'February, 2024' },
    { title: 'March, 2024', active: true },
    { title: 'April, 2024' },
    { title: 'May, 2024' },
    { title: 'June, 2024' },
    { title: 'July, 2024' },
    { title: 'August, 2024' },
    { title: 'September, 2024' },
    { title: 'October, 2024' },
    { title: 'November, 2024' },
    { title: 'December, 2024' },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="flex items-center gap-1 flex-nowrap"
        >
          <Calendar className="h-4 w-4" />
          <span className="hidden md:inline whitespace-nowrap">
            September, 2024
          </span>
          <span className="inline md:hidden whitespace-nowrap">Sep, 2024</span>
          <ChevronDown className="h-3 w-3 ml-1 lg:ml-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        className="w-48 max-h-[250px] overflow-y-auto"
      >
        {months.map((item, index) => (
          <DropdownMenuItem
            key={index}
            className={item.active ? 'bg-muted font-medium' : ''}
            asChild
          >
            <Link to="/" className="w-full">
              {item.title}
            </Link>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export { ToolbarMenu };
