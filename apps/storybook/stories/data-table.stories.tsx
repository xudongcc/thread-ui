import { expect, fn, within } from "storybook/test";
import { testOnly } from "./utils/test-only";
import { DataTableExample, data, getRowId } from "./examples/data-table-shared";
import { columns } from "./examples/data-table";
import { InferredValuesDataTableExample } from "./examples/data-table-inferred-values";
import { PaginationDataTableExample } from "./examples/data-table-pagination";
import { RowSelectionDataTableExample } from "./examples/data-table-row-selection";
import { TypedColumnsDataTableExample } from "./examples/data-table-column-types";
import { alignedColumns } from "./examples/data-table-column-alignment";
import { customCellColumns } from "./examples/data-table-custom-cells";
import { customEmpty } from "./examples/data-table-custom-empty";
import { hiddenColumns } from "./examples/data-table-hidden-columns";
import { pinnedColumns } from "./examples/data-table-pinned-columns";
import {
  profileRowActions,
  renderElementColumns,
} from "./examples/data-table-render-element";
import { rowActions } from "./examples/data-table-row-actions";
import sharedSource from "./examples/data-table-shared.tsx?raw";
import inferredSource from "./examples/data-table-inferred-values.tsx?raw";
import paginationSource from "./examples/data-table-pagination.tsx?raw";
import selectionSource from "./examples/data-table-row-selection.tsx?raw";
import typesSource from "./examples/data-table-column-types.tsx?raw";
import alignmentSource from "./examples/data-table-column-alignment.tsx?raw";
import customCellsSource from "./examples/data-table-custom-cells.tsx?raw";
import customEmptySource from "./examples/data-table-custom-empty.tsx?raw";
import hiddenSource from "./examples/data-table-hidden-columns.tsx?raw";
import pinnedSource from "./examples/data-table-pinned-columns.tsx?raw";
import renderElementSource from "./examples/data-table-render-element.tsx?raw";
import actionsSource from "./examples/data-table-row-actions.tsx?raw";
import implementation from "./examples/data-table.tsx?raw";
import {
  functionSource,
  withExampleParameters,
  withExampleSource,
} from "./utils/example-source";
import type { User } from "./examples/data-table-shared";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataTable } from "@/components/thread-ui/data-table";

const sharedSources = { "./data-table-shared": sharedSource };
function tableParameters(
  source: string,
  dependencies: Record<string, string> = {},
) {
  return withExampleParameters(
    source,
    {
      columns,
      alignedColumns,
      hiddenColumns,
      customCellColumns,
      renderElementColumns,
      pinnedColumns,
    },
    ["columns"],
    { ...sharedSources, ...dependencies },
  );
}
const exampleParameters = tableParameters(implementation);

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
  parameters: tableParameters(customEmptySource, {
    "./data-table": implementation,
  }),
  args: {
    data: [],
    empty: customEmpty,
  },
};
export const RowSelection: Story = {
  parameters: tableParameters(selectionSource, {
    "./data-table": implementation,
  }),
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
  parameters: tableParameters(actionsSource, {
    "./data-table": implementation,
  }),
  args: {
    rowActions,
    onRowClick: fn(),
  },
};
export const PinnedColumns: Story = {
  // TODO(a11y): scrollable-region-focusable: the overflow container needs keyboard access.
  parameters: {
    ...tableParameters(pinnedSource, { "./data-table": implementation }),
    a11y: { test: "todo" },
  },
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
  parameters: tableParameters(paginationSource, {
    "./data-table": implementation,
  }),
  globals: { locale: "en" },
  render: (args) => <PaginationDataTableExample {...args} />,
  play: testOnly(async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /next/i }));
    await expect(canvas.getByText("Charlie Brown")).toBeVisible();
    await expect(canvas.queryByText("Alice Johnson")).not.toBeInTheDocument();
  }),
};

export const CustomCells: Story = {
  parameters: tableParameters(customCellsSource),
  args: {
    columns: customCellColumns,
  },
};

export const RenderElement: Story = {
  parameters: tableParameters(renderElementSource),
  args: {
    columns: renderElementColumns,
    rowActions: profileRowActions,
  },
};

export const HiddenColumns: Story = {
  parameters: tableParameters(hiddenSource),
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
  parameters: tableParameters(alignmentSource),
  args: {
    columns: alignedColumns,
  },
};

export const ColumnTypes: Story = {
  render: () => <TypedColumnsDataTableExample />,
  parameters: { docs: { source: withExampleSource(typesSource) } },
};

export const InferredValues: Story = {
  render: () => <InferredValuesDataTableExample />,
  parameters: {
    docs: { source: withExampleSource(inferredSource, sharedSources) },
  },
  play: testOnly(async ({ canvas }) => {
    await expect(canvas.getByText("ALICE JOHNSON")).toBeVisible();
    await expect(
      canvas.getByText("Alice Johnson <alice@example.com>"),
    ).toBeVisible();
  }),
};
