"use client";

import {
  BreadcrumbAction,
  BreadcrumbActions,
  Page,
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PagePrimaryAction,
  PageSecondaryAction,
  PageTitle,
} from "@/components/thread-ui/page";

const Example = () => (
  <Page>
    <PageHeader>
      <BreadcrumbActions>
        <BreadcrumbAction render={<a href="#products" />}>
          Products
        </BreadcrumbAction>
        <BreadcrumbAction render={<a href="#pet-accessories" />}>
          Pet accessories
        </BreadcrumbAction>
      </BreadcrumbActions>
      <PageTitle>3/4 inch Leather pet collar</PageTitle>
      <PageDescription>Perfect for any pet</PageDescription>
      <PageActions>
        <PageSecondaryAction>Duplicate</PageSecondaryAction>
        <PageSecondaryAction>Rename</PageSecondaryAction>
        <PageSecondaryAction>Export</PageSecondaryAction>
        <PageSecondaryAction destructive>Archive</PageSecondaryAction>
        <PagePrimaryAction>Save</PagePrimaryAction>
      </PageActions>
    </PageHeader>
    <PageContent>
      <p className="text-muted-foreground">Your page content goes here.</p>
    </PageContent>
  </Page>
);

export default Example;
