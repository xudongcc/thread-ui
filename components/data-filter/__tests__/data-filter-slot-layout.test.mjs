import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";

const read = (path) => readFileSync(path, "utf8");
const contextPath = "components/data-filter/components/data-filter-context.tsx";
const interfacesPath = "components/data-filter/interfaces";
const obsoletePropsPaths = [
  "components/data-filter/interfaces/data-filter-default-checkbox-field-props.ts",
  "components/data-filter/interfaces/data-filter-default-date-picker-field-props.ts",
  "components/data-filter/interfaces/data-filter-default-field-props.ts",
  "components/data-filter/interfaces/data-filter-default-input-field-props.ts",
  "components/data-filter/interfaces/data-filter-default-number-input-field-props.ts",
  "components/data-filter/interfaces/data-filter-default-select-field-props.ts",
  "components/data-filter/interfaces/data-filter-operator-select-props.ts",
  "components/data-filter/interfaces/data-filter-props.ts",
  "components/data-filter/interfaces/data-filter-search-props.ts",
  "components/data-filter/interfaces/data-filter-sort-props.ts",
  "components/data-filter/interfaces/data-filter-tag-item-props.ts",
  "components/data-filter/interfaces/data-filter-tag-list-props.ts",
];

const dataFilterIndex = read("components/data-filter/index.tsx");
const dataFilter = read("components/data-filter/data-filter.tsx");
const typesIndex = read("components/data-filter/types/index.ts");
const search = read("components/data-filter/components/data-filter-search.tsx");
const sort = read("components/data-filter/components/data-filter-sort.tsx");
const operatorSelect = read(
  "components/data-filter/components/data-filter-operator-select.tsx",
);
const tagList = read(
  "components/data-filter/components/data-filter-tag-list.tsx",
);
const filterContext = existsSync(contextPath) ? read(contextPath) : "";
const tagItem = read(
  "components/data-filter/components/data-filter-tag-item.tsx",
);
const defaultField = read(
  "components/data-filter/components/data-filter-default-field.tsx",
);
const defaultCheckboxField = read(
  "components/data-filter/components/data-filter-default-checkbox-field.tsx",
);
const defaultDatePickerField = read(
  "components/data-filter/components/data-filter-default-date-picker-field.tsx",
);
const defaultInputField = read(
  "components/data-filter/components/data-filter-default-input-field.tsx",
);
const defaultNumberInputField = read(
  "components/data-filter/components/data-filter-default-number-input-field.tsx",
);
const defaultSelectField = read(
  "components/data-filter/components/data-filter-default-select-field.tsx",
);
const selectProps = read(
  "components/data-filter/types/data-filter-item-select-props.ts",
);
const selectOptions = read(
  "components/data-filter/types/data-filter-select-options.ts",
);
const selectOption = read(
  "components/data-filter/types/data-filter-select-option.ts",
);
const selectOperator = read(
  "components/data-filter/types/data-filter-select-operator.ts",
);
const inOperator = read(
  "components/data-filter/types/data-filter-in-operator.ts",
);
const notInOperator = read(
  "components/data-filter/types/data-filter-not-in-operator.ts",
);
const betweenOperator = read(
  "components/data-filter/types/data-filter-between-operator.ts",
);
const numberInputOperator = read(
  "components/data-filter/types/data-filter-number-input-operator.ts",
);
const datePickerOperator = read(
  "components/data-filter/types/data-filter-date-picker-operator.ts",
);
const selectOperators = read(
  "components/data-filter/utils/data-filter-default-select-operators.ts",
);
const numberInputOperators = read(
  "components/data-filter/utils/data-filter-default-number-input-operators.ts",
);
const datePickerOperators = read(
  "components/data-filter/utils/data-filter-default-date-picker-operators.ts",
);
const allOperators = read(
  "components/data-filter/utils/data-filter-all-operators.ts",
);
const operatorLabels = read(
  "components/data-filter/utils/data-filter-operator-labels.ts",
);
const dateValue = read(
  "components/data-filter/utils/data-filter-date-value.ts",
);
const defaultRenderValue = read(
  "components/data-filter/utils/get-data-filter-default-render-value.ts",
);
const createCondition = read(
  "components/data-filter/utils/create-data-filter-condition.ts",
);
const getCondition = read(
  "components/data-filter/utils/get-data-filter-condition.ts",
);
const isEmptyDataFilterValue = read(
  "components/data-filter/utils/is-empty-data-filter-value.ts",
);
const packageJson = read("components/data-filter/package.json");
const dataFilterDocs = read("apps/docs/content/docs/form/data-filter.mdx");
const asyncSelectExample = read(
  "apps/docs/examples/data-filter-async-select.tsx",
);
const dataFilterExample = read("apps/docs/examples/data-filter.tsx");

