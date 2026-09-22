import { useState } from "react";
import { expect } from "storybook/test";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type {
  ComplexFilterItem,
  ComplexFilterProps,
  ComplexFilterValue,
} from "@/components/thread-ui/complex-filter";
import {
  ComplexFilter,
  ComplexFilterType,
} from "@/components/thread-ui/complex-filter";
import { Input } from "@/components/thread-ui/input";
import { NumberInput } from "@/components/thread-ui/number-input";
import { DateInput } from "@/components/thread-ui/date-input";

const filters: ComplexFilterItem[] = [
  {
    field: "name",
    label: "Name",
    type: ComplexFilterType.STRING,
    render: ({ value, disabled, onChange }) => (
      <Input
        aria-label="Name value"
        className="w-40"
        disabled={disabled}
        value={String(value ?? "")}
        onChange={(event) => onChange(event.target.value)}
      />
    ),
  },
  {
    field: "amount",
    label: "Amount",
    type: ComplexFilterType.NUMBER,
    render: ({ value, disabled, onChange }) => (
      <NumberInput
        aria-label="Amount value"
        className="w-40"
        disabled={disabled}
        value={typeof value === "number" ? value : ""}
        onValueChange={(values) => onChange(values.floatValue)}
      />
    ),
  },
  {
    field: "date",
    label: "Date",
    type: ComplexFilterType.DATE,
    render: ({ value, disabled, onChange }) => (
      <DateInput
        aria-label="Date value"
        className="w-44"
        disabled={disabled}
        placeholder="Choose date"
        selected={value ? new Date(String(value)) : undefined}
        onSelect={(date) => onChange(date?.toISOString())}
      />
    ),
  },
];
function FilterExample(args: ComplexFilterProps) {
  const [value, setValue] = useState<ComplexFilterValue>(
    args.value ?? { $and: [] },
  );
  return (
    <div className="space-y-4">
      <ComplexFilter {...args} value={value} onChange={setValue} />
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
  id: "components-complexfilter",
  title: "Data/ComplexFilter",
  component: ComplexFilter<"object">,
  args: { filters, showClearAll: true },
  argTypes: { value: { control: false } },
  parameters: {
    layout: "padded",
    docs: {
      description: {
        component:
          "Build nested AND/OR condition groups with custom value editors. Examples expose the resulting object, including nested groups and date/number values.",
      },
    },
  },
  render: FilterExample,
} satisfies Meta<typeof ComplexFilter<"object">>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  name: "Props API",
  args: { value: { $and: [{ name: { $eq: "Thread" } }] } },
};
export const Empty: Story = {};
export const NestedGroups: Story = {
  args: {
    value: {
      $and: [
        { name: { $fulltext: "Thread" } },
        { $or: [{ amount: { $gte: 100 } }, { amount: { $lt: 10 } }] },
      ],
    },
  },
};
export const DateCondition: Story = {
  args: { value: { $and: [{ date: { $gte: "2026-09-21T00:00:00.000Z" } }] } },
};
export const WithoutClearAll: Story = {
  args: { showClearAll: false, value: { $and: [{ name: { $eq: "Thread" } }] } },
};
export const ClearAll: Story = {
  globals: { locale: "en" },
  args: { value: { $and: [{ name: { $eq: "Thread" } }] } },
  play: async ({ canvas, userEvent }) => {
    await userEvent.click(canvas.getByRole("button", { name: /clear all/i }));
    await expect(canvas.getByLabelText("Filter value")).not.toHaveTextContent(
      "Thread",
    );
  },
};
