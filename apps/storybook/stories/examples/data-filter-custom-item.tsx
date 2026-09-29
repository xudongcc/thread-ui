import { useState } from "react";
import type { DataFilterConditionValue } from "@/components/thread-ui/data-filter";
import { DataFilterItem } from "@/components/thread-ui/data-filter";
import { Input } from "@/components/ui/input";

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

CustomFilterItemExample.displayName = "CustomFilterItemExample";
