import { useState } from "react";
import { expect } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type {
  DataFilterItemProps,
  DataFilterProps,
  DataFilterValue,
} from "@/components/thread-ui/data-filter";
import { DataFilter } from "@/components/thread-ui/data-filter";

const options = [
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" },
];
const filters: DataFilterItemProps[] = [
  {
    field: "name",
    label: "Name",
    type: "input",
    operators: ["$eq", "$ne", "$fulltext"],
  },
  {
    field: "amount",
    label: "Amount",
    type: "number-input",
    min: 0,
    decimalScale: 2,
    operators: ["$eq", "$gte", "$between"],
  },
  {
    field: "createdAt",
    label: "Created at",
    type: "date-picker",
    operators: ["$eq", "$between"],
  },
  { field: "published", label: "Published", type: "checkbox" },
  { field: "status", label: "Status", type: "select", options },
];
function FilterExample(args: DataFilterProps) {
  const [value, setValue] = useState<DataFilterValue>(
    args.value ?? { filter: {}, query: "" },
  );
  return (
    <div className="space-y-4">
      <DataFilter {...args} value={value} onChange={setValue} />
      <pre
        aria-label="Filter value"
        className="bg-muted overflow-auto rounded-md p-4 text-sm"
      >
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
const meta = {
  id: "components-datafilter",
  title: "Data/DataFilter",
  component: DataFilter,
  args: { filters, search: { placeholder: "Search projects..." } },
  argTypes: { value: { control: false } },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Search, typed filter chips, and sorting in one toolbar. Search commits on Enter or blur. These examples show the resulting query object below the controls.",
      },
    },
  },
  render: FilterExample,
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
  args: { filters: [] },
  play: async ({ canvas, userEvent }) => {
    await userEvent.type(
      canvas.getByPlaceholderText("Search projects..."),
      "Thread{Enter}",
    );
    await expect(canvas.getByLabelText("Filter value")).toHaveTextContent(
      '"query": "Thread"',
    );
  },
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
    filters: [
      {
        field: "status",
        label: "Status",
        type: "select",
        options: async (query) => {
          await new Promise((resolve) => setTimeout(resolve, 200));
          return options.filter((option) =>
            option.label.toLowerCase().includes(query.toLowerCase()),
          );
        },
        resolveSelectedOptions: async (values) =>
          options.filter((option) => values.includes(option.value)),
      },
    ],
    value: { query: "", filter: { status: { $in: ["active"] } } },
  },
};
export const CustomValue: Story = {
  args: {
    filters: [
      {
        field: "name",
        label: "Name",
        type: "input",
        renderValue: ({ value }) => <strong>{String(value)}</strong>,
      },
    ],
    value: { query: "", filter: { name: { $eq: "Thread UI" } } },
  },
};
