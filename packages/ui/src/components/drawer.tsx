'use client';

import * as React from 'react';
import { Root, Portal, Overlay, Content } from 'vaul';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { cn } from '../lib/utils';
import { Button } from './button';

const Drawer = ({ shouldScaleBackground = true, ...props }: React.ComponentProps<typeof Root>) => (
  <Root shouldScaleBackground={shouldScaleBackground} {...props} />
);

function DrawerTrigger({ className, ...props }: React.ComponentProps<typeof Button>) {
  return <Button data-slot="drawer-trigger" className={className} {...props} />;
}

function DrawerPortal({ ...props }: React.ComponentProps<typeof Portal>) {
  return <Portal data-slot="drawer-portal" {...props} />;
}

function DrawerClose({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="drawer-close" className={className} {...props} />;
}

function DrawerOverlay({ className, ...props }: React.ComponentProps<typeof Overlay>) {
  return (
    <Overlay
      data-slot="drawer-overlay"
      className={cn('fixed inset-0 z-50 bg-black/80', className)}
      {...props}
    />
  );
}

function DrawerContent({ className, children, ...props }: React.ComponentProps<typeof Content>) {
  return (
    <DrawerPortal>
      <DrawerOverlay />
      <Content
        data-slot="drawer-content"
        className={cn(
          'bg-background fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border',
          className,
        )}
        {...props}
      >
        <div className="mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted" />
        {children}
      </Content>
    </DrawerPortal>
  );
}

const DrawerHeader = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div data-slot="drawer-header" className={cn('grid gap-1.5 p-4 text-center sm:text-left', className)} {...props} />
);

const DrawerFooter = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div data-slot="drawer-footer" className={cn('mt-auto flex flex-col gap-2 p-4', className)} {...props} />
);

function DrawerTitle({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="drawer-title"
      className={cn('text-lg font-semibold leading-none tracking-tight', className)}
      {...props}
    />
  );
}

function DrawerDescription({ className, ...props }: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="drawer-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerOverlay,
  DrawerPortal,
  DrawerTitle,
  DrawerTrigger,
};
