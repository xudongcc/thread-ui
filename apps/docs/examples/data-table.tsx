"use client";

import {
  DataTable,
  createDataTableColumnHelper,
} from "@/components/thread-ui/data-table";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

const column = createDataTableColumnHelper<User>();
const columns = column.columns([
  column.accessor("name", {
    id: "name",
    header: "Name",
  }),
  column.accessor("email", {
    id: "email",
    header: "Email",
  }),
  column.accessor("role", {
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

const Example = () => <DataTable columns={columns} data={data} />;

export default Example;
