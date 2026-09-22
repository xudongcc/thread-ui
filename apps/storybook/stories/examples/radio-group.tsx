import { useState } from "react";
import type { ComponentProps } from "react";
import { RadioGroup } from "@/components/thread-ui/radio-group";

export function ControlledRadioGroupExample(
  args: ComponentProps<typeof RadioGroup<string>>,
) {
  const [value, setValue] = useState("starter");
  return (
    <div className="space-y-4">
      <RadioGroup {...args} value={value} onValueChange={setValue} />
      <output>Selected: {value}</output>
    </div>
  );
}

// Keep Code panel component names stable in production builds.
ControlledRadioGroupExample.displayName = "ControlledRadioGroupExample";
