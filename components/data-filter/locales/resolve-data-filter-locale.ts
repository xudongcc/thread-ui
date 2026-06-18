import { enUS } from "./en-us";
import { zhCN } from "./zh-cn";
import type { DataFilterLocaleInput, ResolvedDataFilterLocale } from "../types";

const dataFilterLocalePresets: Record<string, ResolvedDataFilterLocale> = {
  en: enUS,
  "en-US": enUS,
  zh: zhCN,
  "zh-CN": zhCN,
};

const getLocalePreset = (locale?: DataFilterLocaleInput) => {
  if (typeof locale !== "string") {
    return locale;
  }

  return dataFilterLocalePresets[locale] ?? enUS;
};

export const resolveDataFilterLocale = (
  locale?: DataFilterLocaleInput,
): ResolvedDataFilterLocale => {
  const localePreset = getLocalePreset(locale);

  return {
    code: localePreset?.code ?? enUS.code,
    calendar: localePreset?.calendar ?? enUS.calendar,
    addFilter: localePreset?.addFilter ?? enUS.addFilter,
    removeFilter: localePreset?.removeFilter ?? enUS.removeFilter,
    empty: localePreset?.empty ?? enUS.empty,
    isEmpty: localePreset?.isEmpty ?? enUS.isEmpty,
    isNotEmpty: localePreset?.isNotEmpty ?? enUS.isNotEmpty,
    checked: localePreset?.checked ?? enUS.checked,
    unchecked: localePreset?.unchecked ?? enUS.unchecked,
    operators: {
      ...enUS.operators,
      ...localePreset?.operators,
    },
    minimumAriaLabel: localePreset?.minimumAriaLabel ?? enUS.minimumAriaLabel,
    maximumAriaLabel: localePreset?.maximumAriaLabel ?? enUS.maximumAriaLabel,
  };
};
