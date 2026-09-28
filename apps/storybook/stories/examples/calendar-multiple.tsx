import { useState } from "react";
import type { ComponentProps } from "react";
import { Calendar } from "@/components/thread-ui/calendar";

const referenceDate = new Date(2026, 8, 21);

export function MultipleCalendar(args: ComponentProps<typeof Calendar>) {
  const [dates, setDates] = useState<Date[] | undefined>([
    referenceDate,
    new Date(2026, 8, 23),
  ]);
  return (
    <Calendar {...args} mode="multiple" selected={dates} onSelect={setDates} />
  );
}

MultipleCalendar.displayName = "MultipleCalendar";
