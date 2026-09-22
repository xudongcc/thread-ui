import { useState } from "react";
import type { DatePickerProps } from "@/components/thread-ui/date-picker";
import { DatePicker } from "@/components/thread-ui/date-picker";
import { Button } from "@/components/thread-ui/button";

export function PickerExample(args: DatePickerProps) {
  const [date, setDate] = useState(args.selected);
  return (
    <div className="space-y-3">
      <DatePicker
        {...args}
        render={<Button variant="outline">Choose date</Button>}
        selected={date}
        onSelect={setDate}
      />
      <output aria-label="Selected date">
        {date
          ? `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`
          : "No date selected"}
      </output>
    </div>
  );
}

// Keep Code panel component names stable in production builds.
PickerExample.displayName = "PickerExample";
