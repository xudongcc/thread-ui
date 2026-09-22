"use client";

import { useEffect, useId } from "react";
import { ScrollArea } from "@base-ui/react/scroll-area";
import { useTranslation } from "react-i18next";
import type {
  CSSProperties,
  ComponentProps,
  MouseEventHandler,
  ReactNode,
} from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarInset,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Topbar,
  TopbarActionGroup,
  TopbarBrand,
  TopbarNavigationTrigger,
} from "@/components/thread-ui/topbar";
import { ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type LayoutNavigationItem = {
  id: string;
  label: string;
  icon?: ReactNode;
  href?: string;
  active?: boolean;
  disabled?: boolean;
  badge?: ReactNode;
  onClick?: MouseEventHandler<HTMLElement>;
};

export type LayoutNavigationGroup = {
  id: string;
  label?: string;
  items: readonly LayoutNavigationItem[];
};

export type LayoutNavigationProps = ComponentProps<"nav"> & {
  groups: readonly LayoutNavigationGroup[];
};

/** A router-neutral navigation list. Selecting a destination closes the mobile drawer. */
export function LayoutNavigation({ groups, ...props }: LayoutNavigationProps) {
  const { isMobile, setOpenMobile } = useSidebar();
  const { t } = useTranslation("thread-ui");
  return (
    <nav aria-label={t("layout.navigation", "Navigation")} {...props}>
      {groups.map((group) => (
        <SidebarGroup key={group.id}>
          {group.label && <SidebarGroupLabel>{group.label}</SidebarGroupLabel>}
          <SidebarGroupContent>
            <SidebarMenu>
              {group.items.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    aria-current={item.active ? "page" : undefined}
                    aria-disabled={item.disabled || undefined}
                    className={cn("h-10 md:h-9", item.badge != null && "pr-12")}
                    disabled={!item.href && item.disabled}
                    isActive={item.active}
                    tabIndex={item.disabled ? -1 : undefined}
                    render={
                      item.href ? (
                        <a href={item.disabled ? undefined : item.href} />
                      ) : undefined
                    }
                    onClick={(event) => {
                      if (item.disabled) {
                        event.preventDefault();
                        return;
                      }
                      item.onClick?.(event);
                      if (isMobile && !event.defaultPrevented)
                        setOpenMobile(false);
                    }}
                  >
                    {item.icon && (
                      <span
                        aria-hidden="true"
                        className="shrink-0 [&_svg]:size-4"
                      >
                        {item.icon}
                      </span>
                    )}
                    <span className="truncate">{item.label}</span>
                  </SidebarMenuButton>
                  {item.badge != null && (
                    <SidebarMenuBadge>{item.badge}</SidebarMenuBadge>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      ))}
    </nav>
  );
}

export type LayoutProps = ComponentProps<"div"> & {
  brand: ReactNode;
  navigation?: readonly LayoutNavigationGroup[];
  /** Replaces generated navigation, e.g. with composed shadcn SidebarMenu components. */
  sidebar?: ReactNode;
  sidebarFooter?: ReactNode;
  search?: ReactNode;
  actions?: ReactNode;
  topbarMenu?: ReactNode;
  contentProps?: ComponentProps<"main">;
};

function LayoutChrome({
  brand,
  navigation = [],
  sidebar,
  sidebarFooter,
  search,
  actions,
  topbarMenu,
  contentProps,
  children,
}: Pick<
  LayoutProps,
  | "brand"
  | "navigation"
  | "sidebar"
  | "sidebarFooter"
  | "search"
  | "actions"
  | "topbarMenu"
  | "contentProps"
  | "children"
>) {
  const { t } = useTranslation("thread-ui");
  const { isMobile, openMobile, setOpenMobile } = useSidebar();
  useEffect(() => {
    if (!isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);
  const generatedId = useId();
  const mainId = contentProps?.id ?? `${generatedId}-main`;
  const navigationId = `${generatedId}-navigation`;

  return (
    <>
      <a
        className="focus:bg-background focus:text-foreground sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50 focus:rounded-lg focus:p-3"
        href={`#${mainId}`}
        onClick={(event) => {
          event.preventDefault();
          event.currentTarget.ownerDocument.getElementById(mainId)?.focus();
        }}
      >
        {t("layout.skipToContent", "Skip to content")}
      </a>
      <Topbar className="h-(--layout-header-height)">
        <TopbarNavigationTrigger>
          <SidebarTrigger
            aria-controls={isMobile && !openMobile ? undefined : navigationId}
            aria-expanded={openMobile}
            aria-label={t("layout.toggleNavigation", "Toggle navigation")}
            className="size-10 shrink-0 text-neutral-950 hover:bg-black/5 hover:text-neutral-950 focus-visible:ring-black/40 aria-expanded:bg-black/5 aria-expanded:text-neutral-950 dark:text-white dark:hover:bg-white/10 dark:hover:text-white dark:focus-visible:ring-white/60 dark:aria-expanded:bg-white/10 dark:aria-expanded:text-white"
          />
        </TopbarNavigationTrigger>
        <TopbarBrand>{brand}</TopbarBrand>
        {search != null && (
          <div className="mx-auto min-w-0 flex-1 md:max-w-xl">{search}</div>
        )}
        {actions != null && <TopbarActionGroup>{actions}</TopbarActionGroup>}
        {topbarMenu}
      </Topbar>
      <div
        className="bg-sidebar relative isolate flex min-h-0 flex-1 overflow-hidden"
        data-slot="layout-body"
      >
        <Sidebar
          className="top-0 h-full border-r-0 md:absolute"
          collapsible="offcanvas"
        >
          <SidebarContent className="py-2" id={navigationId}>
            {sidebar ?? <LayoutNavigation groups={navigation} />}
          </SidebarContent>
          {sidebarFooter && <SidebarFooter>{sidebarFooter}</SidebarFooter>}
        </Sidebar>
        <ScrollArea.Root
          className="relative min-h-0 min-w-0 flex-1 overflow-hidden"
          data-slot="layout-scroll-area"
        >
          <ScrollArea.Viewport
            role="main"
            render={
              <SidebarInset
                {...contentProps}
                id={mainId}
                className={cn(
                  "bg-sidebar focus-visible:ring-ring/50 block size-full min-h-0 min-w-0 overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-inset",
                  contentProps?.className,
                )}
              />
            }
          >
            <ScrollArea.Content
              className="flex min-h-full flex-col"
              style={{ minWidth: 0 }}
            >
              {children}
            </ScrollArea.Content>
          </ScrollArea.Viewport>
          <ScrollBar />
          <ScrollBar orientation="horizontal" />
          <ScrollArea.Corner />
        </ScrollArea.Root>
      </div>
    </>
  );
}

/** Application shell: top bar, shadcn Sidebar, and an independently scrolling content area. */
export function Layout({
  brand,
  navigation,
  sidebar,
  sidebarFooter,
  search,
  actions,
  topbarMenu,
  contentProps,
  children,
  className,
  style,
  ...props
}: LayoutProps) {
  return (
    <SidebarProvider
      {...props}
      data-slot="layout"
      open={true}
      style={{ "--layout-header-height": "3.5rem", ...style } as CSSProperties}
      className={cn(
        "isolate h-svh min-h-0 flex-col overflow-hidden bg-neutral-950",
        className,
      )}
    >
      <LayoutChrome
        actions={actions}
        brand={brand}
        contentProps={contentProps}
        navigation={navigation}
        search={search}
        sidebar={sidebar}
        sidebarFooter={sidebarFooter}
        topbarMenu={topbarMenu}
      >
        {children}
      </LayoutChrome>
    </SidebarProvider>
  );
}
