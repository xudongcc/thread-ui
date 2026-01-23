"use client";

import type { ComponentProps, FC } from "react";

import {
  DialogClose as DialogCloseComponent,
  Dialog as DialogComponent,
  DialogContent as DialogContentComponent,
  DialogDescription as DialogDescriptionComponent,
  DialogFooter as DialogFooterComponent,
  DialogHeader as DialogHeaderComponent,
  DialogTitle as DialogTitleComponent,
  DialogTrigger as DialogTriggerComponent,
} from "@/components/ui/dialog";
import {
  DrawerClose as DrawerCloseComponent,
  Drawer as DrawerComponent,
  DrawerContent as DrawerContentComponent,
  DrawerDescription as DrawerDescriptionComponent,
  DrawerFooter as DrawerFooterComponent,
  DrawerHeader as DrawerHeaderComponent,
  DrawerTitle as DrawerTitleComponent,
  DrawerTrigger as DrawerTriggerComponent,
} from "@/components/ui/drawer";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export type DialogProps = ComponentProps<typeof DialogComponent> &
  ComponentProps<typeof DrawerComponent>;

export const Dialog: FC<DialogProps> = ({ children, ...props }) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerComponent {...props}>{children}</DrawerComponent>;
  }

  return <DialogComponent {...props}>{children}</DialogComponent>;
};

export type DialogTriggerProps = ComponentProps<typeof DialogTriggerComponent> &
  ComponentProps<typeof DrawerTriggerComponent>;

export const DialogTrigger: FC<DialogTriggerProps> = (props) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerTriggerComponent {...props} />;
  }

  return <DialogTriggerComponent {...props} />;
};

export type DialogContentProps = ComponentProps<typeof DialogContentComponent> &
  ComponentProps<typeof DrawerContentComponent>;

export const DialogContent: FC<DialogContentProps> = ({
  children,
  className,
  ...props
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <DrawerContentComponent className={cn("gap-4 p-4", className)} {...props}>
        {children}
      </DrawerContentComponent>
    );
  }

  return (
    <DialogContentComponent className={className} {...props}>
      {children}
    </DialogContentComponent>
  );
};

export type DialogHeaderProps = ComponentProps<typeof DialogHeaderComponent> &
  ComponentProps<typeof DrawerHeaderComponent>;

export const DialogHeader: FC<DialogHeaderProps> = ({
  className,
  ...props
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <DrawerHeaderComponent className={cn("p-0", className)} {...props} />
    );
  }

  return <DialogHeaderComponent className={className} {...props} />;
};

export type DialogTitleProps = ComponentProps<typeof DialogTitleComponent> &
  ComponentProps<typeof DrawerTitleComponent>;

export const DialogTitle: FC<DialogTitleProps> = (props) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerTitleComponent {...props} />;
  }

  return <DialogTitleComponent {...props} />;
};

export type DialogDescriptionProps = ComponentProps<
  typeof DialogDescriptionComponent
> &
  ComponentProps<typeof DrawerDescriptionComponent>;

export const DialogDescription: FC<DialogDescriptionProps> = (props) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerDescriptionComponent {...props} />;
  }

  return <DialogDescriptionComponent {...props} />;
};

export type DialogFooterProps = ComponentProps<typeof DialogFooterComponent> &
  ComponentProps<typeof DrawerFooterComponent>;

export const DialogFooter: FC<DialogFooterProps> = ({
  className,
  ...props
}) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return (
      <DrawerFooterComponent className={cn("p-0", className)} {...props} />
    );
  }

  return <DialogFooterComponent className={className} {...props} />;
};

export type DialogCloseProps = ComponentProps<typeof DialogCloseComponent> &
  ComponentProps<typeof DrawerCloseComponent>;

export const DialogClose: FC<DialogCloseProps> = (props) => {
  const isMobile = useIsMobile();

  if (isMobile) {
    return <DrawerCloseComponent {...props} />;
  }

  return <DialogCloseComponent {...props} />;
};
