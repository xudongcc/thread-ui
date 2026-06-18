import { zhCN as calendarZhCN } from "react-day-picker/locale";
import type { ResolvedDataFilterLocale } from "../types";

export const zhCN = {
  code: "zh-CN",
  calendar: calendarZhCN,
  addFilter: "添加筛选",
  removeFilter: "移除筛选",
  empty: "空",
  isEmpty: "为空",
  isNotEmpty: "不为空",
  checked: "已选中",
  unchecked: "未选中",
  operators: {
    $eq: "等于",
    $ne: "不等于",
    $gt: "大于",
    $gte: "大于等于",
    $lt: "小于",
    $lte: "小于等于",
    $between: "介于",
    $fulltext: "包含",
    $in: "包含",
    $nin: "不包含",
  },
  minimumAriaLabel: (label) => `${label} 最小值`,
  maximumAriaLabel: (label) => `${label} 最大值`,
} satisfies ResolvedDataFilterLocale;
