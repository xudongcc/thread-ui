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
  PageBackAction,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@/components/thread-ui/page";

const Example = () => (
  <Page>
    <PageHeader>
      <PageBackAction />
      <PageTitle>3/4 inch Leather pet collar</PageTitle>
      <PageDescription>Perfect for any pet</PageDescription>
      <PageActions>
        <Button variant="secondary">Duplicate</Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={<Button size="icon" variant="secondary" />}
          >
            <MoreHorizontalIcon />
            <span className="sr-only">More actions</span>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Rename</DropdownMenuItem>
            <DropdownMenuItem>Archive</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button>Save</Button>
      </PageActions>
    </PageHeader>
    <PageContent>
      <p className="text-muted-foreground">Your page content goes here.</p>
    </PageContent>
  </Page>
);

export default Example;
