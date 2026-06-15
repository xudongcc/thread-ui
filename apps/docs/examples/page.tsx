"use client";

import {
  Page,
  PageActions,
  PageBackAction,
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
      <PageBackAction />
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
