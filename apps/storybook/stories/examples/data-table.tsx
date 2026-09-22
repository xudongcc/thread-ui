import { useState } from "react";
import { fn } from "storybook/test";
import type { DataTableColumnProps } from "@/components/thread-ui/data-table";
import type { ComponentProps } from "react";
import { DataTable } from "@/components/thread-ui/data-table";
import { Empty } from "@/components/thread-ui/empty";
import { Button } from "@/components/thread-ui/button";

export type User = { id: string; name: string; email: string; role: string };
export const data: User[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "Admin" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", role: "Editor" },
  {
    id: "3",
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "Member",
  },
  { id: "4", name: "Diana Prince", email: "diana@example.com", role: "Member" },
];
export const columns: DataTableColumnProps<User>[] = [
  { id: "name", header: "Name", accessorKey: "name" },
  { id: "email", header: "Email", accessorKey: "email" },
  { id: "role", header: "Role", accessorKey: "role" },
];

export function RowSelectionDataTableExample(
  args: ComponentProps<typeof DataTable<User>>,
) {
  const [selected, setSelected] = useState<User[]>([]);
  return (
    <div className="space-y-3">
      <DataTable
        {...args}
        bulkActions={
          <Button size="xs" variant="outline" onClick={fn()}>
            Export selected
          </Button>
        }
        onRowSelectionChange={setSelected}
      />
      <output aria-label="Selected people">
        {selected.map((row) => row.name).join(", ") || "None"}
      </output>
    </div>
  );
}

export function PaginationDataTableExample(
  args: ComponentProps<typeof DataTable<User>>,
) {
  const [page, setPage] = useState(0);
  return (
    <div className="space-y-3">
      <DataTable
        {...args}
        data={data.slice(page * 2, page * 2 + 2)}
        pagination={{
          hasPreviousPage: page > 0,
          hasNextPage: page < 1,
          onPreviousPage: () => setPage(page - 1),
          onNextPage: () => setPage(page + 1),
        }}
      />
      <output>Page {page + 1} of 2</output>
    </div>
  );
}

export const getRowId = (row: User) => row.id;
export function DataTableExample(args: ComponentProps<typeof DataTable<User>>) {
  return <DataTable {...args} />;
}

export const customEmpty = (
  <Empty description="Try a different search." title="No matching people" />
);
export const rowActions = () => [
  { label: "Edit", onClick: fn() },
  { label: "Delete", onClick: fn() },
  { label: "Archive", disabled: true },
];

// Keep Code panel component names stable in production builds.
RowSelectionDataTableExample.displayName = "RowSelectionDataTableExample";
PaginationDataTableExample.displayName = "PaginationDataTableExample";
DataTableExample.displayName = "DataTableExample";
