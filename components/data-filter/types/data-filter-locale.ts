import type { DataFilterOperator } from "./data-filter-operator";
import type { Locale as DayPickerLocale } from "react-day-picker";

export type DataFilterLocaleCode = "en-US" | "zh-CN" | "en" | "zh";

export interface DataFilterLocale {
  code?: string;
  calendar?: Partial<DayPickerLocale>;
  addFilter?: string;
  removeFilter?: string;
  empty?: string;
  isEmpty?: string;
  isNotEmpty?: string;
  checked?: string;
  unchecked?: string;
  operators?: Partial<Record<DataFilterOperator, string>>;
  minimumAriaLabel?: (label: string) => string;
  maximumAriaLabel?: (label: string) => string;
}

export interface ResolvedDataFilterLocale extends Required<
  Omit<DataFilterLocale, "operators">
> {
  operators: Record<DataFilterOperator, string>;
}

export type DataFilterLocaleInput = string | DataFilterLocale;
