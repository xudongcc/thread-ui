import { useState } from "react";
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

export const filters: ComplexFilterItem[] = [
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
export function FilterExample(args: ComplexFilterProps) {
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

// Keep Code panel component names stable in production builds.
FilterExample.displayName = "FilterExample";
