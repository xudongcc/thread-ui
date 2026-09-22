import { useState } from "react";
import type { ComponentProps } from "react";
import { NumberInput } from "@/components/thread-ui/number-input";

export function ControlledNumberInputExample(
  args: ComponentProps<typeof NumberInput>,
) {
  const [value, setValue] = useState("");
  return (
    <div className="space-y-3">
      <NumberInput
        {...args}
        thousandSeparator
        value={value}
        onValueChange={(values) => setValue(values.value)}
      />
      <output aria-label="Raw value">{value || "Empty"}</output>
    </div>
  );
}

// Keep Code panel component names stable in production builds.
ControlledNumberInputExample.displayName = "ControlledNumberInputExample";
