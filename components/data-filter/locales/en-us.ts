import { enUS as calendarEnUS } from "react-day-picker/locale";
import type { ResolvedDataFilterLocale } from "../types";

export const enUS = {
  code: "en-US",
  calendar: calendarEnUS,
  addFilter: "Add Filter",
  removeFilter: "Remove filter",
  empty: "empty",
  isEmpty: "is empty",
  isNotEmpty: "is not empty",
  checked: "Checked",
  unchecked: "Unchecked",
  operators: {
    $eq: "is",
    $ne: "is not",
    $gt: "greater than",
    $gte: "greater than or equal",
    $lt: "less than",
    $lte: "less than or equal",
    $between: "between",
    $fulltext: "contains",
    $in: "contains",
    $nin: "does not contain",
  },
  minimumAriaLabel: (label) => `${label} minimum`,
  maximumAriaLabel: (label) => `${label} maximum`,
} satisfies ResolvedDataFilterLocale;
