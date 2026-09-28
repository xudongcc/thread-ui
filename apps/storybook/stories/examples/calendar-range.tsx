import { useState } from "react";
import type { ComponentProps } from "react";
import { Calendar } from "@/components/thread-ui/calendar";

const referenceDate = new Date(2026, 8, 21);

export function RangeCalendar(args: ComponentProps<typeof Calendar>) {
  const [range, setRange] = useState<
    { from: Date | undefined; to?: Date } | undefined
  >({
    from: referenceDate,
    to: new Date(2026, 8, 25),
  });
  return (
    <Calendar
      {...args}
      mode="range"
      numberOfMonths={2}
      selected={range}
      onSelect={setRange}
    />
  );
}

RangeCalendar.displayName = "RangeCalendar";
