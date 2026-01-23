"use client";

import { cva } from "class-variance-authority";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, FC, PropsWithChildren } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const contextualSaveBarBaseVariants = cva(
  "fixed top-0 right-0 left-0 z-50 h-16 border-b bg-background text-foreground md:left-(--sidebar-width) md:group-has-data-[collapsible=icon]/sidebar-wrapper:left-(--sidebar-width-icon)",
  {
    variants: {
      absolute: {
        true: "absolute w-full",
      },
    },
    defaultVariants: {
      absolute: false,
    },
  },
);

const contextualSaveBarContentVariants = cva(
  "mx-auto flex size-full max-w-5xl items-center justify-end px-4",
  {
    variants: {
      fullWidth: {
        true: "max-w-full",
      },
    },
    defaultVariants: {
      fullWidth: false,
    },
  },
);

export type ContextualSaveBarProps = PropsWithChildren<
  VariantProps<typeof contextualSaveBarBaseVariants> &
    VariantProps<typeof contextualSaveBarContentVariants>
>;

export const ContextualSaveBar: FC<ContextualSaveBarProps> = ({
  absolute,
  fullWidth,
  children,
}) => {
  return (
    <div className={cn(contextualSaveBarBaseVariants({ absolute }))}>
      <div className={cn(contextualSaveBarContentVariants({ fullWidth }))}>
        {children}
      </div>
    </div>
  );
};

export type ContextualSaveBarMessageProps = PropsWithChildren;

export const ContextualSaveBarMessage: FC<ContextualSaveBarMessageProps> = ({
  children,
}) => {
  return <div className="flex-1">{children}</div>;
};

export type ContextualSaveBarActionsProps = PropsWithChildren;

export const ContextualSaveBarActions: FC<ContextualSaveBarActionsProps> = ({
  children,
}) => {
  return <div className="flex gap-2">{children}</div>;
};

export type ContextualSaveBarDiscardProps = ComponentProps<typeof Button>;

export const ContextualSaveBarDiscard: FC<ContextualSaveBarDiscardProps> = (
  props,
) => {
  return (
    <Button variant="outline" {...props}>
      {props.children}
    </Button>
  );
};

export type ContextualSaveBarSaveProps = ComponentProps<typeof Button>;

export const ContextualSaveBarSave: FC<ContextualSaveBarSaveProps> = (
  props,
) => {
  return (
    <Button variant="default" {...props}>
      {props.children}
    </Button>
  );
};
