import { useState } from "react";
import type { PageProps } from "@/components/thread-ui/page";
import { Page } from "@/components/thread-ui/page";
import { Card, CardContent } from "@/components/ui/card";

export function PagePaginationExample(args: PageProps) {
  const products = [
    "Leather pet collar",
    "Cotton pet harness",
    "Travel pet carrier",
  ];
  const [index, setIndex] = useState(0);
  return (
    <Page
      description="Review product details and move between products."
      primaryAction={{ label: "Save", onAction: args.primaryAction?.onAction }}
      secondaryActions={[{ label: "Preview", render: <a href="#preview" /> }]}
      title={products[index]}
      breadcrumbActions={[
        { label: "Products", render: <a href="#products" /> },
      ]}
      paginationActions={{
        previous: {
          disabled: index === 0,
          onAction: () => setIndex((current) => Math.max(0, current - 1)),
        },
        next: {
          disabled: index === products.length - 1,
          onAction: () =>
            setIndex((current) => Math.min(products.length - 1, current + 1)),
        },
      }}
      {...args}
    >
      <Card>
        <CardContent>{products[index]} — product details</CardContent>
      </Card>
    </Page>
  );
}

PagePaginationExample.displayName = "PagePaginationExample";
