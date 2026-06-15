"use client";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { ChevronDown, Plus, X } from "lucide-react";
import { useMemo, useRef, useState } from "react";
import type { FC, ReactNode } from "react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";

export enum ComplexFilterType {
  STRING = "string",
  NUMBER = "number",
  BOOLEAN = "boolean",
  DATE = "date",
  DATETIME = "datetime",
}

export enum ComplexFilterLogical {
  AND = "$and",
  OR = "$or",
}

export type ComplexFilterEqualityOperator = "$eq" | "$ne";

export type ComplexFilterComparisonOperator = "$gt" | "$gte" | "$lt" | "$lte";

export type ComplexFilterMembershipOperator = "$in" | "$nin";

export type ComplexFilterFullTextOperator = "$fulltext";

export type ComplexFilterOperator =
  | ComplexFilterEqualityOperator
  | ComplexFilterComparisonOperator
  | ComplexFilterMembershipOperator
  | ComplexFilterFullTextOperator;

export type ComplexFilterCondition = Record<
  string,
  Partial<Record<ComplexFilterOperator, any>>
>;

export type ComplexFilterGroupValue = {
  [K in ComplexFilterLogical]?: Array<ComplexFilterValue>;
};

export type ComplexFilterValue =
  | ComplexFilterGroupValue
  | ComplexFilterCondition;

export type ComplexFilterValueFormat = "object" | "string";

export type ComplexFilterValueByFormat<T extends ComplexFilterValueFormat> =
  T extends "string" ? string : ComplexFilterValue;

const filterOperators: Record<
  ComplexFilterType,
  Array<ComplexFilterOperator>
> = {
  [ComplexFilterType.STRING]: ["$eq", "$ne"],
  [ComplexFilterType.NUMBER]: ["$eq", "$ne", "$gt", "$gte", "$lt", "$lte"],
  [ComplexFilterType.BOOLEAN]: ["$eq", "$ne"],
  [ComplexFilterType.DATE]: ["$eq", "$ne", "$gt", "$gte", "$lt", "$lte"],
  [ComplexFilterType.DATETIME]: ["$eq", "$ne", "$gt", "$gte", "$lt", "$lte"],
};

export interface ComplexFilterItem {
  type: ComplexFilterType;
  label: string;
  field: string;
  render: (options: {
    filterType: ComplexFilterType;
    value: any;
    operator?: ComplexFilterOperator;
    disabled: boolean;
    onChange: (value: any) => void;
  }) => ReactNode;
  operators?: Array<ComplexFilterOperator>;
}

export interface ComplexFilterI18n {
  operators: Record<ComplexFilterOperator, string>;
  logicals: Record<ComplexFilterLogical, string>;
  addCondition: string;
  addGroup: string;
  selectField: string;
  selectOperator: string;
  selectValue: string;
  clearAll: string;
}

export const defaultComplexFilterI18n: ComplexFilterI18n = {
  operators: {
    $eq: "Equal",
    $ne: "Not equal",
    $gt: "Greater than",
    $gte: "Greater than or equal",
    $lt: "Less than",
    $lte: "Less than or equal",
    $in: "Includes",
    $nin: "Excludes",
    $fulltext: "Contains",
  },
  logicals: {
    $and: "AND",
    $or: "OR",
  },
  addCondition: "Add condition",
  addGroup: "Add group",
  selectField: "Select field",
  selectOperator: "Select operator",
  selectValue: "Select value",
  clearAll: "Clear all",
};

function isFilterGroup(
  value: ComplexFilterValue,
): value is ComplexFilterGroupValue {
  return (
    value !== null &&
    typeof value === "object" &&
    (ComplexFilterLogical.AND in value || ComplexFilterLogical.OR in value)
  );
}

