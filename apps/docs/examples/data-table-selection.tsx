"use client";

import { useState } from "react";

import {
  DataTable,
  createDataTableColumnHelper,
} from "@/components/thread-ui/data-table";
import { Button } from "@/components/ui/button";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const userColumnHelper = createDataTableColumnHelper<User>();
const columns = userColumnHelper.columns([
  userColumnHelper.field("name", {
    id: "name",
    header: "Name",
  }),
  userColumnHelper.field("email", {
    id: "email",
    header: "Email",
  }),
  userColumnHelper.field("role", {
    id: "role",
    header: "Role",
  }),
]);

const data: Array<User> = [
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
  const [selectedRows, setSelectedRows] = useState<Array<User>>([]);

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
          Selected: {selectedRows.map((row) => row.name).join(", ")}
        </p>
      )}
    </div>
  );
};

export default Example;
