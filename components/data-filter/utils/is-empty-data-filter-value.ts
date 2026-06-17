import { getDataFilterBetweenValue } from "./get-data-filter-between-value";
import { getDataFilterCondition } from "./get-data-filter-condition";
import { isEmpty } from "./is-empty";

export const isEmptyDataFilterValue = (value: unknown): boolean => {
  const condition = getDataFilterCondition(value);

  if (condition.operator === "$between") {
    const range = getDataFilterBetweenValue(condition.value);

    return isEmpty(range.$gte) && isEmpty(range.$lte);
  }

  return isEmpty(condition.value);
};
