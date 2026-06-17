import type { DataFilterItemBaseProps } from "./data-filter-item-base-props";
import type {
  DataFilterNumberInputBetweenValue,
  DataFilterNumberInputOperator,
} from "../types";

export interface DataFilterItemNumberInputProps extends DataFilterItemBaseProps<
  DataFilterNumberInputBetweenValue | number | null,
  DataFilterNumberInputOperator
> {
  type: "number-input";
  min?: number;
  max?: number;
  step?: number;
  decimalScale?: number;
  fixedDecimalScale?: boolean;
  placeholder?: string;
}
