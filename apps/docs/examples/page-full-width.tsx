import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@repo/page";

const Example = () => (
  <Page variant="full">
    <PageHeader>
      <PageTitle>Dashboard</PageTitle>
      <PageDescription>
        This page uses the full width of the container.
      </PageDescription>
    </PageHeader>
    <PageContent>
      <p className="text-muted-foreground">Your page content goes here.</p>
    </PageContent>
  </Page>
);

export default Example;