assert.ok(dataFilter.includes('data-slot="data-filter"'));
assert.ok(
  dataFilter.includes(
    "has-[>[data-slot=data-filter-sort]]:grid-cols-[minmax(0,1fr)_auto]",
  ),
);
assert.ok(dataFilter.includes("*:data-[slot=data-filter-search]:min-w-0"));
assert.ok(
  dataFilter.includes("*:data-[slot=data-filter-sort]:justify-self-end"),
);
assert.ok(
  dataFilter.includes("*:data-[slot=data-filter-tag-list]:col-span-full"),
);
assert.ok(dataFilter.includes("export interface DataFilterProps"));
assert.ok(dataFilterIndex.includes("DataFilterProps"));
assert.ok(dataFilterIndex.includes("DataFilterSearchProps"));
assert.ok(dataFilterIndex.includes("DataFilterSortProps"));
assert.ok(!dataFilterIndex.includes("./interfaces"));
assert.ok(
  !existsSync(interfacesPath),
  `${interfacesPath} was merged into types`,
);
for (const obsoletePropsPath of obsoletePropsPaths) {
  assert.ok(!existsSync(obsoletePropsPath), `${obsoletePropsPath} was removed`);
}
assert.ok(typesIndex.includes("./data-filter-item-base-props"));
assert.ok(typesIndex.includes("./data-filter-item-props"));
assert.ok(typesIndex.includes("./data-filter-render-context"));
assert.ok(typesIndex.includes("./data-filter-select-options"));
assert.ok(typesIndex.includes("./data-filter-sort-options"));
assert.ok(typesIndex.includes("./data-filter-sort-value"));
assert.ok(typesIndex.includes("./data-filter-value"));
assert.ok(!typesIndex.includes("./data-filter-values"));

assert.ok(search.includes('data-slot="data-filter-search"'));
assert.ok(search.includes("export interface DataFilterSearchProps"));
assert.ok(search.includes("placeholder?: string;"));
assert.ok(!search.includes("disabled?:"));
assert.ok(!search.includes("className?:"));
assert.ok(sort.includes('data-slot="data-filter-sort"'));
assert.ok(sort.includes("export interface DataFilterSortProps"));
assert.ok(sort.includes("interface DataFilterSortViewProps"));
assert.ok(sort.includes("getDataFilterSortOptionByKey"));
assert.ok(sort.includes('className="w-64 p-0"'));
assert.ok(operatorSelect.includes("interface DataFilterOperatorSelectProps"));
assert.ok(
  !operatorSelect.includes("export interface DataFilterOperatorSelectProps"),
);
assert.ok(
  operatorSelect.includes(
    '<DropdownMenuContent align="start" className="w-64">',
  ),
);
assert.ok(tagList.includes('data-slot="data-filter-tag-list"'));
assert.ok(existsSync(contextPath));
assert.ok(filterContext.includes("createContext"));
assert.ok(filterContext.includes("DataFilterProvider"));
assert.ok(filterContext.includes("useDataFilterContext"));
assert.ok(filterContext.includes("normalizeDataFilterValue"));
assert.ok(filterContext.includes("serializeDataFilterValueFilter"));
assert.ok(dataFilter.includes("<DataFilterProvider"));
assert.ok(!tagList.includes("<DataFilterProvider"));
assert.ok(!tagList.includes("DataFilterConnectedTagItem"));
assert.ok(tagList.includes('import { Button } from "@/components/ui/button";'));
assert.ok(
  tagList.includes('<Button size="xs" type="button" variant="secondary">'),
);
assert.ok(tagList.includes('<DropdownMenuContent className="w-64">'));
assert.ok(
  tagItem.includes('className="grid w-fit max-w-64 min-w-48 gap-1 p-1"'),
);
assert.ok(tagItem.includes("interface DataFilterTagItemProps"));
assert.ok(tagItem.includes("useDataFilterContext"));
assert.ok(tagItem.includes("item: DataFilterItemProps;"));
assert.ok(!tagItem.includes("value: unknown;"));
assert.ok(!tagItem.includes("onEmptyClose"));
assert.ok(!tagItem.includes("min-w-56"));
assert.ok(tagItem.includes('data-slot="data-filter-tag-item-header"'));
assert.ok(tagItem.includes("const shouldRenderContent = rawValue !== null;"));
assert.ok(tagItem.includes("{shouldRenderContent && ("));
assert.ok(tagItem.includes('data-slot="data-filter-tag-item-content"'));
assert.ok(!tagItem.includes('data-slot="data-filter-tag-item-footer"'));
assert.ok(tagItem.includes('from "@/components/ui/tooltip"'));
assert.ok(tagItem.includes("<TooltipProvider>"));
assert.ok(tagItem.includes("<Tooltip>"));
assert.ok(tagItem.includes("<TooltipTrigger"));
assert.ok(tagItem.includes("<TooltipContent"));
assert.ok(tagItem.includes('className="max-w-72 min-w-0"'));
assert.ok(tagItem.includes('className="truncate"'));
assert.ok(tagItem.includes("{labelValue}</TooltipContent>"));

