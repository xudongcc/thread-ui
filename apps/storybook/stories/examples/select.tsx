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

ControlledSelectExample.displayName = "ControlledSelectExample";
