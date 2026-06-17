import type { DataFilterItemNumberInputProps } from "./data-filter-item-number-input-props";
import type { DataFilterOperator } from "../types";

export interface DataFilterDefaultNumberInputFieldProps {
  item: DataFilterItemNumberInputProps;
  operator: DataFilterOperator;
  value: unknown;
  onChange: (value: unknown) => void;
}
