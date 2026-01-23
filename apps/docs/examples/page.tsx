import {
  Page,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@repo/page";

const Example = () => (
  <Page>
    <PageHeader>
      <PageTitle>Products</PageTitle>
      <PageDescription>Manage your products and inventory.</PageDescription>
    </PageHeader>
    <PageContent>
      <p className="text-muted-foreground">Your page content goes here.</p>
    </PageContent>
  </Page>
);

export default Example;
