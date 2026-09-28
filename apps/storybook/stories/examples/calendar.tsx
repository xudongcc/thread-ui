import { useState } from "react";
import type { ComponentProps } from "react";
import { Calendar } from "@/components/thread-ui/calendar";

export const referenceDate = new Date(2026, 8, 21);

export function SingleCalendar(args: ComponentProps<typeof Calendar>) {
  const [date, setDate] = useState<Date | undefined>(referenceDate);
  return (
    <Calendar {...args} mode="single" selected={date} onSelect={setDate} />
  );
}

SingleCalendar.displayName = "SingleCalendar";
