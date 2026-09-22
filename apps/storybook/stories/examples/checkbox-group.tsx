import { useState } from "react";
import type { ComponentProps } from "react";
import { CheckboxGroup } from "@/components/thread-ui/checkbox-group";

export function ControlledCheckboxGroupExample(
  args: ComponentProps<typeof CheckboxGroup<string>>,
) {
  const [value, setValue] = useState<string[]>([]);
  return (
    <div className="space-y-4">
      <CheckboxGroup {...args} value={value} onValueChange={setValue} />
      <output>Selected: {value.join(", ") || "None"}</output>
    </div>
  );
}

// Keep Code panel component names stable in production builds.
ControlledCheckboxGroupExample.displayName = "ControlledCheckboxGroupExample";
