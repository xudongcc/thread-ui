import { expect } from "storybook/test";
import { testOnly } from "./utils/test-only";
import {
  FilterExample,
  asyncFilters,
  customFilters,
  filters,
  noFilters,
} from "./examples/data-filter";
import implementation from "./examples/data-filter.tsx?raw";
import { withExampleParameters } from "./utils/example-source";
import type { Meta, StoryObj } from "@storybook/react-vite";
import { DataFilter } from "@/components/thread-ui/data-filter";

const exampleParameters = withExampleParameters(
  implementation,
  { filters, asyncFilters, customFilters, noFilters },
  ["filters"],
);

const meta = {
  id: "components-datafilter",
  title: "Data/DataFilter",
  component: DataFilter,
  args: { filters, search: { placeholder: "Search projects..." } },
  // Custom editor/filter functions are fixed fixtures; other props remain editable.
  argTypes: { value: { control: false }, filters: { control: false } },
  parameters: {
    ...exampleParameters,
    layout: "padded",
    docs: {
      ...exampleParameters.docs,
      description: {
        component:
          "Search, typed filter chips, and sorting in one toolbar. Search commits on Enter or blur. These examples show the resulting query object below the controls.",
      },
    },
  },
  render: (args) => <FilterExample {...args} />,
} satisfies Meta<typeof DataFilter>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "Props API",
};
export const Populated: Story = {
  args: {
    value: {
      query: "Thread",
      filter: {
        name: { $fulltext: "Thread" },
        amount: { $between: [10, 100] },
        status: { $in: ["active"] },
        published: { $eq: true },
        createdAt: {
          $between: ["2026-09-01T00:00:00.000Z", "2026-09-21T00:00:00.000Z"],
        },
      },
    },
  },
};
export const Search: Story = {
  args: { filters: noFilters },
  play: testOnly(async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByPlaceholderText("Search projects..."),
      "Thread{Enter}",
    );
    await expect(canvas.getByLabelText("Filter value")).toHaveTextContent(
      '"query": "Thread"',
    );
  }),
};
export const Sort: Story = {
  args: {
    sort: {
      options: [
        {
          field: "createdAt",
          fieldLabel: "Created at",
          direction: "DESC",
          directionLabel: "Newest first",
        },
        {
          field: "createdAt",
          fieldLabel: "Created at",
          direction: "ASC",
          directionLabel: "Oldest first",
        },
      ],
    },
  },
};
export const Loading: Story = { args: { loading: true } };
export const FiltersOnly: Story = { args: { search: false } };
export const AsyncOptions: Story = {
  args: {
    filters: asyncFilters,
    value: { query: "", filter: { status: { $in: ["active"] } } },
  },
};
export const CustomValue: Story = {
  args: {
    filters: customFilters,
    value: { query: "", filter: { name: { $eq: "Thread UI" } } },
  },
};