function cleanFilterValue(
  value: ComplexFilterValue,
): ComplexFilterValue | undefined {
  if (isFilterGroup(value)) {
    const logical =
      ComplexFilterLogical.AND in value
        ? ComplexFilterLogical.AND
        : ComplexFilterLogical.OR;
    const items = value[logical];

    if (!items) return undefined;

    const cleanedItems = items
      .map((item) => cleanFilterValue(item))
      .filter((item): item is ComplexFilterValue => item !== undefined);

    if (cleanedItems.length === 0) return undefined;

    return { [logical]: cleanedItems };
  }

  const entries = Object.entries(value);
  if (entries.length === 0) return undefined;

  const [, operatorValuePair] = entries[0];
  if (!operatorValuePair || Object.keys(operatorValuePair).length === 0) {
    return undefined;
  }

  const hasValidValue = Object.entries(operatorValuePair).some(([, val]) => {
    return val !== undefined && val !== null && val !== "";
  });

  if (!hasValidValue) {
    return undefined;
  }

  return value;
}

function createEmptyFilterValue(): ComplexFilterValue {
  return { [ComplexFilterLogical.AND]: [] };
}

function normalizeFilterValue(value: unknown): ComplexFilterValue {
  return value !== null && typeof value === "object"
    ? (value as ComplexFilterValue)
    : createEmptyFilterValue();
}

export interface ComplexFilterConditionRowProps {
  i18n: ComplexFilterI18n;
  filters: Array<ComplexFilterItem>;
  value: ComplexFilterCondition;
  onChange: (value: ComplexFilterCondition) => void;
  onRemove: () => void;
}

