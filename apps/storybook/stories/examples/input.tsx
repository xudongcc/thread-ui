import { useState } from "react";
import type { ComponentProps } from "react";
import { Input } from "@/components/thread-ui/input";

export function ControlledInputExample(args: ComponentProps<typeof Input>) {
  const [value, setValue] = useState("");
  return (
    <div className="space-y-3">
      <Input
        {...args}
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
      <output>{value || "Empty"}</output>
    </div>
  );
}

// Keep Code panel component names stable in production builds.
ControlledInputExample.displayName = "ControlledInputExample";
