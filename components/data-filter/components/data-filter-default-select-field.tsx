import { Combobox as ComboboxPrimitive } from "@base-ui/react/combobox";
import { Loader2Icon, XIcon } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

import { useDataFilterContext } from "./data-filter-context";
import type { FC } from "react";
import type {
  DataFilterItemSelectProps,
  DataFilterSelectOption,
} from "../types";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxItem,
  ComboboxList,
  ComboboxValue,
} from "@/components/ui/combobox";

type DataFilterDefaultSelectFieldValue = Array<string> | string | undefined;
type DataFilterDefaultSelectFieldChangeValue = Array<string> | undefined;

interface DataFilterDefaultSelectFieldProps {
  item: DataFilterItemSelectProps;
  value: DataFilterDefaultSelectFieldValue;
  onChange: (value: DataFilterDefaultSelectFieldChangeValue) => void;
}

const emptyOptionCache: Record<string, DataFilterSelectOption> = {};

export const DataFilterDefaultSelectField: FC<
  DataFilterDefaultSelectFieldProps
> = ({ item, value, onChange }) => {
  const { t } = useTranslation("thread-ui");
  const { cacheSelectOptions, selectOptionCache } = useDataFilterContext();
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [remoteOptions, setRemoteOptions] = useState<
    Array<DataFilterSelectOption>
  >([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const latestRequestId = useRef(0);
  const isRemoteOptions = typeof item.options === "function";
  const options = Array.isArray(item.options) ? item.options : remoteOptions;
  const fieldOptionCache = selectOptionCache[item.field] ?? emptyOptionCache;
  const selectedValues = useMemo(() => {
    return Array.isArray(value)
      ? value
      : typeof value === "string"
        ? [value]
        : [];
  }, [value]);
  const cacheOptions = useCallback(
    (nextOptions: Array<DataFilterSelectOption>) => {
      cacheSelectOptions(item.field, nextOptions);
    },
    [cacheSelectOptions, item.field],
  );
  const getOption = useCallback(
    (optionValue: string) => {
      return (
        options.find((option) => option.value === optionValue) ??
        fieldOptionCache[optionValue]
      );
    },
    [fieldOptionCache, options],
  );

  useEffect(() => {
    if (isRemoteOptions) {
      return;
    }

    cacheOptions(options);
  }, [cacheOptions, isRemoteOptions, options]);

  useEffect(() => {
    if (!isRemoteOptions) {
      return;
    }

    const timeout = window.setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 250);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [isRemoteOptions, searchQuery]);

  useEffect(() => {
    if (typeof item.options !== "function") {
      return;
    }

    const loadOptions = item.options;
    const requestId = latestRequestId.current + 1;
    let cancelled = false;

    latestRequestId.current = requestId;
    queueMicrotask(() => {
      if (!cancelled && latestRequestId.current === requestId) {
        setLoading(true);
        setError(false);
      }
    });

    void loadOptions(debouncedSearchQuery)
      .then((nextOptions) => {
        if (!cancelled && latestRequestId.current === requestId) {
          setRemoteOptions(nextOptions);
          cacheOptions(nextOptions);
          setError(false);
        }
      })
      .catch(() => {
        if (!cancelled && latestRequestId.current === requestId) {
          setRemoteOptions([]);
          setError(true);
        }
      })
      .finally(() => {
        if (!cancelled && latestRequestId.current === requestId) {
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [cacheOptions, debouncedSearchQuery, item.options]);

  const optionValues = options.map((option) => option.value);
  const items = Array.from(new Set([...optionValues, ...selectedValues]));

  return (
    <Combobox
      multiple
      filter={isRemoteOptions ? null : undefined}
      items={items}
      value={selectedValues}
      itemToStringValue={(optionValue) => {
        return getOption(optionValue)?.label ?? optionValue;
      }}
      onInputValueChange={setSearchQuery}
      onValueChange={(nextValues) => {
        cacheOptions(options);
        onChange(nextValues.length > 0 ? nextValues : undefined);
      }}
    >
      <div className="grid gap-1">
        <ComboboxChips className="mx-2 items-start">
          <ComboboxValue>
            {selectedValues.map((optionValue) => {
              const option = getOption(optionValue);

              return (
                <ComboboxPrimitive.Chip
                  key={optionValue}
                  className="bg-muted-foreground/10 text-foreground flex h-[calc(--spacing(5.5))] w-fit items-center justify-center gap-1 rounded-4xl py-0 pr-0 pl-2 text-xs font-medium whitespace-nowrap has-disabled:pointer-events-none has-disabled:cursor-not-allowed has-disabled:opacity-50"
                  data-slot="combobox-chip"
                >
                  {option?.label ?? optionValue}
                  <ComboboxPrimitive.ChipRemove
                    className="-ml-1 opacity-50 hover:opacity-100"
                    data-slot="combobox-chip-remove"
                    render={<Button size="icon-xs" variant="ghost" />}
                    aria-label={t("dataFilter.removeOption", {
                      defaultValue: "Remove {{label}}",
                      label: option?.label ?? optionValue,
                    })}
                  >
                    <XIcon className="pointer-events-none" />
                  </ComboboxPrimitive.ChipRemove>
                </ComboboxPrimitive.Chip>
              );
            })}
          </ComboboxValue>
          <ComboboxChipsInput placeholder={item.placeholder} />
        </ComboboxChips>

        <ComboboxList className="max-h-72">
          {(optionValue) => {
            const option = getOption(optionValue);

            return (
              <ComboboxItem
                key={optionValue}
                className="hover:bg-accent hover:text-accent-foreground"
                value={optionValue}
              >
                {option?.label ?? optionValue}
              </ComboboxItem>
            );
          }}
        </ComboboxList>

        {loading && (
          <div
            className="text-muted-foreground flex items-center justify-center gap-2 px-2 py-2 text-sm"
            role="status"
          >
            <Loader2Icon aria-hidden="true" className="size-4 animate-spin" />
            {t("dataFilter.loading", "Loading")}
          </div>
        )}

        {!loading && options.length === 0 && (
          <div className="text-muted-foreground px-2 py-2 text-center text-sm">
            {error
              ? t("dataFilter.loadFailed", "Failed to load options")
              : t("dataFilter.noOptions", "No options found")}
          </div>
        )}
      </div>
    </Combobox>
  );
};
