import type { PageProps } from "@/components/thread-ui/page";
import { Page } from "@/components/thread-ui/page";
import { Card, CardContent } from "@/components/ui/card";

export function PageLinkActionsExample(args: PageProps) {
  return (
    <Page
      breadcrumbActions={[
        { label: "Projects", render: <a href="#projects" /> },
      ]}
      description={
        <>
          Review the project or{" "}
          <a className="underline" href="#guide">
            read the guide
          </a>
          .
        </>
      }
      paginationActions={{
        previous: { disabled: true, render: <a href="#previous" /> },
        next: { render: (props) => <a {...props} href="#next" /> },
      }}
      primaryAction={{
        label: "Edit project",
        render: <a href="#edit-project" />,
      }}
      secondaryActions={[
        {
          label: "Activity",
          render: (props) => <a {...props} href="#activity" />,
        },
        { label: "Settings", disabled: true, render: <a href="#settings" /> },
      ]}
      title={
        <>
          Project <span className="text-muted-foreground">overview</span>
        </>
      }
      {...args}
    >
      <Card>
        <CardContent>
          Actions preserve link destinations in both inline and overflow
          layouts.
        </CardContent>
      </Card>
    </Page>
  );
}

PageLinkActionsExample.displayName = "PageLinkActionsExample";