assert.ok(defaultField.includes("<DataFilterDefaultNumberInputField"));
assert.ok(defaultField.includes("interface DataFilterDefaultFieldProps"));
assert.ok(defaultField.includes("<DataFilterDefaultDatePickerField"));
assert.ok(defaultField.includes("<DataFilterDefaultCheckboxField"));
assert.ok(
  !defaultField.includes(
    "<DataFilterDefaultCheckboxField\n        item={item}",
  ),
);
assert.ok(defaultField.includes("<DataFilterDefaultSelectField"));
assert.ok(defaultField.includes("<DataFilterDefaultInputField"));
assert.ok(!defaultField.includes('from "@/components/ui/input"'));
assert.ok(!defaultField.includes('from "@/components/ui/calendar"'));
assert.ok(!defaultField.includes('from "@/components/thread-ui/number-input"'));
assert.ok(!defaultField.includes("CheckIcon"));
assert.ok(!defaultField.includes("dayjs"));
assert.ok(
  defaultCheckboxField.includes(
    "relative flex w-full cursor-default items-center gap-2 rounded-sm py-1.5 pr-8 pl-2 text-sm outline-hidden select-none",
  ),
);
assert.ok(
  defaultCheckboxField.includes(
    "interface DataFilterDefaultCheckboxFieldProps",
  ),
);
assert.ok(!defaultCheckboxField.includes("DataFilterItemCheckboxProps"));
assert.ok(!defaultCheckboxField.includes("item:"));
assert.ok(!defaultCheckboxField.includes("value: unknown;"));
assert.ok(
  defaultCheckboxField.includes(
    "pointer-events-none absolute right-2 flex size-4 items-center justify-center",
  ),
);
assert.ok(
  !defaultCheckboxField.includes(
    'selected && "bg-accent text-accent-foreground"',
  ),
);
assert.ok(
  !defaultField.includes(
    'import { Select } from "@/components/thread-ui/select";',
  ),
);
assert.ok(
  !defaultField.includes(
    'import { DatePicker } from "@/components/thread-ui/date-picker";',
  ),
);
assert.ok(
  defaultDatePickerField.includes(
    'import { Calendar } from "@/components/ui/calendar";',
  ),
);
assert.ok(defaultDatePickerField.includes("<Calendar"));
assert.ok(
  defaultDatePickerField.includes(
    "interface DataFilterDefaultDatePickerFieldProps",
  ),
);
assert.ok(!defaultDatePickerField.includes("value: unknown;"));
assert.ok(defaultDatePickerField.includes('mode="single"'));
assert.ok(defaultDatePickerField.includes('operator === "$between"'));
assert.ok(defaultDatePickerField.includes('mode="range"'));
assert.ok(defaultDatePickerField.includes("selected={selectedRange}"));
assert.ok(defaultDatePickerField.includes("selected={selected}"));
assert.ok(defaultDatePickerField.includes("defaultMonth={selected}"));
assert.ok(defaultDatePickerField.includes("disabled={disabled}"));
assert.ok(defaultNumberInputField.includes("<NumberInput"));
assert.ok(
  defaultNumberInputField.includes(
    "interface DataFilterDefaultNumberInputFieldProps",
  ),
);
assert.ok(!defaultNumberInputField.includes("value: unknown;"));
assert.ok(defaultNumberInputField.includes('operator === "$between"'));
assert.ok(defaultNumberInputField.includes("const [min, max]"));
assert.ok(defaultNumberInputField.includes("onChange([nextMin, max])"));
assert.ok(defaultNumberInputField.includes("onChange([min, nextMax])"));
assert.ok(defaultInputField.includes("<Input"));
assert.ok(
  defaultInputField.includes("interface DataFilterDefaultInputFieldProps"),
);
assert.ok(!defaultInputField.includes("value: unknown;"));
assert.ok(defaultField.includes('item.type === "select"'));
assert.ok(defaultSelectField.includes('from "@/components/ui/combobox"'));
assert.ok(
  defaultSelectField.includes("interface DataFilterDefaultSelectFieldProps"),
);
assert.ok(!defaultSelectField.includes("value: unknown;"));
assert.ok(defaultSelectField.includes("<Combobox"));
assert.ok(defaultSelectField.includes("<ComboboxChips"));
assert.ok(!defaultSelectField.includes("min-h-20"));
assert.ok(defaultSelectField.includes("<ComboboxChipsInput"));
assert.ok(defaultSelectField.includes("<ComboboxList"));
assert.ok(defaultSelectField.includes("<ComboboxItem"));
assert.ok(
  defaultSelectField.includes(
    'className="hover:bg-accent hover:text-accent-foreground"',
  ),
);
assert.ok(defaultSelectField.includes("placeholder={item.placeholder}"));
assert.ok(!defaultField.includes("placeholder ??"));
assert.ok(!defaultField.includes("Filter by ${item.label}"));
assert.ok(!defaultInputField.includes("placeholder ??"));
assert.ok(!defaultNumberInputField.includes("placeholder ??"));
assert.ok(!defaultSelectField.includes("<ComboboxContent"));
assert.ok(defaultSelectField.includes("multiple"));
assert.ok(!defaultSelectField.includes("option?.icon"));
assert.ok(defaultSelectField.includes('typeof item.options === "function"'));
assert.ok(defaultSelectField.includes("useEffect"));
assert.ok(defaultSelectField.includes("requestId"));
assert.ok(defaultSelectField.includes("debouncedSearchQuery"));
assert.ok(defaultSelectField.includes("setLoading"));
assert.ok(defaultSelectField.includes("Failed to load options"));
assert.ok(defaultSelectField.includes("onInputValueChange={setSearchQuery}"));
assert.ok(
  defaultSelectField.includes("filter={isRemoteOptions ? null : undefined}"),
);

