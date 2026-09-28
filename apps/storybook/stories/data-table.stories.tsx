import { expect, fn, within } from "storybook/test";
import { testOnly } from "./utils/test-only";
import {
  DataTableExample,
  InferredValuesDataTableExample,
  PaginationDataTableExample,
  RowSelectionDataTableExample,
  TypedColumnsDataTableExample,
  alignedColumns,
  columns,
  customCellColumns,
  customEmpty,
  data,
  getRowId,
  hiddenColumns,
  pinnedColumns,
  profileRowActions,
  renderElementColumns,
  rowActions,
} from "./examples/data-table";
import implementation from "./examples/data-table.tsx?raw";
import {
  functionSource,
  withExampleParameters,
  withExampleSource,
} from "./utils/example-source";
import type { User } from "./examples/data-table";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable } from "@/components/thread-ui/data-table";

const exampleParameters = withExampleParameters(
  implementation,
  {
    columns,
    alignedColumns,
    hiddenColumns,
    customCellColumns,
    renderElementColumns,
    pinnedColumns,
  },
  ["columns"],
);

const meta = {
  id: "components-datatable",
  title: "Data/DataTable",
  component: DataTable<User>,
  render: (args) => <DataTableExample {...args} />,
  args: { columns, data, getRowId },
  parameters: {
    jsx: {
      ...exampleParameters.jsx,
      functionValue: functionSource({
        getRowId,
        rowActions,
        profileRowActions,
      }),
    },
    layout: "padded",
    docs: {
      ...exampleParameters.docs,
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
  play: testOnly(async ({ canvas, userEvent }) => {
    await userEvent.click(
      within(canvas.getByRole("row", { name: /Alice Johnson/ })).getByRole(
        "checkbox",
      ),
    );
    await expect(canvas.getByLabelText("Selected people")).toHaveTextContent(
      "Alice Johnson",
    );
  }),
};
export const RowActions: Story = {
  args: {
    rowActions,
    onRowClick: fn(),
  },
};
export const PinnedColumns: Story = {
  // TODO(a11y): scrollable-region-focusable: the overflow container needs keyboard access.
  parameters: { a11y: { test: "todo" } },
  args: {
    columns: pinnedColumns,
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
  play: testOnly(async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /next/i }));
    await expect(canvas.getByText("Charlie Brown")).toBeVisible();
    await expect(canvas.queryByText("Alice Johnson")).not.toBeInTheDocument();
  }),
};

export const CustomCells: Story = {
  args: {
    columns: customCellColumns,
  },
};

export const RenderElement: Story = {
  args: {
    columns: renderElementColumns,
    rowActions: profileRowActions,
  },
};

export const HiddenColumns: Story = {
  args: { columns: hiddenColumns },
  play: testOnly(async ({ canvas }) => {
    await expect(
      canvas.getByRole("columnheader", { name: "Name" }),
    ).toBeVisible();
    await expect(
      canvas.queryByRole("columnheader", { name: "Email" }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByText("alice@example.com"),
    ).not.toBeInTheDocument();
  }),
};

export const ColumnAlignment: Story = {
  args: {
    columns: alignedColumns,
  },
};

export const ColumnTypes: Story = {
  render: () => <TypedColumnsDataTableExample />,
  parameters: { docs: { source: withExampleSource(implementation) } },
};

export const InferredValues: Story = {
  render: () => <InferredValuesDataTableExample />,
  parameters: { docs: { source: withExampleSource(implementation) } },
  play: testOnly(async ({ canvas }) => {
    await expect(canvas.getByText("ALICE JOHNSON")).toBeVisible();
    await expect(
      canvas.getByText("Alice Johnson <alice@example.com>"),
    ).toBeVisible();
  }),
};
