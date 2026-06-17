import type { DataFilterItemBaseProps } from "./data-filter-item-base-props";
import type {
  DataFilterDatePickerBetweenValue,
  DataFilterDatePickerOperator,
} from "../types";

export interface DataFilterItemDatePickerProps extends DataFilterItemBaseProps<
  DataFilterDatePickerBetweenValue | Date | string | null,
  DataFilterDatePickerOperator
> {
  type: "date-picker";
  min?: Date | string;
  max?: Date | string;
  placeholder?: string;
}
