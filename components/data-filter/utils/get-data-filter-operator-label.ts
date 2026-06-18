import { dataFilterOperatorLabels } from "./data-filter-operator-labels";
import type { DataFilterLocale, DataFilterOperator } from "../types";

export const getDataFilterOperatorLabel = (
  operator: DataFilterOperator,
  locale?: DataFilterLocale,
): string => {
  return locale?.operators?.[operator] ?? dataFilterOperatorLabels[operator];
};
