import { getDataFilterBetweenValue } from "./get-data-filter-between-value";
import type { DataFilterConditionValue, DataFilterOperator } from "../types";

export const createDataFilterCondition = (
  operator: DataFilterOperator,
  value: unknown,
): DataFilterConditionValue => {
  if (operator === "$between") {
    const range = getDataFilterBetweenValue(value);

    return {
      $gte: range.$gte,
      $lte: range.$lte,
    };
  }

  return {
    [operator]: value,
  };
};
