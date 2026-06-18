import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getDataFilterBetweenValue,
  getDataFilterCondition,
  hydrateDataFilterValueFilter,
  isEmptyDataFilterValue,
  normalizeDataFilterValue,
  serializeDataFilterValueFilter,
} from "../utils";
import type { FC, ReactNode } from "react";
import type {
  DataFilterItemProps,
  DataFilterSortValue,
  DataFilterValue,
} from "../types";

type DataFilterGroups = {
  visibleFilters: Array<DataFilterItemProps>;
  hiddenFilters: Array<DataFilterItemProps>;
};

type DataFilterContextValue = DataFilterGroups & {
  value: DataFilterValue;
  filterValues: Record<string, unknown>;
  setQuery: (query: string) => void;
  setOrderBy: (orderBy: DataFilterSortValue) => void;
  setFilterValue: (field: string, value: unknown) => void;
  setFilterVisible: (field: string, visible: boolean) => void;
  hideFilter: (field: string) => void;
  removeFilter: (field: string) => void;
};

interface DataFilterProviderProps {
  children: ReactNode;
  filters: Array<DataFilterItemProps>;
  value?: DataFilterValue;
  defaultValue?: DataFilterValue;
  onChange?: (value: DataFilterValue) => void;
}

const DataFilterContext = createContext<DataFilterContextValue | null>(null);

const getFilterGroups = (
  filters: Array<DataFilterItemProps>,
  values: Record<string, unknown>,
  visibleFields = new Set<string>(),
): DataFilterGroups => {
  return filters.reduce<DataFilterGroups>(
    (groups, item) => {
      if (
        visibleFields.has(item.field) ||
        !isEmptyDataFilterValue(values[item.field])
      ) {
        groups.visibleFilters.push(item);
      } else {
        groups.hiddenFilters.push(item);
      }

      return groups;
    },
    {
      visibleFilters: [],
      hiddenFilters: [],
    },
  );
};

const getActiveFields = (values: Record<string, unknown>) => {
  return new Set(
    Object.entries(values)
      .filter(([, value]) => !isEmptyDataFilterValue(value))
      .map(([field]) => field),
  );
};

const isIncompleteBetweenValue = (value: unknown) => {
  const condition = getDataFilterCondition(value);

  if (condition.operator !== "$between") {
    return false;
  }

  const range = getDataFilterBetweenValue(condition.value);
  const hasValue = range.some(
    (rangeValue) => !isEmptyDataFilterValue(rangeValue),
  );

  return hasValue && isEmptyDataFilterValue(value);
};

export const useDataFilterContext = () => {
  const context = useContext(DataFilterContext);

  if (!context) {
    throw new Error("DataFilter components must be used within DataFilter.");
  }

  return context;
};

export const DataFilterProvider: FC<DataFilterProviderProps> = ({
  children,
  filters,
  value: controlledValue,
  defaultValue,
  onChange,
}) => {
  const isControlled = typeof controlledValue !== "undefined";
  const [uncontrolledValue, setUncontrolledValue] = useState(() =>
    normalizeDataFilterValue(defaultValue),
  );
  const rawValue = isControlled ? controlledValue : uncontrolledValue;
  const value = useMemo(() => normalizeDataFilterValue(rawValue), [rawValue]);
  const [filterValues, setFilterValues] = useState<Record<string, unknown>>(
    () => hydrateDataFilterValueFilter(value.filter),
  );
  const [visibleFields, setVisibleFields] = useState(() => {
    return getActiveFields(value.filter);
  });
  const [filterGroups, setFilterGroups] = useState(() => {
    return getFilterGroups(filters, value.filter, visibleFields);
  });

  useEffect(() => {
    const hydratedValues = hydrateDataFilterValueFilter(value.filter);

    setFilterValues((currentValues) => {
      const mergedValues: Record<string, unknown> = { ...hydratedValues };

      for (const item of filters) {
        const currentValue = currentValues[item.field];

        if (
          isIncompleteBetweenValue(currentValue) &&
          isEmptyDataFilterValue(hydratedValues[item.field])
        ) {
          mergedValues[item.field] = currentValue;
        }
      }

      return mergedValues;
    });

    setVisibleFields((currentFields) => {
      return new Set([...currentFields, ...getActiveFields(hydratedValues)]);
    });
  }, [filters, value.filter]);

  useEffect(() => {
    setFilterGroups(getFilterGroups(filters, filterValues, visibleFields));
  }, [filters, filterValues, visibleFields]);

  const emitValueChange = useCallback(
    (nextValue: DataFilterValue) => {
      if (!isControlled) {
        setUncontrolledValue(nextValue);
      }

      onChange?.(nextValue);
    },
    [isControlled, onChange],
  );

  const createNextValue = useCallback(
    (nextFilterValues: Record<string, unknown>): DataFilterValue => {
      return {
        filter: serializeDataFilterValueFilter(nextFilterValues),
        ...(value.orderBy ? { orderBy: value.orderBy } : {}),
        query: value.query,
      };
    },
    [value.orderBy, value.query],
  );

  const setQuery = useCallback(
    (query: string) => {
      emitValueChange({
        ...createNextValue(filterValues),
        query,
      });
    },
    [createNextValue, emitValueChange, filterValues],
  );

  const setOrderBy = useCallback(
    (orderBy: DataFilterSortValue) => {
      emitValueChange({
        ...createNextValue(filterValues),
        orderBy,
      });
    },
    [createNextValue, emitValueChange, filterValues],
  );

  const setFilterValue = useCallback(
    (field: string, value: unknown) => {
      const nextValues = {
        ...filterValues,
        [field]: value,
      };

      setFilterValues(nextValues);
      emitValueChange(createNextValue(nextValues));
    },
    [createNextValue, emitValueChange, filterValues],
  );

  const setFilterVisible = useCallback((field: string, visible: boolean) => {
    setVisibleFields((currentFields) => {
      const nextFields = new Set(currentFields);

      if (visible) {
        nextFields.add(field);
      } else {
        nextFields.delete(field);
      }

      return nextFields;
    });
  }, []);

  const hideFilter = useCallback(
    (field: string) => {
      setFilterValues((currentValues) => {
        if (!isEmptyDataFilterValue(currentValues[field])) {
          return currentValues;
        }

        const { [field]: _removedValue, ...nextValues } = currentValues;

        return nextValues;
      });

      setFilterVisible(field, false);
    },
    [setFilterVisible],
  );

  const removeFilter = useCallback(
    (field: string) => {
      setFilterValue(field, undefined);
      hideFilter(field);
    },
    [hideFilter, setFilterValue],
  );

  const contextValue = useMemo<DataFilterContextValue>(
    () => ({
      ...filterGroups,
      value,
      filterValues,
      setQuery,
      setOrderBy,
      setFilterValue,
      setFilterVisible,
      hideFilter,
      removeFilter,
    }),
    [
      filterGroups,
      value,
      filterValues,
      setQuery,
      setOrderBy,
      setFilterValue,
      setFilterVisible,
      hideFilter,
      removeFilter,
    ],
  );

  return (
    <DataFilterContext.Provider value={contextValue}>
      {children}
    </DataFilterContext.Provider>
  );
};
