"use client";

import { cva } from "class-variance-authority";
import { ArrowLeftIcon } from "lucide-react";
import type { VariantProps } from "class-variance-authority";
import type { ComponentProps, FC } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const pageVariants = cva(
  "mx-auto flex min-h-min w-full flex-1 flex-col p-4 @container/page",
  {
    variants: {
      variant: {
        full: "w-full",
        default: "max-w-5xl",
        compact: "max-w-xl",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type PageProps = ComponentProps<"div"> &
  VariantProps<typeof pageVariants>;

export const Page: FC<PageProps> = ({ className, variant, ...props }) => {
  return (
    <div className={cn(pageVariants({ variant }), className)} {...props} />
  );
};

export type PageHeaderProps = ComponentProps<"header">;

export const PageHeader: FC<PageHeaderProps> = ({ className, ...props }) => {
  return (
    <header
      data-slot="page-header"
      className={cn(
        "group/page-header grid gap-1 pb-4 has-data-[slot=page-actions]:grid-cols-[1fr_auto] has-data-[slot=page-back-action]:grid-cols-[1fr_auto] has-data-[slot=page-back-action]:grid-rows-[auto_auto_auto] @3xl/page:has-data-[slot=page-back-action]:grid-cols-[auto_1fr_auto] @3xl/page:has-data-[slot=page-back-action]:grid-rows-[auto_auto] @3xl/page:has-data-[slot=page-back-action]:gap-x-2",
        className,
      )}
      {...props}
    />
  );
};

export type PageBackActionProps = ComponentProps<typeof Button>;

export const PageBackAction: FC<PageBackActionProps> = ({
  children,
  className,
  size = "icon",
  variant = "ghost",
  ...props
}) => {
  return (
    <Button
      data-slot="page-back-action"
      size={size}
      variant={variant}
      className={cn(
        "col-start-1 row-start-1 self-start justify-self-start @3xl/page:row-span-2",
        className,
      )}
      {...props}
    >
      {children ?? (
        <>
          <ArrowLeftIcon />
          <span className="sr-only">Back</span>
        </>
      )}
    </Button>
  );
};

export type PageTitleProps = ComponentProps<"h2">;

export const PageTitle: FC<PageTitleProps> = ({ className, ...props }) => {
  return (
    <h2
      data-slot="page-title"
      className={cn(
        "py-0.5 text-2xl font-semibold tracking-tight group-has-data-[slot=page-back-action]/page-header:col-span-2 group-has-data-[slot=page-back-action]/page-header:row-start-2 @3xl/page:group-has-data-[slot=page-back-action]/page-header:col-span-1 @3xl/page:group-has-data-[slot=page-back-action]/page-header:col-start-2 @3xl/page:group-has-data-[slot=page-back-action]/page-header:row-start-1",
        className,
      )}
      {...props}
    />
  );
};

export type PageDescriptionProps = ComponentProps<"p">;

export const PageDescription: FC<PageDescriptionProps> = ({
  className,
  ...props
}) => {
  return (
    <p
      data-slot="page-description"
      className={cn(
        "text-muted-foreground text-sm group-has-data-[slot=page-back-action]/page-header:col-span-2 group-has-data-[slot=page-back-action]/page-header:row-start-3 @3xl/page:group-has-data-[slot=page-back-action]/page-header:col-span-1 @3xl/page:group-has-data-[slot=page-back-action]/page-header:col-start-2 @3xl/page:group-has-data-[slot=page-back-action]/page-header:row-start-2",
        className,
      )}
      {...props}
    />
  );
};

export type PageActionsProps = ComponentProps<"div">;

export const PageActions: FC<PageActionsProps> = ({ className, ...props }) => {
  return (
    <div
      data-slot="page-actions"
      className={cn(
        "col-start-2 row-span-2 row-start-1 flex items-center gap-2 self-start justify-self-end group-has-data-[slot=page-back-action]/page-header:row-span-1 @3xl/page:group-has-data-[slot=page-back-action]/page-header:col-start-3 @3xl/page:group-has-data-[slot=page-back-action]/page-header:row-span-2",
        className,
      )}
      {...props}
    />
  );
};

export type PageContentProps = ComponentProps<"div">;

export const PageContent: FC<PageContentProps> = ({ className, ...props }) => {
  return <div className={cn("flex-1", className)} {...props} />;
};
