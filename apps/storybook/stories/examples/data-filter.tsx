import { useState } from "react";
import type {
  DataFilterConditionValue,
  DataFilterField,
  DataFilterProps,
  DataFilterValue,
} from "@/components/thread-ui/data-filter";
import { DataFilter, DataFilterItem } from "@/components/thread-ui/data-filter";
import { Input } from "@/components/ui/input";

const options = [
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" },
];
export const noFilters: DataFilterField[] = [];
export const filters: DataFilterField[] = [
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
] satisfies DataFilterField[];
export const customFilters: DataFilterField[] = [
  {
    field: "name",
    label: "Name",
    type: "input",
    renderValue: ({ value }) => <strong>{String(value)}</strong>,
  },
];

// Keep Code panel component names stable in production builds.
FilterExample.displayName = "FilterExample";

export function FilterItemExample() {
  const [condition, setCondition] = useState<DataFilterConditionValue>();
  return (
    <div className="space-y-4">
      <DataFilterItem
        defaultOperator="$fulltext"
        field="name"
        label="Name"
        operators={["$eq", "$ne", "$fulltext"]}
        placeholder="Enter a name"
        type="input"
        value={condition}
        onChange={setCondition}
        onRemove={() => setCondition(undefined)}
      />
      <pre
        aria-label="Condition"
        className="bg-muted overflow-auto rounded-md p-4 text-sm"
      >
        {JSON.stringify(condition ?? null, null, 2)}
      </pre>
    </div>
  );
}

export function CustomFilterItemExample() {
  const [condition, setCondition] = useState<
    DataFilterConditionValue | undefined
  >({
    $eq: "Thread UI",
  });
  return (
    <DataFilterItem
      field="name"
      label="Name"
      type="input"
      value={condition}
      render={({ field, operator }) => (
        <Input
          aria-label="Custom name"
          placeholder={`Value for ${operator}`}
          value={field.value ?? ""}
          onChange={(event) => field.onChange(event.target.value || undefined)}
        />
      )}
      onChange={setCondition}
      onRemove={() => setCondition(undefined)}
    />
  );
}

FilterItemExample.displayName = "FilterItemExample";
CustomFilterItemExample.displayName = "CustomFilterItemExample";
