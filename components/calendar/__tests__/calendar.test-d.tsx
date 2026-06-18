import { Calendar } from "../index";
import type { CalendarProps } from "../index";

const CalendarApi = () => (
  <Calendar
    captionLayout="dropdown"
    mode="single"
    numberOfMonths={2}
    selected={new Date("2025-03-15")}
  />
);

const calendarProps: CalendarProps = {
  captionLayout: "dropdown",
  mode: "single",
  numberOfMonths: 2,
  selected: new Date("2025-03-15"),
};

const _InvalidCalendarWithLocale = () => (
  <Calendar
    // @ts-expect-error locale is provided by AppProvider.
    locale={{ code: "zh" }}
    mode="single"
  />
);

export { CalendarApi, calendarProps };
