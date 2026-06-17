import dayjs from "dayjs";
import { getDataFilterBetweenValue } from "../utils";
import type { FC } from "react";

import type { DataFilterDefaultDatePickerFieldProps } from "../interfaces/data-filter-default-date-picker-field-props";
import { Calendar } from "@/components/ui/calendar";

const getDate = (value: unknown): Date | undefined => {
  if (value instanceof Date) {
    return value;
  }

  if (typeof value !== "string") {
    return undefined;
  }

  const date = dayjs(value);

  return date.isValid() ? date.toDate() : undefined;
};

export const DataFilterDefaultDatePickerField: FC<
  DataFilterDefaultDatePickerFieldProps
> = ({ item, operator, value, onChange }) => {
  const min = getDate(item.min);
  const max = getDate(item.max);
  const selected = getDate(value);
  const disabled = (date: Date) => {
    return (
      (typeof min !== "undefined" && dayjs(date).isBefore(min, "day")) ||
      (typeof max !== "undefined" && dayjs(date).isAfter(max, "day"))
    );
  };

  if (operator === "$between") {
    const range = getDataFilterBetweenValue(value);
    const selectedRange = {
      from: getDate(range.$gte),
      to: getDate(range.$lte),
    };

    return (
      <Calendar
        className="p-0 px-2 pb-2"
        defaultMonth={selectedRange.from ?? selectedRange.to}
        disabled={disabled}
        mode="range"
        selected={selectedRange}
        onSelect={(dateRange) => {
          onChange({
            $gte: dateRange?.from?.toISOString(),
            $lte: dateRange?.to?.toISOString(),
          });
        }}
      />
    );
  }

  return (
    <Calendar
      className="p-0 px-2 pb-2"
      defaultMonth={selected}
      disabled={disabled}
      mode="single"
      selected={selected}
      onSelect={(date) => {
        onChange(date ? date.toISOString() : undefined);
      }}
    />
  );
};
