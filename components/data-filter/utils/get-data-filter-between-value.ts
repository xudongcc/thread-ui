import type { DataFilterBetweenValue } from "../types";

export const getDataFilterBetweenValue = (
  value: unknown,
): DataFilterBetweenValue => {
  if (
    value &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    !(value instanceof Date)
  ) {
    const record = value as Record<string, unknown>;

    return {
      $gte: record.$gte,
      $lte: record.$lte,
    };
  }

  return typeof value === "undefined" || value === null || value === ""
    ? {}
    : {
        $gte: value,
      };
};
