import { useState } from "react";
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
export const noFilters: DataFilterItemProps[] = [];
export const filters: DataFilterItemProps[] = [
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
export function FilterExample(args: DataFilterProps) {
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
export const asyncFilters = [
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
] satisfies DataFilterItemProps[];
export const customFilters: DataFilterItemProps[] = [
  {
    field: "name",
    label: "Name",
    type: "input",
    renderValue: ({ value }) => <strong>{String(value)}</strong>,
  },
];

// Keep Code panel component names stable in production builds.
FilterExample.displayName = "FilterExample";
