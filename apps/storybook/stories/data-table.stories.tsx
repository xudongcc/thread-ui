import { expect, fn, within } from "storybook/test";
import {
  DataTableExample,
  PaginationDataTableExample,
  RowSelectionDataTableExample,
  columns,
  customEmpty,
  data,
  getRowId,
  rowActions,
} from "./examples/data-table";
import implementation from "./examples/data-table.tsx?raw";
import { functionSource, withExampleSource } from "./utils/example-source";
import type { User } from "./examples/data-table";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable } from "@/components/thread-ui/data-table";

const meta = {
  id: "components-datatable",
  title: "Data/DataTable",
  component: DataTable<User>,
  render: (args) => <DataTableExample {...args} />,
  args: { columns, data, getRowId },
  parameters: {
    jsx: { functionValue: functionSource({ getRowId, rowActions }) },
    layout: "padded",
    docs: {
      source: withExampleSource(implementation),
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
    empty: customEmpty,
  },
};
export const RowSelection: Story = {
  globals: { locale: "en" },
  render: (args) => <RowSelectionDataTableExample {...args} />,
  parameters: { docs: { source: withExampleSource(implementation) } },
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
    rowActions,
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
  render: (args) => <PaginationDataTableExample {...args} />,
  parameters: { docs: { source: withExampleSource(implementation) } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /next/i }));
    await expect(canvas.getByText("Charlie Brown")).toBeVisible();
    await expect(canvas.queryByText("Alice Johnson")).not.toBeInTheDocument();
  },
};
