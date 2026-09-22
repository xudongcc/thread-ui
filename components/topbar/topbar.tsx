"use client";

import type { ComponentProps } from "react";
import { Button } from "@/components/thread-ui/button";
import { cn } from "@/lib/utils";

export type TopbarProps = ComponentProps<"header"> & {
  /** Omit to follow the application theme; set to force a light or dark header. */
  variant?: "light" | "dark";
};

export type TopbarBrandProps = ComponentProps<"div">;
export type TopbarNavigationTriggerProps = ComponentProps<"div">;
export type TopbarActionGroupProps = ComponentProps<"div">;
export type TopbarActionProps = ComponentProps<typeof Button>;

export function TopbarBrand({ className, ...props }: TopbarBrandProps) {
  return (
    <div
      {...props}
      data-slot="topbar-brand"
      className={cn(
        "hidden max-w-full min-w-0 justify-self-start truncate font-semibold md:block",
        className,
      )}
    />
  );
}

/** Responsive wrapper for the host application's navigation button. */
export function TopbarNavigationTrigger({
  className,
  ...props
}: TopbarNavigationTriggerProps) {
  return (
    <div
      {...props}
      className={cn("justify-self-start md:hidden", className)}
      data-slot="topbar-navigation-trigger"
    />
  );
}

export function TopbarActionGroup({
  className,
  ...props
}: TopbarActionGroupProps) {
  return (
    <div
      {...props}
      data-slot="topbar-action-group"
      className={cn(
        "flex min-w-0 items-center gap-1 justify-self-end sm:gap-2",
        className,
      )}
    />
  );
}

/** Icon action follows the top bar appearance; supply an accessible label. */
export function TopbarAction({ className, ...props }: TopbarActionProps) {
  return (
    <Button
      size="icon"
      variant="ghost"
      {...props}
      data-slot="topbar-action"
      className={cn(
        "size-10 shrink-0 text-white hover:bg-white/10 hover:text-white focus-visible:border-transparent focus-visible:ring-white/60 aria-expanded:bg-white/10 aria-expanded:text-white dark:hover:bg-white/10",
        "group-data-[variant=light]/topbar:text-neutral-950 group-data-[variant=light]/topbar:hover:bg-black/5 group-data-[variant=light]/topbar:hover:text-neutral-950 group-data-[variant=light]/topbar:focus-visible:ring-black/40 group-data-[variant=light]/topbar:aria-expanded:bg-black/5 group-data-[variant=light]/topbar:aria-expanded:text-neutral-950 dark:group-data-[variant=light]/topbar:hover:bg-black/5",
        "group-data-[variant=auto]/topbar:text-neutral-950 group-data-[variant=auto]/topbar:hover:bg-black/5 group-data-[variant=auto]/topbar:hover:text-neutral-950 group-data-[variant=auto]/topbar:focus-visible:ring-black/40 group-data-[variant=auto]/topbar:aria-expanded:bg-black/5 group-data-[variant=auto]/topbar:aria-expanded:text-neutral-950",
        "dark:group-data-[variant=auto]/topbar:text-white dark:group-data-[variant=auto]/topbar:hover:bg-white/10 dark:group-data-[variant=auto]/topbar:hover:text-white dark:group-data-[variant=auto]/topbar:focus-visible:ring-white/60 dark:group-data-[variant=auto]/topbar:aria-expanded:bg-white/10 dark:group-data-[variant=auto]/topbar:aria-expanded:text-white",
        className,
      )}
    />
  );
}

/** Compose the header with Topbar parts and application content. */
export function Topbar({
  variant,
  children,
  className,
  ...props
}: TopbarProps) {
  return (
    <header
      {...props}
      data-slot="topbar"
      data-variant={variant ?? "auto"}
      className={cn(
        "group/topbar border-border z-20 grid h-14 min-w-0 shrink-0 auto-cols-[minmax(0,auto)] grid-flow-col grid-cols-[minmax(0,1fr)] items-center justify-items-end gap-2 border-b px-3 md:gap-4 md:px-4",
        variant === "dark"
          ? "bg-neutral-950 text-white"
          : variant === "light"
            ? "bg-white text-neutral-950"
            : "bg-white text-neutral-950 dark:bg-neutral-950 dark:text-white",
        className,
      )}
    >
      {children}
    </header>
  );
}
