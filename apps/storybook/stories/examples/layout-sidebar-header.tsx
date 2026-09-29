import {
  Layout,
  LayoutContent,
  LayoutSidebar,
  LayoutSidebarHeader,
  LayoutSidebarLogo,
  LayoutSidebarTitle,
} from "@/components/thread-ui/layout";

export type LayoutSidebarHeaderExampleProps = {
  showLogo: boolean;
  title: string;
};

export function LayoutSidebarHeaderExample({
  showLogo,
  title,
}: LayoutSidebarHeaderExampleProps) {
  return (
    <Layout>
      <LayoutSidebar collapsible="icon">
        <LayoutSidebarHeader>
          {showLogo && (
            <LayoutSidebarLogo>
              <svg
                aria-hidden="true"
                className="text-primary"
                viewBox="0 0 32 32"
              >
                <rect fill="currentColor" height="32" rx="8" width="32" />
                <path
                  className="stroke-primary-foreground"
                  d="M9 10h14M16 10v14M12 15h8"
                  strokeLinecap="round"
                  strokeWidth="2.5"
                />
              </svg>
            </LayoutSidebarLogo>
          )}
          {title && (
            <LayoutSidebarTitle title={title}>{title}</LayoutSidebarTitle>
          )}
        </LayoutSidebarHeader>
      </LayoutSidebar>
      <LayoutContent>
        <h1 className="text-lg font-semibold">Sidebar header</h1>
        <p className="text-muted-foreground">
          Collapse the sidebar, then hover or focus the header to expand it.
          Without a logo, the expand button stays visible.
        </p>
      </LayoutContent>
    </Layout>
  );
}

LayoutSidebarHeaderExample.displayName = "LayoutSidebarHeaderExample";
