"use client";

import { DataTable } from "@repo/data-table";
import { Button } from "@repo/shadcn-ui/components/ui/button";
import { useState } from "react";
import type { DataTableColumnProps } from "@repo/data-table";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const columns: DataTableColumnProps<User>[] = [
  {
    id: "name",
    header: "Name",
    accessorKey: "name",
  },
  {
    id: "email",
    header: "Email",
    accessorKey: "email",
  },
  {
    id: "role",
    header: "Role",
    accessorKey: "role",
  },
];

const data: User[] = [
  { id: "1", name: "Alice Johnson", email: "alice@example.com", role: "Admin" },
  { id: "2", name: "Bob Smith", email: "bob@example.com", role: "User" },
  {
    id: "3",
    name: "Charlie Brown",
    email: "charlie@example.com",
    role: "User",
  },
  { id: "4", name: "Diana Prince", email: "diana@example.com", role: "Editor" },
];

const Example = () => {
  const [selectedRows, setSelectedRows] = useState<User[]>([]);

  return (
    <div className="space-y-4">
      <DataTable
        columns={columns}
        data={data}
        bulkActions={
          <Button size="sm" variant="outline">
            Delete Selected
          </Button>
        }
        onRowSelectionChange={setSelectedRows}
      />
      {selectedRows.length > 0 && (
        <p className="text-muted-foreground text-sm">
          Selected: {selectedRows.map((r) => r.name).join(", ")}
        </p>
      )}
    </div>
  );
};

export default Example;
