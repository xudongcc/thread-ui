"use client";

import {
  Page,
  PageAction,
  PageContent,
  PageDescription,
  PageHeader,
  PageTitle,
} from "@repo/page";
import { EllipsisVerticalIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Example = () => (
  <Page>
    <PageHeader>
      <PageTitle>Products</PageTitle>
      <PageDescription>Manage your products and inventory.</PageDescription>
      <PageAction className="hidden gap-2 @md/page:flex">
        <Button variant="secondary">Export</Button>
        <Button variant="secondary">Import</Button>
        <Button>Add product</Button>
      </PageAction>
      <PageAction className="flex @md/page:hidden">
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button size="icon" variant="secondary">
                <EllipsisVerticalIcon />
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem>Export</DropdownMenuItem>
            <DropdownMenuItem>Import</DropdownMenuItem>
            <DropdownMenuItem>Add product</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </PageAction>
    </PageHeader>
    <PageContent>
      <p className="text-muted-foreground">Your page content goes here.</p>
    </PageContent>
  </Page>
);

export default Example;
