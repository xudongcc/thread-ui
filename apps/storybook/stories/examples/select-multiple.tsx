import { useState } from "react";
import type { ComponentProps } from "react";
import { Select } from "@/components/thread-ui/select";

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

MultipleSelectExample.displayName = "MultipleSelectExample";
