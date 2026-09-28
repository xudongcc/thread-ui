import { useState } from "react";
import { fn } from "storybook/test";
import type { ComponentProps } from "react";
import type { DataTableRow } from "@/components/thread-ui/data-table";
import {
  DataTable,
  createDataTableColumnHelper,
} from "@/components/thread-ui/data-table";
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
const userColumn = createDataTableColumnHelper<User>();
export const columns = userColumn.columns([
  userColumn.field("name", { id: "name", header: "Name" }),
  userColumn.field("email", { id: "email", header: "Email" }),
  userColumn.field("role", { id: "role", header: "Role" }),
]);

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

interface Order {
  id: string;
  quantity: number;
  total: number;
  rate: number;
  date: string;
  createdAt: string;
  elapsed: number;
}

const orderColumn = createDataTableColumnHelper<Order>();
const typedColumns = orderColumn.columns([
  orderColumn.field("id", { header: "Order" }),
  orderColumn.field("quantity", {
    header: "Quantity",
    type: "number",
    precision: 0,
  }),
  orderColumn.field("total", {
    header: "Total",
    type: "currency",
    currency: "USD",
  }),
  orderColumn.field("rate", {
    header: "Rate",
    type: "percent",
    precision: 1,
  }),
  orderColumn.field("elapsed", {
    header: "Duration",
    type: "duration",
    unit: "seconds",
  }),
  orderColumn.field("date", {
    header: "Date",
    type: "date",
    locale: "en-GB",
  }),
  orderColumn.field("createdAt", {
    header: "Created (Shanghai)",
    type: "datetime",
    locale: "zh-CN",
  }),
  orderColumn.field("createdAt", {
    id: "createdAtNewYork",
    header: "Time (New York)",
    type: "time",
    hour12: false,
    timeZone: "America/New_York",
  }),
]);

const typedData: Order[] = [
  {
    id: "#1001",
    quantity: 1200,
    total: 1234.5,
    rate: 0.125,
    date: "2026-01-01",
    createdAt: "2026-01-01T01:00:00Z",
    elapsed: 3661,
  },
  {
    id: "#1002",
    quantity: 0,
    total: 0,
    rate: 0,
    date: "2026-01-02",
    createdAt: "2026-01-02T16:30:00Z",
    elapsed: 90.5,
  },
];

export function TypedColumnsDataTableExample() {
  return (
    <DataTable
      columns={typedColumns}
      data={typedData}
      locale="en-US"
      timeZone="Asia/Shanghai"
    />
  );
}

TypedColumnsDataTableExample.displayName = "TypedColumnsDataTableExample";

const inferredColumns = userColumn.columns([
  userColumn.field("name", {
    header: "Name",
    render: (props, { getValue }) => (
      <strong {...props}>{getValue().toUpperCase()}</strong>
    ),
  }),
  userColumn.getValue((user) => `${user.name} <${user.email}>`, {
    id: "contact",
    header: "Contact",
    render: (props, { getValue }) => <span {...props}>{getValue()}</span>,
  }),
  userColumn.getValue((user) => user.name.length, {
    id: "nameLength",
    header: "Name length",
    type: "number",
    render: (props, { getValue }) => (
      <span {...props}>{getValue().toFixed(0)}</span>
    ),
  }),
]);

export function InferredValuesDataTableExample() {
  return <DataTable columns={inferredColumns} data={data} />;
}

InferredValuesDataTableExample.displayName = "InferredValuesDataTableExample";

export const customCellColumns = userColumn.columns([
  userColumn.getValue((person) => `${person.name} <${person.email}>`, {
    id: "contact",
    header: "Contact",
    render: (props, { getValue }) => <strong {...props}>{getValue()}</strong>,
  }),
]);
export const renderElementColumns = userColumn.columns([
  userColumn.field("name", { header: <em>Name</em>, render: <strong /> }),
]);
export const alignedColumns = userColumn.columns([
  userColumn.field("name", { header: "Name" }),
  userColumn.field("role", { header: "Role", align: "center" }),
  userColumn.field("id", { header: "ID", align: "right" }),
]);
export const pinnedColumns = columns.map((column, index) => ({
  ...column,
  size: 400,
  pinned: index === 0 ? ("left" as const) : (false as const),
}));

export const profileRowActions = (row: DataTableRow<User>) => [
  { label: "View profile", render: <a href={`#person-${row.id}`} /> },
];
