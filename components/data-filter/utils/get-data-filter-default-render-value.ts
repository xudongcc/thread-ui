import { formatDataFilterDateValue } from "./data-filter-date-value";
import { formatRenderValue } from "./format-render-value";
import { getDataFilterBetweenValue } from "./get-data-filter-between-value";
import { isEmpty } from "./is-empty";
import type { DataFilterItemProps, DataFilterOperator } from "../types";

export const getDataFilterDefaultRenderValue = ({
  field,
  item,
  operator,
  value,
}: {
  field: string;
  item: DataFilterItemProps;
  operator: DataFilterOperator;
  value: unknown;
}): unknown => {
  if (item.type === "date-picker" && operator === "$between") {
    const range = getDataFilterBetweenValue(value);

    return range
      .map(formatDataFilterDateValue)
      .filter((rangeValue) => !isEmpty(rangeValue))
      .join(" - ");
  }

  if (item.type === "date-picker") {
    return formatDataFilterDateValue(value);
  }

  if (item.type === "checkbox") {
    if (value === true) {
      return "Checked";
    }

    if (value === false) {
      return "Unchecked";
    }
  }

  if (item.type === "number-input" && operator === "$between") {
    return getDataFilterBetweenValue(value)
      .filter((rangeValue) => !isEmpty(rangeValue))
      .join(" - ");
  }

  if (item.type === "select") {
    const values = Array.isArray(value) ? value : [value];
    const options = Array.isArray(item.options) ? item.options : [];

    return values
      .map((optionValue) => {
        return (
          options.find((option) => option.value === optionValue)?.label ??
          optionValue
        );
      })
      .join(", ");
  }

  return formatRenderValue({
    [field]: value,
  })[field];
};
