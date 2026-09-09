"use client";

import * as React from "react";
import { useIsMobile } from "@/hooks/use-mobile";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "cn";

interface ResponsiveDialogContextValue {
  isMobile: boolean;
}

const ResponsiveDialogContext = React.createContext<ResponsiveDialogContextValue>({
  isMobile: false,
});

export function useResponsiveDialog() {
  return React.useContext(ResponsiveDialogContext);
}

export interface ResponsiveDialogProps {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}

export function ResponsiveDialog({
  children,
  open,
  onOpenChange,
  defaultOpen,
}: ResponsiveDialogProps) {
  const isMobile = useIsMobile();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const effectiveIsMobile = mounted ? isMobile : false;

  const contextValue = React.useMemo(
    () => ({ isMobile: effectiveIsMobile }),
    [effectiveIsMobile]
  );

  if (effectiveIsMobile) {
    return (
      <ResponsiveDialogContext.Provider value={contextValue}>
        <Drawer
          open={open}
          onOpenChange={onOpenChange}
          defaultOpen={defaultOpen}
          showSwipeHandle
        >
          {children}
        </Drawer>
      </ResponsiveDialogContext.Provider>
    );
  }

  return (
    <ResponsiveDialogContext.Provider value={contextValue}>
      <Dialog
        open={open}
        onOpenChange={onOpenChange}
        defaultOpen={defaultOpen}
      >
        {children}
      </Dialog>
    </ResponsiveDialogContext.Provider>
  );
}

export interface ResponsiveDialogTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function ResponsiveDialogTrigger({
  children,
  asChild,
  className,
  ...props
}: ResponsiveDialogTriggerProps) {
  const { isMobile } = useResponsiveDialog();

  if (asChild && React.isValidElement(children)) {
    if (isMobile) {
      return (
        <DrawerTrigger
          render={React.cloneElement(children, {
            className: cn((children.props as any).className, className),
            ...props,
          } as any)}
        />
      );
    }
    return (
      <DialogTrigger
        render={React.cloneElement(children, {
          className: cn((children.props as any).className, className),
          ...props,
        } as any)}
      />
    );
  }

  if (isMobile) {
    return (
      <DrawerTrigger className={className} {...(props as any)}>
        {children}
      </DrawerTrigger>
    );
  }
  return (
    <DialogTrigger className={className} {...(props as any)}>
      {children}
    </DialogTrigger>
  );
}

export interface ResponsiveDialogContentProps {
  children?: React.ReactNode;
  className?: string;
}

export function ResponsiveDialogContent({
  className,
  children,
}: ResponsiveDialogContentProps) {
  const { isMobile } = useResponsiveDialog();
  if (isMobile) {
    return (
      <DrawerContent
        className={cn(
          "max-h-[90dvh] flex flex-col px-4 pb-6",
          className
        )}
      >
        {children}
      </DrawerContent>
    );
  }
  return (
    <DialogContent
      className={cn(
        "sm:max-w-lg max-h-[90vh] flex flex-col overflow-y-auto",
        className
      )}
    >
      {children}
    </DialogContent>
  );
}

export interface ResponsiveDialogHeaderProps {
  children?: React.ReactNode;
  className?: string;
}

export function ResponsiveDialogHeader({
  className,
  children,
}: ResponsiveDialogHeaderProps) {
  const { isMobile } = useResponsiveDialog();
  if (isMobile) {
    return (
      <DrawerHeader className={cn("text-left px-0 pb-2 shrink-0", className)}>
        {children}
      </DrawerHeader>
    );
  }
  return (
    <DialogHeader className={cn("pb-2 shrink-0", className)}>
      {children}
    </DialogHeader>
  );
}

export interface ResponsiveDialogTitleProps {
  children?: React.ReactNode;
  className?: string;
}

export function ResponsiveDialogTitle({
  className,
  children,
}: ResponsiveDialogTitleProps) {
  const { isMobile } = useResponsiveDialog();
  if (isMobile) {
    return (
      <DrawerTitle className={cn("text-lg font-bold", className)}>
        {children}
      </DrawerTitle>
    );
  }
  return (
    <DialogTitle className={cn("text-lg font-bold", className)}>
      {children}
    </DialogTitle>
  );
}

export interface ResponsiveDialogDescriptionProps {
  children?: React.ReactNode;
  className?: string;
}

export function ResponsiveDialogDescription({
  className,
  children,
}: ResponsiveDialogDescriptionProps) {
  const { isMobile } = useResponsiveDialog();
  if (isMobile) {
    return (
      <DrawerDescription className={cn("text-xs text-muted-foreground", className)}>
        {children}
      </DrawerDescription>
    );
  }
  return (
    <DialogDescription className={cn("text-xs text-muted-foreground", className)}>
      {children}
    </DialogDescription>
  );
}

export interface ResponsiveDialogBodyProps extends React.ComponentProps<"div"> {
  scrollable?: boolean;
}

export function ResponsiveDialogBody({
  className,
  children,
  scrollable = true,
  ...props
}: ResponsiveDialogBodyProps) {
  return (
    <div
      data-slot="responsive-dialog-body"
      className={cn(
        "flex-1 min-h-0",
        scrollable && "overflow-y-auto overscroll-contain touch-auto pr-1",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface ResponsiveDialogScrollAreaProps
  extends React.ComponentProps<typeof ScrollArea> {}

export function ResponsiveDialogScrollArea({
  className,
  children,
  ...props
}: ResponsiveDialogScrollAreaProps) {
  return (
    <ScrollArea
      data-slot="responsive-dialog-scroll-area"
      className={cn("flex-1 min-h-0 w-full", className)}
      {...props}
    >
      {children}
    </ScrollArea>
  );
}

export interface ResponsiveDialogFooterProps {
  children?: React.ReactNode;
  className?: string;
}

export function ResponsiveDialogFooter({
  className,
  children,
}: ResponsiveDialogFooterProps) {
  const { isMobile } = useResponsiveDialog();
  if (isMobile) {
    return (
      <DrawerFooter className={cn("flex flex-col gap-2 pt-4 px-0 shrink-0", className)}>
        {children}
      </DrawerFooter>
    );
  }
  return (
    <DialogFooter className={cn("pt-4 shrink-0", className)}>
      {children}
    </DialogFooter>
  );
}

export interface ResponsiveDialogCloseProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
}

export function ResponsiveDialogClose({
  children,
  asChild,
  className,
  ...props
}: ResponsiveDialogCloseProps) {
  const { isMobile } = useResponsiveDialog();

  if (asChild && React.isValidElement(children)) {
    if (isMobile) {
      return (
        <DrawerClose
          render={React.cloneElement(children, {
            className: cn((children.props as any).className, className),
            ...props,
          } as any)}
        />
      );
    }
    return (
      <DialogClose
        render={React.cloneElement(children, {
          className: cn((children.props as any).className, className),
          ...props,
        } as any)}
      />
    );
  }

  if (isMobile) {
    return (
      <DrawerClose className={className} {...(props as any)}>
        {children}
      </DrawerClose>
    );
  }
  return (
    <DialogClose className={className} {...(props as any)}>
      {children}
    </DialogClose>
  );
}
