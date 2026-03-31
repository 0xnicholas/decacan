import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

export function HeaderSearch() {
  const handleInputChange = () => {};

  return (
    <div className="hidden md:flex items-center">
      <div className="relative">
        <Search className="text-muted-foreground absolute top-1/2 start-3.5 -translate-y-1/2 size-4" />
        <Input
          placeholder="Search"
          onChange={handleInputChange}
          className="px-9 min-w-0"
          value=""
        />
        <span className="text-xs text-muted-foreground absolute end-3.5 top-1/2 -translate-y-1/2">
          cmd + /
        </span>
      </div>
    </div>
  );
}
