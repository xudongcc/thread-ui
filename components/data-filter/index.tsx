/* eslint-disable @typescript-eslint/no-explicit-any */

import dayjs from "dayjs";
import { forEach, isPlainObject, omitBy, transform } from "lodash";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  ChevronDown,
  Plus,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm, useStore } from "@tanstack/react-form";
import type { ReactElement, ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { RadioGroup } from "@/components/thread-ui/radio-group";
import { Separator } from "@/components/ui/separator";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";

const isEmpty = (value: unknown): boolean => {
  return (
    typeof value === "undefined" ||
    value === "" ||
    (value instanceof Array && value.length === 0)
  );
};

const omitEmpty = (obj: DataFilterValues): DataFilterValues =>
  omitBy(obj, isEmpty);

const formatRenderValue = (obj: DataFilterValues): DataFilterValues => {
  return transform<DataFilterValues, DataFilterValues>(
    obj,
    (result, value, key) => {
      if (isPlainObject(value) || Array.isArray(value)) {
        forEach(formatRenderValue(value), (flattenedValue, flattenedKey) => {
          if (Array.isArray(value)) {
            if (typeof result[key] === "undefined") {
              result[key] = [];
            }
          } else {
            if (typeof result[key] === "undefined") {
              result[key] = {};
            }
          }

          result[key][flattenedKey] =
            flattenedValue instanceof Date
              ? dayjs(flattenedValue).format("YYYY-MM-DD")
              : flattenedValue;
        });
      } else {
        result[key] =
          value instanceof Date ? dayjs(value).format("YYYY-MM-DD") : value;
      }
    },
    {},
  );
};

const flattenObject = (obj: DataFilterValues): DataFilterValues => {
  return transform<DataFilterValues, DataFilterValues>(
    obj,
    (result, value, key) => {
      if (isPlainObject(value)) {
        const nested = flattenObject(value);
        forEach(nested, (nestedValue, nestedKey) => {
          result[`${key}.${nestedKey}`] = nestedValue;
        });
      } else {
        result[key] = value;
      }
    },
    {},
  );
};

export interface DataFilterItemProps {
  label: string;
  field: string;
  icon?: ReactNode;
  render: ({
    field: { value, onChange },
  }: {
    field: {
      value: any;
      onChange: (value: any) => void;
    };
  }) => ReactElement;
  renderValue?: (options: {
    label: string;
    field: string;
    value: any;
  }) => ReactNode;
  pinned?: boolean;
}

export interface DataFilterSearchConfig {
  value?: string;
  /** Content rendered before the search input. */
  leading?: ReactNode;
  /** Content rendered after the search input. */
  trailing?: ReactNode;
  suffix?: ReactNode;
  prefix?: ReactNode;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  onChange?: (value: string) => void;
}

export interface DataFilterI18n {
  addFilter?: string;
}

export type DataFilterValues = Record<string, any>;

export interface DataFilterRenderers {
  addFilter?: () => ReactNode;
  filterItem?: (props: {
    label: string;
    field: string;
    icon?: ReactNode;
    value: string | undefined;
    remove: () => void;
  }) => ReactNode;
}

export interface DataFilterSortValue {
  field: string;
  direction: "ASC" | "DESC";
}

export interface DataFilterSortOptions extends DataFilterSortValue {
  fieldLabel: string;
  directionLabel: string;
  disabled?: boolean;
}

export interface DataFilterSortConfig {
  options: Array<DataFilterSortOptions>;
  selected?: DataFilterSortValue;
  onChange?: (selected: DataFilterSortValue) => void;
}

export interface DataFilterProps {
  className?: string;
  loading?: boolean;
  filters: Array<DataFilterItemProps>;
  search?: false | DataFilterSearchConfig;
  sort?: DataFilterSortConfig;
  values?: DataFilterValues;
  renderers?: DataFilterRenderers;
  i18n?: DataFilterI18n;
  onChange?: (values: DataFilterValues) => void;
}

function SortButton({ config }: { config: DataFilterSortConfig }) {
  const [open, setOpen] = useState(false);

  const selectedKey = config.selected?.field ?? "";
  const selectedDirection = config.selected?.direction ?? "DESC";
  const selectedValue = `${selectedKey}:${selectedDirection}`;

  const fieldChoices = useMemo(() => {
    const seen = new Map<string, DataFilterSortOptions>();
    for (const option of config.options) {
      if (
        !seen.has(option.fieldLabel) ||
        option.direction === selectedDirection
      ) {
        seen.set(option.fieldLabel, option);
      }
    }
    return Array.from(seen.values());
  }, [config.options, selectedDirection]);

  const directionChoices = useMemo(() => {
    return config.options.filter((option) => option.field === selectedKey);
  }, [config.options, selectedKey]);

  const handleFieldChange = (value: string) => {
    const [field, direction] = value.split(":");
    config.onChange?.({ field, direction: direction as "ASC" | "DESC" });
  };

  const handleDirectionChange = (direction: "ASC" | "DESC") => {
    const match = config.options.find(
      (o) => o.field === selectedKey && o.direction === direction,
    );
    if (match) {
      config.onChange?.({ field: selectedKey, direction });
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button className="shrink-0" size="icon" variant="outline">
            <ArrowUpDown className="size-4" />
          </Button>
        }
      />
      <PopoverContent align="end" className="w-52 p-0">
        <div>
          <div className="p-3 pb-2">
            <RadioGroup
              value={selectedValue}
              items={fieldChoices.map((option) => ({
                label: option.fieldLabel,
                value: `${option.field}:${option.direction}`,
                disabled: option.disabled,
              }))}
              onValueChange={(val) => handleFieldChange(val)}
            />
          </div>

          {directionChoices.length > 0 && (
            <>
              <Separator />
              <div className="p-1">
                {directionChoices.map((option) => {
                  const isActive = option.direction === selectedDirection;
                  return (
                    <button
                      key={`${option.field}:${option.direction}`}
                      type="button"
                      className={cn(
                        "flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm transition-colors",
                        isActive
                          ? "bg-accent text-accent-foreground"
                          : "hover:bg-accent/50 text-muted-foreground",
                      )}
                      onClick={() => handleDirectionChange(option.direction)}
                    >
                      {option.direction === "ASC" ? (
                        <ArrowUp className="size-3.5" />
                      ) : (
                        <ArrowDown className="size-3.5" />
                      )}
                      {option.directionLabel}
                    </button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

export function DataFilter({
  className,
  loading = false,
  filters,
  search,
  sort,
  values,
  i18n,
  renderers,
  onChange,
}: DataFilterProps): ReactElement {
  const form = useForm({
    defaultValues: {
      query:
        search && "value" in search && typeof search.value === "string"
          ? search.value
          : "",
      filter: values || {},
    },
  });

  const watchFilter = useStore(form.store, (state) => state.values.filter);

  const [{ fixedFilters, unfixedFilters }, setFilterGroups] = useState(() => {
    return {
      fixedFilters: filters.filter(
        (item) => item.pinned || (values && !isEmpty(values[item.field])),
      ),
      unfixedFilters: filters.filter(
        (item) =>
          item.pinned !== true && !(values && !isEmpty(values[item.field])),
      ),
    };
  });

  const [prevValues, setPrevValues] = useState(values);

  // Keep newly controlled values visible without waiting for an effect pass.
  if (values !== prevValues) {
    setPrevValues(values);
    let changed = false;
    const newFixedFilters = [...fixedFilters];
    const newUnfixedFilters = [];

    for (const item of unfixedFilters) {
      if (!isEmpty(values?.[item.field])) {
        newFixedFilters.push(item);
        changed = true;
      } else {
        newUnfixedFilters.push(item);
      }
    }

    if (changed) {
      setFilterGroups({
        fixedFilters: newFixedFilters,
        unfixedFilters: newUnfixedFilters,
      });
    }
  }

  const handleFiltersChange = useCallback(() => {
    onChange?.(omitEmpty(flattenObject(form.state.values.filter)));
  }, [onChange, form]);

  const setFilterFieldPinnedStatus = useCallback(
    (field: string, pinned: boolean) => {
      setFilterGroups((prev) => {
        return {
          ...prev,
          fixedFilters: pinned
            ? [
                ...prev.fixedFilters,
                ...prev.unfixedFilters
                  .filter((item) => item.field === field)
                  .map((item) => ({ ...item, pinned })),
              ]
            : prev.fixedFilters.filter((item) => item.field !== field),
          unfixedFilters: pinned
            ? prev.unfixedFilters.filter((item) => item.field !== field)
            : [
                ...prev.unfixedFilters,
                ...prev.fixedFilters
                  .filter((item) => item.field === field)
                  .map((item) => ({ ...item, pinned })),
              ],
        };
      });
    },
    [],
  );

  useEffect(() => {
    form.setFieldValue("filter", values || {});
  }, [values, form]);

  useEffect(() => {
    if (search && "value" in search && typeof search.value === "string") {
      form.setFieldValue("query", search.value);
    }
  }, [search, form]);

  return (
    <div className={cn("space-y-3", className)}>
      {typeof search !== "undefined" && search !== false && (
        <div className="flex items-center gap-2">
          {search?.leading}

          <form.Field name="query">
            {({ state: { value }, handleChange, handleBlur }) => (
              <InputGroup className={search?.className}>
                <InputGroupInput
                  disabled={search?.disabled}
                  placeholder={search?.placeholder}
                  value={value as string}
                  onBlur={handleBlur}
                  onChange={(e) => {
                    handleChange(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();

                      search?.onChange?.(value as string);
                    }
                  }}
                />
                <InputGroupAddon>
                  {search?.prefix ?? <Search />}
                </InputGroupAddon>
                <InputGroupAddon align="inline-end">
                  {loading ? <Spinner /> : search?.suffix}
                </InputGroupAddon>
              </InputGroup>
            )}
          </form.Field>

          {sort && sort.options.length > 0 && <SortButton config={sort} />}

          {search?.trailing}
        </div>
      )}

      {filters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {fixedFilters.map(({ field, label, icon, render, renderValue }) => {
            const originalFilter = filters.find((item) => item.field === field);
            const fieldValue = watchFilter[field];

            const getValue = (): string | undefined => {
              if (isEmpty(fieldValue)) {
                return undefined;
              } else {
                return String(
                  typeof renderValue !== "undefined"
                    ? renderValue({
                        field,
                        label,
                        value: formatRenderValue({
                          [field]: fieldValue,
                        })[field],
                      })
                    : formatRenderValue({
                        [field]: fieldValue,
                      })[field],
                );
              }
            };

            const remove = () => {
              form.setFieldValue(`filter.${field}`, undefined);

              if (originalFilter?.pinned !== true) {
                setFilterFieldPinnedStatus(field, false);
              }

              handleFiltersChange();
            };

            const value = getValue();

            return (
              <Popover
                key={field}
                modal={true}
                defaultOpen={
                  originalFilter?.pinned !== true && isEmpty(fieldValue)
                }
                onOpenChange={(open) => {
                  // Remove unpinned empty filters when their popover closes.
                  if (
                    !open &&
                    typeof fieldValue === "undefined" &&
                    originalFilter?.pinned !== true
                  ) {
                    setFilterFieldPinnedStatus(field, false);
                  }
                }}
              >
                <PopoverTrigger
                  className="whitespace-normal"
                  nativeButton={false}
                  render={
                    (typeof renderers?.filterItem !== "undefined" ? (
                      renderers?.filterItem({
                        label,
                        icon,
                        field,
                        value,
                        remove,
                      })
                    ) : (
                      <Badge
                        className="hover:bg-accent rounded-full px-2 py-3 text-xs"
                        variant="outline"
                      >
                        <div className="flex items-center gap-1">
                          <span>
                            {value ? `${label}: ${value}` : `${label}`}{" "}
                          </span>

                          {!value && <ChevronDown className="size-4" />}

                          {value && (
                            <X
                              className="size-4 shrink-0 cursor-pointer"
                              onClick={(event) => {
                                event.stopPropagation();
                                remove();
                              }}
                            />
                          )}
                        </div>
                      </Badge>
                    )) as ReactElement
                  }
                />

                <PopoverContent className="w-fit">
                  <form.Field name={`filter.${field}`}>
                    {({ state: { value }, handleChange: onChange }) =>
                      render({
                        field: {
                          value,
                          onChange: (value) => {
                            onChange(value);
                            handleFiltersChange();
                          },
                        },
                      })
                    }
                  </form.Field>
                </PopoverContent>
              </Popover>
            );
          })}

          {unfixedFilters.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger
                nativeButton={false}
                render={
                  (typeof renderers?.addFilter !== "undefined" ? (
                    renderers?.addFilter()
                  ) : (
                    <Badge
                      className="hover:bg-accent rounded-full px-2 py-3 text-xs"
                      variant="outline"
                    >
                      <div className="flex items-center gap-1">
                        <span>{i18n?.addFilter ?? "Add Filter"}</span>
                        <Plus className="size-4 shrink-0" />
                      </div>
                    </Badge>
                  )) as ReactElement
                }
              />

              <DropdownMenuContent>
                {unfixedFilters.map(({ field, label }) => {
                  return (
                    <DropdownMenuItem
                      key={field}
                      onClick={() => {
                        setFilterFieldPinnedStatus(field, true);
                      }}
                    >
                      <div className="w-full text-center text-xs font-semibold">
                        {label}
                      </div>
                    </DropdownMenuItem>
                  );
                })}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      )}
    </div>
  );
}