assert.ok(selectProps.includes('type: "select";'));
assert.ok(selectProps.includes("Array<string> | null"));
assert.ok(selectProps.includes("options: DataFilterSelectOptions;"));
assert.ok(
  selectProps.includes(
    "resolveSelectedOptions?: DataFilterResolveSelectedOptions;",
  ),
);
assert.ok(selectProps.includes("DataFilterSelectOptions"));
assert.ok(selectProps.includes("DataFilterResolveSelectedOptions"));
assert.ok(
  selectOptions.includes(
    "(query: string) => Promise<Array<DataFilterSelectOption>>",
  ),
);
assert.ok(
  selectOptions.includes("export type DataFilterResolveSelectedOptions"),
);
assert.ok(selectOptions.includes("values: Array<string>"));
assert.ok(selectOption.includes("label: string;"));
assert.ok(selectOption.includes("value: string;"));
assert.ok(!selectOption.includes("icon"));
assert.ok(inOperator.includes('"$in"'));
assert.ok(notInOperator.includes('"$nin"'));
assert.ok(betweenOperator.includes('"$between"'));
assert.ok(numberInputOperator.includes("DataFilterBetweenOperator"));
assert.ok(datePickerOperator.includes("DataFilterBetweenOperator"));
assert.ok(selectOperator.includes("DataFilterInOperator"));
assert.ok(selectOperator.includes("DataFilterNotInOperator"));
assert.ok(selectOperators.includes('["$in", "$nin"]'));
assert.ok(numberInputOperators.includes('"$between"'));
assert.ok(datePickerOperators.includes('"$between"'));
assert.ok(allOperators.includes('"$in"'));
assert.ok(allOperators.includes('"$nin"'));
assert.ok(allOperators.includes('"$between"'));
assert.ok(operatorLabels.includes('$in: "contains"'));
assert.ok(operatorLabels.includes('$nin: "does not contain"'));
assert.ok(operatorLabels.includes('$between: "between"'));
assert.ok(dateValue.includes("getDataFilterDateRangeValue"));
assert.ok(dateValue.includes("toISOString"));
assert.ok(defaultRenderValue.includes("getDataFilterDefaultRenderValue"));
assert.ok(defaultRenderValue.includes("formatDataFilterDateValue"));
assert.ok(createCondition.includes('operator === "$between"'));
assert.ok(createCondition.includes("$between: range"));
assert.ok(getCondition.includes('$between"'));
assert.ok(getCondition.includes('"$between" in record'));
assert.ok(getCondition.includes('"$gte" in record && "$lte" in record'));
assert.ok(isEmptyDataFilterValue.includes('operator === "$between"'));
assert.ok(isEmptyDataFilterValue.includes("getDataFilterBetweenValue"));
assert.ok(tagItem.includes("getDataFilterDefaultRenderValue"));
assert.ok(tagItem.includes("isEmptyDataFilterValue(fieldValue)"));
assert.ok(!packageJson.includes('"@repo/date-picker": "workspace:*"'));
assert.ok(!packageJson.includes('"@repo/select": "workspace:*"'));
assert.ok(
  dataFilterExample.includes(
    'className="max-h-full w-full space-y-4 overflow-y-auto rounded-lg border p-4"',
  ),
);
assert.ok(dataFilterDocs.includes("### DataFilterItemSelectProps"));
assert.ok(dataFilterDocs.includes("### DataFilterValue"));
assert.ok(dataFilterDocs.includes("### Async Select Options"));
assert.ok(
  dataFilterDocs.includes('<Preview path="data-filter-async-select" />'),
);
assert.ok(asyncSelectExample.includes("options: loadTagOptions"));
assert.ok(
  asyncSelectExample.includes(
    "resolveSelectedOptions: resolveSelectedTagOptions",
  ),
);
assert.ok(asyncSelectExample.includes("Promise"));
assert.ok(asyncSelectExample.includes("setTimeout"));
assert.ok(
  dataFilterDocs.includes(
    "async `(query) => Promise<DataFilterSelectOption[]>` function",
  ),
);
assert.ok(dataFilterDocs.includes("`resolveSelectedOptions`"));
assert.ok(
  dataFilterDocs.includes(
    'path="../../components/data-filter/data-filter.tsx"',
  ),
);
assert.ok(
  dataFilterDocs.includes(
    'path="../../components/data-filter/components/data-filter-search.tsx"',
  ),
);
assert.ok(
  dataFilterDocs.includes(
    'path="../../components/data-filter/components/data-filter-sort.tsx"',
  ),
);
assert.ok(!dataFilterDocs.includes("interfaces/data-filter-props.ts"));
assert.ok(!dataFilterDocs.includes("interfaces/data-filter-search-props.ts"));
assert.ok(!dataFilterDocs.includes("interfaces/data-filter-sort-props.ts"));
assert.ok(!dataFilterDocs.includes("components/data-filter/interfaces/"));
assert.ok(!dataFilterDocs.includes("'icon'"));
assert.ok(!dataFilterDocs.includes("'values'"));
assert.ok(
  dataFilterDocs.includes(
    'path="../../components/data-filter/types/data-filter-item-base-props.ts"',
  ),
);
assert.ok(
  dataFilterDocs.includes(
    'path="../../components/data-filter/types/data-filter-sort-options.ts"',
  ),
);
assert.ok(!dataFilterExample.includes("TagIcon"));
assert.ok(!dataFilterExample.includes("icon:"));
assert.ok(dataFilterExample.includes('field: "age"'));
assert.ok(dataFilterExample.includes('defaultOperator: "$between"'));
assert.ok(dataFilterExample.includes('field: "createdAt"'));
assert.ok(dataFilterExample.includes('"2025-03-01T00:00:00.000Z"'));
assert.ok(dataFilterExample.includes('"2025-03-15T00:00:00.000Z"'));
assert.ok(dataFilterExample.includes("$between: [18, 30]"));
