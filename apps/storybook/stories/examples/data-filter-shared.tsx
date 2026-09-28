import { useState } from "react";
import type {
  DataFilterProps,
  DataFilterValue,
} from "@/components/thread-ui/data-filter";
import { DataFilter } from "@/components/thread-ui/data-filter";

export const options = [
  { label: "Active", value: "active" },
  { label: "Archived", value: "archived" },
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

FilterExample.displayName = "FilterExample";