export const ComplexFilterConditionRow: FC<ComplexFilterConditionRowProps> = ({
  i18n,
  filters,
  value,
  onChange,
  onRemove,
}) => {
  const [field, operatorValuePair] = useMemo<
    [
      string | undefined,
      Partial<Record<ComplexFilterOperator, any>> | undefined,
    ]
  >(() => {
    const entries = Object.entries(value);
    if (entries.length === 0) return [undefined, undefined];
    return [entries[0][0], entries[0][1]];
  }, [value]);

  const [operator, targetValue] = useMemo<
    [ComplexFilterOperator | undefined, any]
  >(() => {
    if (!operatorValuePair) return [undefined, undefined];
    const entries = Object.entries(operatorValuePair);
    if (entries.length === 0) return [undefined, undefined];
    return [entries[0][0] as ComplexFilterOperator, entries[0][1]];
  }, [operatorValuePair]);

  const selectedFilter = useMemo(
    () => filters.find((filter) => filter.field === field),
    [filters, field],
  );

  const operators = useMemo(() => {
    return selectedFilter
      ? (selectedFilter.operators ?? filterOperators[selectedFilter.type])
      : [];
  }, [selectedFilter]);

  const fieldItems = useMemo(
    () =>
      filters.map((filter) => ({
        label: filter.label,
        value: filter.field,
      })),
    [filters],
  );

  const operatorItems = useMemo(
    () =>
      operators.map((operator) => ({
        label: i18n.operators[operator],
        value: operator,
      })),
    [i18n, operators],
  );

  const handleFieldChange = (newField: string) => {
    onChange({ [newField]: {} });
  };

  const handleOperatorChange = (newOperator: ComplexFilterOperator) => {
    if (!field) return;
    onChange({ [field]: { [newOperator]: targetValue ?? "" } });
  };

  const handleValueChange = (newValue: any) => {
    if (!field || !operator) return;
    onChange({ [field]: { [operator]: newValue } });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select
        items={fieldItems}
        value={field}
        onValueChange={(value) => {
          if (value) handleFieldChange(value);
        }}
      >
        <SelectTrigger className="min-w-[150px]">
          <SelectValue placeholder={i18n.selectField} />
        </SelectTrigger>

        <SelectContent>
          {filters.map((filter) => (
            <SelectItem key={filter.field} value={filter.field}>
              {filter.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        disabled={!selectedFilter}
        items={operatorItems}
        value={operator}
        onValueChange={(value) => {
          if (value) handleOperatorChange(value as ComplexFilterOperator);
        }}
      >
        <SelectTrigger className="min-w-[150px]">
          <SelectValue placeholder={i18n.selectOperator} />
        </SelectTrigger>

        <SelectContent>
          {operators.map((operator) => (
            <SelectItem key={operator} value={operator}>
              {i18n.operators[operator]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedFilter?.render({
        filterType: selectedFilter.type,
        value: targetValue,
        operator,
        disabled: !operator,
        onChange: handleValueChange,
      })}

      <Button size="icon" type="button" variant="ghost" onClick={onRemove}>
        <X className="size-4" />
      </Button>
    </div>
  );
};

export interface ComplexFilterGroupProps {
  i18n: ComplexFilterI18n;
  filters: Array<ComplexFilterItem>;
  value: ComplexFilterGroupValue;
  onChange: (value: ComplexFilterGroupValue) => void;
  onRemove?: () => void;
}

export const ComplexFilterGroup: FC<ComplexFilterGroupProps> = ({
  i18n,
  filters,
  value,
  onChange,
  onRemove,
}) => {
  const [logical, items]: [ComplexFilterLogical, Array<ComplexFilterValue>] =
    useMemo(() => {
      if (
        ComplexFilterLogical.AND in value &&
        value[ComplexFilterLogical.AND]
      ) {
        return [ComplexFilterLogical.AND, value[ComplexFilterLogical.AND]];
      }

      if (ComplexFilterLogical.OR in value && value[ComplexFilterLogical.OR]) {
        return [ComplexFilterLogical.OR, value[ComplexFilterLogical.OR]];
      }

      return [ComplexFilterLogical.AND, []];
    }, [value]);

  const handleLogicalChange = (newLogical: ComplexFilterLogical) => {
    onChange({ [newLogical]: items });
  };

  const handleItemChange = (index: number, newItem: ComplexFilterValue) => {
    const newItems = [...items];
    newItems[index] = newItem;
    onChange({ [logical]: newItems });
  };

  const handleItemRemove = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);

    if (newItems.length === 0 && onRemove) {
      onRemove();
      return;
    }

    onChange({ [logical]: newItems });
  };

  const handleAddCondition = () => {
    onChange({ [logical]: [...items, {}] });
  };

  const handleAddGroup = () => {
    onChange({
      [logical]: [...items, { [ComplexFilterLogical.AND]: [{}] }],
    });
  };

  return (
    <div className="flex gap-2">
      <div className="bg-background flex-1 rounded-lg border p-4">
        {items.length > 0 && (
          <div className="mb-4 flex gap-2">
            {items.length > 1 && (
              <div className="flex w-12 flex-col py-4 pl-4">
                <div className="border-border w-full flex-1 rounded-tl-md border-t-2 border-l-2" />

                <Button
                  className="-translate-x-1/2 text-xs"
                  size="sm"
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    const newLogical =
                      logical === ComplexFilterLogical.AND
                        ? ComplexFilterLogical.OR
                        : ComplexFilterLogical.AND;
                    handleLogicalChange(newLogical);
                  }}
                >
                  {i18n.logicals[logical]}
                </Button>

                <div
                  className="border-border w-full flex-1 rounded-bl-md border-b-2 border-l-2"
                  style={{ height: "calc(50% - 18px)" }}
                />
              </div>
            )}

            <div className="flex-1 space-y-3">
              {items.map((item, index) => (
                <div key={index}>
                  {isFilterGroup(item) ? (
                    <ComplexFilterGroup
                      filters={filters}
                      i18n={i18n}
                      value={item}
                      onChange={(newValue) => handleItemChange(index, newValue)}
                      onRemove={() => handleItemRemove(index)}
                    />
                  ) : (
                    <ComplexFilterConditionRow
                      filters={filters}
                      i18n={i18n}
                      value={item}
                      onChange={(newValue) => handleItemChange(index, newValue)}
                      onRemove={() => handleItemRemove(index)}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className={cn("flex gap-2", items.length > 1 && "ml-12")}>
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  className="h-8"
                  size="sm"
                  type="button"
                  variant="outline"
                >
                  <Plus className="mr-1 size-4" />
                  {i18n.addCondition}
                  <ChevronDown className="ml-1 size-4" />
                </Button>
              }
            />
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={handleAddCondition}>
                {i18n.addCondition}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleAddGroup}>
                {i18n.addGroup}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {onRemove && (
        <Button size="icon" type="button" variant="ghost" onClick={onRemove}>
          <X className="size-4" />
        </Button>
      )}
    </div>
  );
};

export interface ComplexFilterProps<
  TFormat extends ComplexFilterValueFormat = "object",
> {
  filters: Array<ComplexFilterItem>;
  i18n?: ComplexFilterI18n;
  showClearAll?: boolean;
  value?: ComplexFilterValueByFormat<TFormat>;
  onChange?: (value: ComplexFilterValueByFormat<TFormat>) => void;
}

export const ComplexFilter = <
  TFormat extends ComplexFilterValueFormat = "object",
>({
  i18n = defaultComplexFilterI18n,
  filters,
  showClearAll = false,
  value,
  onChange,
}: ComplexFilterProps<TFormat>) => {
  const [displayState, setDisplayState] = useState(() => {
    const displayValue =
      value === undefined
        ? createEmptyFilterValue()
        : normalizeFilterValue(value);

    return {
      externalValueStr: value === undefined ? "" : JSON.stringify(displayValue),
      value: displayValue,
    };
  });
  const lastCleanedValueStrRef = useRef<string>("");

  if (value !== undefined) {
    const nextDisplayValue = normalizeFilterValue(value);
    const nextExternalValueStr = JSON.stringify(nextDisplayValue);

    if (nextExternalValueStr !== displayState.externalValueStr) {
      setDisplayState({
        externalValueStr: nextExternalValueStr,
        value: nextDisplayValue,
      });
    }
  }

  const internalDisplayValue = displayState.value;

  const setInternalDisplayValue = (nextValue: ComplexFilterValue) => {
    setDisplayState((current) => ({
      ...current,
      value: nextValue,
    }));
  };

  const handleChange = (newValue: ComplexFilterValue) => {
    if (!onChange) {
      setInternalDisplayValue(newValue);
      return;
    }

    const cleaned = cleanFilterValue(newValue);
    const finalObjectValue = cleaned ?? createEmptyFilterValue();
    const finalValueStr = JSON.stringify(finalObjectValue);
    const shouldNotify = finalValueStr !== lastCleanedValueStrRef.current;

    setDisplayState((current) => ({
      externalValueStr: shouldNotify ? finalValueStr : current.externalValueStr,
      value: newValue,
    }));

    if (shouldNotify) {
      lastCleanedValueStrRef.current = finalValueStr;
      onChange(finalObjectValue as ComplexFilterValueByFormat<TFormat>);
    }
  };

  const handleClearAll = () => {
    const emptyValue = createEmptyFilterValue();
    if (onChange) {
      const emptyValueStr = JSON.stringify(emptyValue);
      setDisplayState({
        externalValueStr: emptyValueStr,
        value: emptyValue,
      });
      lastCleanedValueStrRef.current = emptyValueStr;

      onChange(emptyValue as unknown as ComplexFilterValueByFormat<TFormat>);
      return;
    }

    setInternalDisplayValue(emptyValue);
  };

  if (!isFilterGroup(internalDisplayValue)) {
    return null;
  }

  return (
    <div className="space-y-4">
      <ComplexFilterGroup
        filters={filters}
        i18n={i18n}
        value={internalDisplayValue}
        onChange={handleChange}
      />

      {showClearAll && (
        <div className="flex justify-end">
          <Button
            size="sm"
            type="button"
            variant="ghost"
            onClick={handleClearAll}
          >
            {i18n.clearAll}
          </Button>
        </div>
      )}
    </div>
  );
};
