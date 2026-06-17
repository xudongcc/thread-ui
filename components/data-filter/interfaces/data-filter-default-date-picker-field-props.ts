import type { DataFilterItemDatePickerProps } from "./data-filter-item-date-picker-props";
import type { DataFilterOperator } from "../types";

export interface DataFilterDefaultDatePickerFieldProps {
  item: DataFilterItemDatePickerProps;
  operator: DataFilterOperator;
  value: unknown;
  onChange: (value: unknown) => void;
}
