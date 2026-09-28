import { useState } from "react";
import type { DataFilterConditionValue } from "@/components/thread-ui/data-filter";
import { DataFilterItem } from "@/components/thread-ui/data-filter";

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

FilterItemExample.displayName = "FilterItemExample";
