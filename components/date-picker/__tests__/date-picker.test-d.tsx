import { DatePicker } from "../index";
import type { DatePickerProps } from "../index";

const DatePickerApi = () => (
  <DatePicker
    render={<button type="button">Pick a date</button>}
    selected={new Date("2026-01-01")}
    onSelect={() => undefined}
  />
);

const datePickerProps: DatePickerProps = {
  align: "start",
  selected: new Date("2026-01-01"),
  render: <button type="button">Pick a date</button>,
  onSelect: () => undefined,
};

const _InvalidDatePickerWithLocale = () => (
  <DatePicker
    // @ts-expect-error locale is provided by AppProvider.
    locale={{ code: "zh" }}
    render={<button type="button">Pick a date</button>}
  />
);

export { DatePickerApi, datePickerProps };
