import { useState } from "react";
import { expect, fn, within } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { DataTableColumnProps } from "@/components/thread-ui/data-table";
import { DataTable } from "@/components/thread-ui/data-table";
import { Empty } from "@/components/thread-ui/empty";
import { Button } from "@/components/thread-ui/button";

type User = { id: string; name: string; email: string; role: string };
const data: User[] = [
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
const columns: DataTableColumnProps<User>[] = [
  { id: "name", header: "Name", accessorKey: "name" },
  { id: "email", header: "Email", accessorKey: "email" },
  { id: "role", header: "Role", accessorKey: "role" },
];
const meta = {
  id: "components-datatable",
  title: "Data/DataTable",
  component: DataTable<User>,
  args: { columns, data, getRowId: (row) => row.id },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Data table with stable row IDs, selection, row actions, pinned columns, empty states, and externally managed pagination.",
      },
    },
  },
} satisfies Meta<typeof DataTable<User>>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "Props API",
};
export const EmptyState: Story = { args: { data: [] } };
export const CustomEmpty: Story = {
  args: {
    data: [],
    empty: (
      <Empty description="Try a different search." title="No matching people" />
    ),
  },
};
export const RowSelection: Story = {
  globals: { locale: "en" },
  render: function Selection(args) {
    const [selected, setSelected] = useState<User[]>([]);
    return (
      <div className="space-y-3">
        <DataTable
          {...args}
          bulkActions={
            <Button size="sm" variant="outline" onClick={fn()}>
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
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(
      within(canvas.getByRole("row", { name: /Alice Johnson/ })).getByRole(
        "checkbox",
      ),
    );
    await expect(canvas.getByLabelText("Selected people")).toHaveTextContent(
      "Alice Johnson",
    );
  },
};
export const RowActions: Story = {
  // TODO(a11y): empty-table-header: the actions column needs an accessible heading.
  parameters: { a11y: { test: "todo" } },
  args: {
    rowActions: () => [
      { label: "Edit", onClick: fn() },
      { label: "Delete", onClick: fn() },
      { label: "Archive", disabled: true },
    ],
    onRowClick: fn(),
  },
};
export const PinnedColumns: Story = {
  // TODO(a11y): scrollable-region-focusable: the overflow container needs keyboard access.
  parameters: { a11y: { test: "todo" } },
  args: {
    columns: columns.map((column, index) => ({
      ...column,
      size: 400,
      pinned: index === 0 ? "left" : false,
    })),
  },
  decorators: [
    (Story) => (
      <div className="max-w-xl">
        <Story />
      </div>
    ),
  ],
};
export const Pagination: Story = {
  globals: { locale: "en" },
  render: function Pagination(args) {
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
  },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /next/i }));
    await expect(canvas.getByText("Charlie Brown")).toBeVisible();
    await expect(canvas.queryByText("Alice Johnson")).not.toBeInTheDocument();
  },
};
