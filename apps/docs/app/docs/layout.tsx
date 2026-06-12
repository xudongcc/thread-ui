import { DocsLayout } from "fumadocs-ui/layouts/docs";

import { baseOptions } from "~/lib/layout.shared";
import { source } from "~/lib/source";

export default function Layout({ children }: LayoutProps<"/docs">) {
  return (
    <DocsLayout
      containerProps={{ className: "xl:[--fd-layout-width:100%]" }}
      tree={source.getPageTree()}
      {...baseOptions()}
    >
      {children}
    </DocsLayout>
  );
}
