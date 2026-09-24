"use client";

import { Page } from "@/components/thread-ui/page";
import { Card, CardContent } from "@/components/ui/card";

export default function Example() {
  return (
    <Page
      description="Perfect for any pet"
      primaryAction={{ label: "Save" }}
      title="3/4 inch Leather pet collar"
      breadcrumbActions={[
        { label: "Products", render: <a href="#products" /> },
        { label: "Pet accessories", render: <a href="#pet-accessories" /> },
      ]}
      paginationActions={{
        previous: { disabled: true },
        next: { render: <a href="#next-product" /> },
      }}
      secondaryActions={[
        { label: "Duplicate" },
        { label: "Rename" },
        { label: "Export" },
        { label: "Archive", destructive: true },
      ]}
    >
      <Card>
        <CardContent>Your page content goes here.</CardContent>
      </Card>
    </Page>
  );
}
