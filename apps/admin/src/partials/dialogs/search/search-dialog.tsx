import { ReactNode, useState } from 'react';
import { Search, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogBody,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  SearchEmpty,
  SearchNoResults,
} from './';

export function SearchDialog({ trigger }: { trigger: ReactNode }) {
  const [searchInput, setSearchInput] = useState('');

  return (
    <Dialog>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="lg:max-w-[600px] lg:top-[15%] lg:translate-y-0 p-0 [&_[data-slot=dialog-close]]:top-5.5 [&_[data-slot=dialog-close]]:end-5.5">
        <DialogHeader className="px-4 py-1 mb-1">
          <DialogTitle></DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="relative">
            <Search className="absolute top-1/2 -translate-y-1/2 size-4" />
            <Input
              type="text"
              name="query"
              value={searchInput}
              className="ps-6 outline-none! ring-0! shadow-none! border-0"
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search..."
            />
          </div>
        </DialogHeader>
        <DialogBody className="p-0 pb-5">
          <Tabs defaultValue="empty">
            <TabsList className="justify-between px-5 mb-2.5" variant="line">
              <div className="flex items-center gap-5">
                <TabsTrigger value="empty">Search</TabsTrigger>
              </div>

              <Button
                variant="ghost"
                mode="icon"
                size="sm"
                className="mb-1.5 -me-2"
              >
                <Settings />
              </Button>
            </TabsList>
            <ScrollArea className="h-[480px]">
              <TabsContent value="empty">
                {searchInput ? (
                  <SearchNoResults />
                ) : (
                  <SearchEmpty />
                )}
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </DialogBody>
      </DialogContent>
    </Dialog>
  );
}
