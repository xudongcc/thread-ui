import { DateInput } from "../index";
import type { DateInputProps } from "../index";

const DateInputApi = () => (
  <DateInput
    description="Select your date of birth"
    error="Please select a valid date"
    format="MMMM D, YYYY"
    label="Birth Date"
    placeholder="Pick a date"
    selected={new Date("2026-01-01")}
    onSelect={() => undefined}
  />
);

const dateInputProps: DateInputProps = {
  label: "Date",
  placeholder: "Select a date",
  disabled: true,
  selected: new Date("2026-01-01"),
  onSelect: () => undefined,
};

export { DateInputApi, dateInputProps };
