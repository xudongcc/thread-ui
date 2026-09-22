import { useState } from "react";
import type { ComponentProps } from "react";
import { Textarea } from "@/components/thread-ui/textarea";

export function ControlledTextareaExample(
  args: ComponentProps<typeof Textarea>,
) {
  const [value, setValue] = useState("");
  return (
    <div className="space-y-3">
      <Textarea
        {...args}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <output>{value.length} characters</output>
    </div>
  );
}

// Keep Code panel component names stable in production builds.
ControlledTextareaExample.displayName = "ControlledTextareaExample";
