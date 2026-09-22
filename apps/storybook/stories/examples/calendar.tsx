import { useState } from "react";
import type { ComponentProps } from "react";
import { Calendar } from "@/components/thread-ui/calendar";

const referenceDate = new Date(2026, 8, 21);
export function SingleCalendar(args: ComponentProps<typeof Calendar>) {
  const [date, setDate] = useState<Date | undefined>(referenceDate);
  return (
    <Calendar {...args} mode="single" selected={date} onSelect={setDate} />
  );
}
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
export function MultipleCalendar(args: ComponentProps<typeof Calendar>) {
  const [dates, setDates] = useState<Date[] | undefined>([
    referenceDate,
    new Date(2026, 8, 23),
  ]);
  return (
    <Calendar {...args} mode="multiple" selected={dates} onSelect={setDates} />
  );
}

// Keep Code panel component names stable in production builds.
SingleCalendar.displayName = "SingleCalendar";
RangeCalendar.displayName = "RangeCalendar";
MultipleCalendar.displayName = "MultipleCalendar";
