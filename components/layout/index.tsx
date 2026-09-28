"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useId,
  useMemo,
  useState,
} from "react";
import { ScrollArea } from "@base-ui/react/scroll-area";
import { useTranslation } from "react-i18next";
import type { ComponentProps } from "react";
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import { ScrollBar } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

export type LayoutProps = ComponentProps<"div">;
export type LayoutSidebarProps = ComponentProps<typeof Sidebar>;
export type LayoutContentProps = ComponentProps<"main">;

const LayoutContext = createContext<{
  defaultContentId: string;
  hasMobileNavigation: boolean;
  registerSidebar: () => () => void;
  registerContent: (id: string | undefined) => void;
} | null>(null);

function LayoutSidebarState() {
  const { isMobile, setOpenMobile } = useSidebar();
  useEffect(() => {
    if (!isMobile) setOpenMobile(false);
  }, [isMobile, setOpenMobile]);
  return null;
}

/** Application shell using the native shadcn sidebar composition. */
export function Layout({ children, className, ...props }: LayoutProps) {
  const { t } = useTranslation("thread-ui");
  const id = useId();
  const defaultContentId = `${id}-main`;
  const [contentId, registerContent] = useState<string>();
  const [sidebarCount, setSidebarCount] = useState(0);
  const registerSidebar = useCallback(() => {
    setSidebarCount((count) => count + 1);
    return () => setSidebarCount((count) => count - 1);
  }, []);
  const hasMobileNavigation = sidebarCount > 0;
  const context = useMemo(
    () => ({
      defaultContentId,
      hasMobileNavigation,
      registerContent,
      registerSidebar,
    }),
    [defaultContentId, hasMobileNavigation, registerSidebar],
  );
  return (
    <LayoutContext.Provider value={context}>
      <SidebarProvider
        {...props}
        data-slot="layout"
        className={cn(
          "bg-sidebar isolate h-svh min-h-0 overflow-hidden",
          className,
        )}
      >
        <LayoutSidebarState />
        {contentId && (
          <a
            className="focus:bg-background focus:text-foreground sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-4 focus:z-50 focus:rounded-lg focus:p-3"
            href={`#${contentId}`}
            onClick={(event) => {
              event.preventDefault();
              event.currentTarget.ownerDocument
                .getElementById(contentId)
                ?.focus();
            }}
          >
            {t("layout.skipToContent", "Skip to content")}
          </a>
        )}
        {children}
        {hasMobileNavigation && (
          <SidebarTrigger
            className="fixed bottom-[calc(env(safe-area-inset-bottom)+1rem)] left-[calc(env(safe-area-inset-left)+1rem)] z-30 shadow-md md:hidden"
            data-slot="layout-mobile-navigation"
            size="icon-lg"
            variant="outline"
          />
        )}
      </SidebarProvider>
    </LayoutContext.Provider>
  );
}

/** Native Sidebar composition with automatic floating mobile navigation. */
export function LayoutSidebar(props: LayoutSidebarProps) {
  const context = useContext(LayoutContext);
  if (!context) throw new Error("LayoutSidebar must be inside Layout.");
  const { registerSidebar } = context;
  const collapsible = props.collapsible !== "none";
  useEffect(() => {
    if (collapsible) return registerSidebar();
  }, [collapsible, registerSidebar]);
  return <Sidebar {...props} />;
}

/** SidebarInset main landmark with an independently scrolling viewport. */
export function LayoutContent({
  id: suppliedId,
  className,
  children,
  onScroll,
  ...props
}: LayoutContentProps) {
  const context = useContext(LayoutContext);
  if (!context) throw new Error("LayoutContent must be inside Layout.");
  const { defaultContentId, hasMobileNavigation, registerContent } = context;
  const id = suppliedId ?? defaultContentId;
  useEffect(() => {
    registerContent(id);
    return () => registerContent(undefined);
  }, [id, registerContent]);
  return (
    <ScrollArea.Root
      role="main"
      render={
        <SidebarInset
          tabIndex={-1}
          {...props}
          id={id}
          className={cn(
            "bg-canvas focus-visible:ring-ring/50 min-h-0 min-w-0 overflow-hidden outline-none focus-visible:ring-2 focus-visible:ring-inset",
            className,
          )}
        />
      }
    >
      <ScrollArea.Viewport
        className="focus-visible:ring-ring/50 size-full min-h-0 min-w-0 overscroll-contain outline-none focus-visible:ring-2 focus-visible:ring-inset"
        data-slot="layout-content-viewport"
        onScroll={onScroll}
      >
        <ScrollArea.Content
          data-slot="layout-content-body"
          className={cn(
            "flex min-h-full min-w-0! flex-col",
            hasMobileNavigation &&
              "pb-[calc(env(safe-area-inset-bottom)+5rem)] md:pb-0",
          )}
        >
          {children}
        </ScrollArea.Content>
      </ScrollArea.Viewport>
      <ScrollBar />
      <ScrollBar orientation="horizontal" />
      <ScrollArea.Corner />
    </ScrollArea.Root>
  );
}
