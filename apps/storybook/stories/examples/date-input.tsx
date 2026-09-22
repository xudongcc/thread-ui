import { useState } from "react";
import type { DateInputProps } from "@/components/thread-ui/date-input";
import { DateInput } from "@/components/thread-ui/date-input";

export function DateInputExample(args: DateInputProps) {
  const [date, setDate] = useState(args.selected);
  return <DateInput {...args} selected={date} onSelect={setDate} />;
}

// Keep Code panel component names stable in production builds.
DateInputExample.displayName = "DateInputExample";
