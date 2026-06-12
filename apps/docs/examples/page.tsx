import { MoreHorizontalIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Page,
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/thread-ui/page";

const Example = () => (
  <Page>
    <PageHeader>
      <PageTitle>Products</PageTitle>
      <PageDescription>Manage your products and inventory.</PageDescription>
      <PageActions>
        <Button variant="secondary">Export</Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button size="icon" variant="secondary" />}
          >
            <MoreHorizontalIcon />
            <span className="sr-only">More actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Duplicate</DropdownMenuItem>
            <DropdownMenuItem>Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button>Add product</Button>
      </PageActions>
    </PageHeader>
    <PageContent>
      <p className="text-muted-foreground">Your page content goes here.</p>
    </PageContent>
  </Page>
);

export default Example;
