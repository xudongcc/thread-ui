import type { ComponentProps } from "react";
import {
  DataTable,
  createDataTableColumnHelper,
} from "@/components/thread-ui/data-table";

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

export const userColumnHelper = createDataTableColumnHelper<User>();

export const getRowId = (row: User) => row.id;

export function DataTableExample(args: ComponentProps<typeof DataTable<User>>) {
  return <DataTable {...args} />;
}

DataTableExample.displayName = "DataTableExample";
