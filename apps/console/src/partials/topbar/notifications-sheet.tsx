import { ReactNode } from 'react';
import { Settings, Settings2, Shield, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Sheet,
  SheetBody,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export function NotificationsSheet({ trigger }: { trigger: ReactNode }) {
  return (
    <Sheet>
      <SheetTrigger asChild>{trigger}</SheetTrigger>
      <SheetContent className="p-0 gap-0 sm:w-[500px] sm:max-w-none inset-5 start-auto h-auto rounded-lg p-0 sm:max-w-none [&_[data-slot=sheet-close]]:top-4.5 [&_[data-slot=sheet-close]]:end-5">
        <SheetHeader className="mb-0">
          <SheetTitle className="p-3">
            Notifications
          </SheetTitle>
        </SheetHeader>
        <SheetBody className="grow p-0">
          <ScrollArea className="h-[calc(100vh-10.5rem)]">
            <Tabs defaultValue="all" className="w-full relative">
              <TabsList variant="line" className="w-full px-5 mb-5">
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="inbox" className="relative">
                  Inbox
                </TabsTrigger>
                <TabsTrigger value="team">Team</TabsTrigger>
                <TabsTrigger value="following">Following</TabsTrigger>
                <div className="grow flex items-center justify-end">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        mode="icon"
                        className="mb-1"
                      >
                        <Settings className="size-4.5!" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-44"
                      side="bottom"
                      align="end"
                    >
                      <DropdownMenuItem asChild>
                        <Link to="/account/members/teams">
                          <Users /> Invite Users
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSub>
                        <DropdownMenuSubTrigger>
                          <Settings2 />
                          <span>Team Settings</span>
                        </DropdownMenuSubTrigger>
                        <DropdownMenuPortal>
                          <DropdownMenuSubContent className="w-44">
                            <DropdownMenuItem asChild>
                              <Link to="/account/members/import-members">
                                <Shield />
                                Find Members
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link to="/account/members/import-members">
                                <Shield /> Group Settings
                              </Link>
                            </DropdownMenuItem>
                          </DropdownMenuSubContent>
                        </DropdownMenuPortal>
                      </DropdownMenuSub>
                      <DropdownMenuItem asChild>
                        <Link to="/account/security/privacy-settings">
                          <Shield /> Group Settings
                        </Link>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </TabsList>

              <TabsContent value="all" className="mt-0">
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <p>No notifications</p>
                </div>
              </TabsContent>

              <TabsContent value="inbox" className="mt-0">
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <p>No inbox notifications</p>
                </div>
              </TabsContent>

              <TabsContent value="team" className="mt-0">
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <p>No team notifications</p>
                </div>
              </TabsContent>

              <TabsContent value="following" className="mt-0">
                <div className="flex flex-col items-center justify-center py-10 text-muted-foreground">
                  <p>No following notifications</p>
                </div>
              </TabsContent>
            </Tabs>
          </ScrollArea>
        </SheetBody>
        <SheetFooter className="border-t border-border p-5 grid grid-cols-2 gap-2.5">
          <Button variant="outline">Archive all</Button>
          <Button variant="outline">Mark all as read</Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
