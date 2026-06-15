"use client";

import { useState } from "react";

import type {
  ComplexFilterItem,
  ComplexFilterValue,
} from "@/components/thread-ui/complex-filter";
import {
  ComplexFilter,
  ComplexFilterLogical,
  ComplexFilterType,
} from "@/components/thread-ui/complex-filter";
import { NumberInput } from "@/components/thread-ui/number-input";
import { Input } from "@/components/ui/input";

const filters: Array<ComplexFilterItem> = [
  {
    field: "name",
    label: "Name",
    type: ComplexFilterType.STRING,
    render: ({ value, disabled, onChange }) => (
      <Input
        className="w-[150px]"
        disabled={disabled}
        placeholder="Name"
        value={(value as string | undefined) ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
    ),
  },
  {
    field: "age",
    label: "Age",
    type: ComplexFilterType.NUMBER,
    render: ({ value, disabled, onChange }) => (
      <NumberInput
        className="w-[150px]"
        disabled={disabled}
        placeholder="Age"
        value={(value as number | undefined) ?? ""}
        onValueChange={(values) => {
          onChange(values.floatValue);
        }}
      />
    ),
  },
];

export default function ComplexFilterEmptyExample() {
  const [value, setValue] = useState<ComplexFilterValue>({
    [ComplexFilterLogical.AND]: [],
  });

  return (
    <div className="max-h-full w-full space-y-4 overflow-y-auto rounded-lg border p-4">
      <ComplexFilter filters={filters} value={value} onChange={setValue} />

      <div className="bg-muted rounded-md p-4 text-sm">
        <strong>Current Value:</strong>
        <pre className="mt-2 overflow-auto">
          {JSON.stringify(value, null, 2)}
        </pre>
      </div>
    </div>
  );
}
