import { useState } from "react";
import type { ComponentProps } from "react";
import { Select } from "@/components/thread-ui/select";

export function ControlledSelectExample(
  args: ComponentProps<typeof Select<string>>,
) {
  const [value, setValue] = useState<string | null>(null);
  return (
    <div className="space-y-3">
      <Select {...args} value={value} onValueChange={setValue} />
      <output>Selected: {value || "None"}</output>
    </div>
  );
}

export function MultipleSelectExample(
  args: ComponentProps<typeof Select<string>>,
) {
  const [value, setValue] = useState<string[]>(["react"]);
  return (
    <Select<string, true>
      multiple
      items={args.items}
      label="Frameworks"
      value={value}
      onValueChange={setValue}
    />
  );
}

// Keep Code panel component names stable in production builds.
ControlledSelectExample.displayName = "ControlledSelectExample";
MultipleSelectExample.displayName = "MultipleSelectExample";
