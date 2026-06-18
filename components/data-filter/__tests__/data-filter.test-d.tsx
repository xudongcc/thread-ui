import { DataFilter } from "../index";
import {
  DataFilterDefaultCheckboxField,
  DataFilterDefaultDatePickerField,
  DataFilterDefaultInputField,
  DataFilterDefaultNumberInputField,
  DataFilterDefaultSelectField,
  DataFilterTagItem,
} from "../components";
import type {
  DataFilterDatePickerBetweenValue,
  DataFilterDatePickerOperator,
  DataFilterItemBaseProps,
  DataFilterItemCheckboxProps,
  DataFilterItemDatePickerProps,
  DataFilterItemInputProps,
  DataFilterItemNumberInputProps,
  DataFilterItemProps,
  DataFilterItemSelectProps,
  DataFilterNumberInputBetweenValue,
  DataFilterNumberInputOperator,
  DataFilterOperator,
  DataFilterProps,
  DataFilterSearchProps,
  DataFilterSelectOperator,
  DataFilterSelectOption,
  DataFilterSortProps,
  DataFilterSortValue,
  DataFilterValue,
} from "../index";

const filters: DataFilterItemProps[] = [
  {
    field: "status",
    label: "Status",
    type: "input",
    defaultOperator: "$fulltext",
    operators: ["$eq", "$ne", "$fulltext"],
    render: ({ field: { value, onChange }, operator }) => {
      const selectedOperator: DataFilterOperator | undefined = operator;
      const selectedValue: string | null | undefined = value;

      return (
        <input
          data-operator={selectedOperator}
          data-value={String(selectedValue)}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
        />
      );
    },
    renderValue: ({ value }) => String(value),
  },
  {
    field: "amount",
    label: "Amount",
    type: "number-input",
    min: 0,
    max: 1000,
    decimalScale: 2,
    defaultOperator: "$gte",
    operators: ["$eq", "$gte", "$lte"],
    step: 0.01,
  },
  {
    field: "createdAt",
    label: "Created At",
    type: "date-picker",
    defaultOperator: "$lt",
    min: new Date("2024-01-01"),
    max: new Date("2024-12-31"),
  },
  {
    field: "verified",
    label: "Verified",
    type: "checkbox",
    defaultOperator: "$eq",
    operators: ["$eq", "$ne"],
  },
  {
    defaultOperator: "$in",
    field: "priority",
    label: "Priority",
    operators: ["$in", "$nin"],
    options: [
      { label: "Low", value: "low" },
      { label: "Medium", value: "medium" },
      { label: "High", value: "high" },
    ],
    type: "select",
  },
];

const checkboxFilter: DataFilterItemCheckboxProps = {
  defaultOperator: "$eq",
  field: "published",
  label: "Published",
  operators: ["$eq", "$ne"],
  type: "checkbox",
};

const selectOperator: DataFilterSelectOperator = "$in";
const notInSelectOperator: DataFilterSelectOperator = "$nin";
const betweenNumberInputOperator: DataFilterNumberInputOperator = "$between";
const betweenDatePickerOperator: DataFilterDatePickerOperator = "$between";
const numberInputBetweenTuple: DataFilterNumberInputBetweenValue = [10, 20];
const datePickerBetweenTuple: DataFilterDatePickerBetweenValue = [
  "2024-06-01T00:00:00.000Z",
  "2024-06-30T00:00:00.000Z",
];

const _selectFilter: DataFilterItemSelectProps = {
  defaultOperator: selectOperator,
  field: "category",
  label: "Category",
  operators: ["$in", notInSelectOperator],
  options: [
    { label: "Bug", value: "bug" },
    { label: "Feature", value: "feature" },
  ],
  render: ({ field: { value, onChange }, operator }) => {
    const selectedOperator: DataFilterSelectOperator | undefined = operator;
    const selectedValue: Array<string> | null | undefined = value;

    return (
      <button
        data-operator={selectedOperator}
        data-value={selectedValue?.join(",") ?? ""}
        type="button"
        onClick={() => {
          onChange(["bug"]);
        }}
      />
    );
  },
  renderValue: ({ value }) => value?.join(", ") ?? "",
  type: "select",
};

const _remoteSelectFilter: DataFilterItemSelectProps = {
  defaultOperator: selectOperator,
  field: "assignee",
  label: "Assignee",
  options: async (query) => {
    const typedQuery: string = query;

    return [{ label: typedQuery, value: typedQuery }];
  },
  type: "select",
};

const _invalidSelectFilter: DataFilterItemSelectProps = {
  field: "invalid-category",
  label: "Invalid Category",
  // @ts-expect-error select only supports the $in operator.
  operators: ["$eq"],
  options: [{ label: "Bug", value: "bug" }],
  type: "select",
};

const invalidSelectOptionWithIcon: DataFilterSelectOption = {
  // @ts-expect-error select options only support label and value.
  icon: <span />,
  label: "Bug",
  value: "bug",
};

const baseFilter: DataFilterItemBaseProps = {
  field: "base",
  label: "Base",
};

const invalidBaseFilterWithIcon: DataFilterItemBaseProps = {
  field: "base-icon",
  // @ts-expect-error filter items do not support icon.
  icon: <span />,
  label: "Base Icon",
};

const inputFilter: DataFilterItemInputProps = {
  defaultOperator: "$fulltext",
  field: "name",
  label: "Name",
  operators: ["$eq", "$ne", "$fulltext"],
  placeholder: "Filter by name...",
  type: "input",
};

const numberInputFilter: DataFilterItemNumberInputProps = {
  decimalScale: 2,
  defaultOperator: betweenNumberInputOperator,
  field: "price",
  label: "Price",
  max: 100,
  min: 0,
  operators: ["$eq", "$gte", "$lte", betweenNumberInputOperator],
  render: ({ field: { value, onChange } }) => {
    const nextValue:
      | DataFilterNumberInputBetweenValue
      | number
      | null
      | undefined = value;

    return (
      <button
        data-value={String(nextValue)}
        type="button"
        onClick={() => {
          onChange(null);
        }}
      />
    );
  },
  step: 0.01,
  type: "number-input",
};

const datePickerFilter: DataFilterItemDatePickerProps = {
  defaultOperator: betweenDatePickerOperator,
  field: "publishedAt",
  label: "Published At",
  max: new Date("2025-12-31"),
  min: new Date("2025-01-01"),
  operators: ["$eq", "$lt", "$lte", betweenDatePickerOperator],
  render: ({ field: { value, onChange } }) => {
    const nextValue:
      | DataFilterDatePickerBetweenValue
      | Date
      | string
      | null
      | undefined = value;

    return (
      <button
        data-value={String(nextValue)}
        type="button"
        onClick={() => {
          onChange(null);
        }}
      />
    );
  },
  type: "date-picker",
};

const checkboxWithNullRenderFilter: DataFilterItemCheckboxProps = {
  field: "archived",
  label: "Archived",
  render: ({ field: { value, onChange } }) => {
    const nextValue: boolean | null | undefined = value;

    return (
      <button
        data-value={String(nextValue)}
        type="button"
        onClick={() => {
          onChange(null);
        }}
      />
    );
  },
  type: "checkbox",
};

const value: DataFilterValue = {
  filter: {
    age: { $between: numberInputBetweenTuple },
    amount: { $gte: 10 },
    archived: { $eq: null },
    createdAt: { $lt: "2024-06-01T00:00:00.000Z" },
    publishedAt: {
      $between: datePickerBetweenTuple,
    },
    priority: { $in: ["high", "medium"] },
    status: { $fulltext: "active" },
    verified: { $eq: true },
  },
  orderBy: {
    direction: "DESC",
    field: "createdAt",
  },
  query: "active",
};

const operator: DataFilterOperator = "$fulltext";

const DataFilterTagItemApi = () => <DataFilterTagItem item={inputFilter} />;

const InvalidDataFilterTagItemWithForwardedValue = () => (
  <DataFilterTagItem
    item={inputFilter}
    // @ts-expect-error tag items read their value from data-filter context.
    value={{ $fulltext: "active" }}
  />
);

const DataFilterDefaultInputFieldApi = () => (
  <DataFilterDefaultInputField
    item={inputFilter}
    value="active"
    onChange={(value) => {
      const nextValue: string | undefined = value;
      void nextValue;
    }}
  />
);

const InvalidDataFilterDefaultInputFieldValue = () => (
  <DataFilterDefaultInputField
    item={inputFilter}
    // @ts-expect-error input default field only accepts string values.
    value={123}
    onChange={() => undefined}
  />
);

const DataFilterDefaultNumberInputFieldApi = () => (
  <DataFilterDefaultNumberInputField
    item={numberInputFilter}
    operator="$between"
    value={numberInputBetweenTuple}
    onChange={(value) => {
      const nextValue: DataFilterNumberInputBetweenValue | number | undefined =
        value;
      void nextValue;
    }}
  />
);

const InvalidDataFilterDefaultNumberInputFieldValue = () => (
  <DataFilterDefaultNumberInputField
    item={numberInputFilter}
    operator="$eq"
    // @ts-expect-error number-input default field only accepts number values.
    value="10"
    onChange={() => undefined}
  />
);

const DataFilterDefaultDatePickerFieldApi = () => (
  <DataFilterDefaultDatePickerField
    item={datePickerFilter}
    operator="$between"
    value={datePickerBetweenTuple}
    onChange={(value) => {
      const nextValue:
        | DataFilterDatePickerBetweenValue
        | Date
        | string
        | undefined = value;
      void nextValue;
    }}
  />
);

const InvalidDataFilterDefaultDatePickerFieldValue = () => (
  <DataFilterDefaultDatePickerField
    item={datePickerFilter}
    operator="$eq"
    // @ts-expect-error date-picker default field only accepts date values.
    value={10}
    onChange={() => undefined}
  />
);

const DataFilterDefaultCheckboxFieldApi = () => (
  <DataFilterDefaultCheckboxField
    value={true}
    onChange={(value) => {
      const nextValue: boolean = value;
      void nextValue;
    }}
  />
);

const InvalidDataFilterDefaultCheckboxFieldItem = () => (
  <DataFilterDefaultCheckboxField
    // @ts-expect-error checkbox default field does not receive item config.
    item={checkboxFilter}
    value={true}
    onChange={() => undefined}
  />
);

const DataFilterDefaultSelectFieldApi = () => (
  <DataFilterDefaultSelectField
    item={_selectFilter}
    value={["bug"]}
    onChange={(value) => {
      const nextValue: Array<string> | undefined = value;
      void nextValue;
    }}
  />
);

const DataFilterDefaultSelectFieldLegacyValueApi = () => (
  <DataFilterDefaultSelectField
    item={_selectFilter}
    value="bug"
    onChange={() => undefined}
  />
);

const InvalidDataFilterDefaultSelectFieldValue = () => (
  <DataFilterDefaultSelectField
    item={_selectFilter}
    // @ts-expect-error select default field only accepts string or string array values.
    value={10}
    onChange={() => undefined}
  />
);

const search: DataFilterSearchProps = {
  placeholder: "Search...",
};

const invalidSearchWithDisabled: DataFilterSearchProps = {
  // @ts-expect-error disabled is controlled by the root component.
  disabled: false,
};

const invalidSearchWithValue: DataFilterSearchProps = {
  // @ts-expect-error search value is stored in DataFilterValue.query.
  value: "query",
};

const invalidSearchWithChange: DataFilterSearchProps = {
  // @ts-expect-error search changes are emitted through root onChange.
  onChange: () => undefined,
};

const invalidSearchWithLoading: DataFilterSearchProps = {
  // @ts-expect-error loading is a root DataFilter prop.
  loading: false,
};

const invalidSearchWithClassName: DataFilterSearchProps = {
  // @ts-expect-error className is not a search config prop.
  className: "w-full",
};

const invalidSearchWithPrefix: DataFilterSearchProps = {
  // @ts-expect-error prefix is not a search config prop.
  prefix: <span>Prefix</span>,
};

const invalidSearchWithSuffix: DataFilterSearchProps = {
  // @ts-expect-error suffix is not a search config prop.
  suffix: <span>Suffix</span>,
};

const invalidSearchWithTrailing: DataFilterSearchProps = {
  // @ts-expect-error trailing is not a search config prop.
  trailing: <span>Trailing</span>,
};

const invalidSearchWithLeading: DataFilterSearchProps = {
  // @ts-expect-error leading is not a search prop.
  leading: <span>Leading</span>,
};

const invalidSearchWithBlur: DataFilterSearchProps = {
  // @ts-expect-error onBlur is not a search prop.
  onBlur: () => undefined,
};

const invalidSearchWithSubmit: DataFilterSearchProps = {
  // @ts-expect-error onSubmit is not a search prop.
  onSubmit: () => undefined,
};

const sortValue: DataFilterSortValue = {
  direction: "DESC",
  field: "createdAt",
};

const sort: DataFilterSortProps = {
  options: [
    {
      direction: "DESC",
      directionLabel: "Newest first",
      field: "createdAt",
      fieldLabel: "Created Date",
    },
  ],
};

const invalidSortWithSelected: DataFilterSortProps = {
  options: [],
  // @ts-expect-error selected sort is stored in DataFilterValue.orderBy.
  selected: sortValue,
};

const invalidSortWithChange: DataFilterSortProps = {
  options: [],
  // @ts-expect-error sort changes are emitted through root onChange.
  onChange: () => undefined,
};

const DataFilterApi = () => (
  <DataFilter
    filters={filters}
    loading={false}
    search={search}
    sort={sort}
    value={value}
    onChange={(nextValue) => {
      const typedValue: DataFilterValue = nextValue;
      void typedValue;
    }}
  />
);

const dataFilterProps: DataFilterProps = {
  filters,
  loading: false,
  search,
  sort,
  value,
  onChange: (nextValue) => {
    const typedValue: DataFilterValue = nextValue;
    void typedValue;
  },
};

const DataFilterSearchOnlyApi = () => (
  <DataFilter filters={[]} search={search} />
);

const DataFilterWithoutSearchApi = () => (
  <DataFilter filters={filters} search={false} />
);

const DataFilterWithoutSortApi = () => (
  <DataFilter filters={filters} sort={false} />
);

const InvalidDataFilterWithValues = () => (
  <DataFilter
    filters={filters}
    // @ts-expect-error values was replaced by value.
    values={value.filter}
  />
);

const InvalidDataFilterWithOnValueChange = () => (
  <DataFilter
    filters={filters}
    // @ts-expect-error use onChange instead.
    onValueChange={() => undefined}
  />
);

const DataFilterWithRenderersApi = () => (
  <DataFilter
    filters={filters}
    // @ts-expect-error renderers is not a public prop.
    renderers={{
      addFilter: () => <button type="button">Add</button>,
    }}
  />
);

const invalidSortValue: DataFilterSortValue = {
  field: "createdAt",
  // @ts-expect-error direction only supports ASC or DESC.
  direction: "newest",
};

const invalidFilter: DataFilterItemProps = {
  field: "status",
  label: "Status",
  type: "input",
  // @ts-expect-error render must return a React element.
  render: () => "Status",
};

// @ts-expect-error type is required.
const invalidFilterWithoutType: DataFilterItemProps = {
  field: "status",
  label: "Status",
  render: () => <input />,
};

const invalidStringFilterType: DataFilterItemProps = {
  field: "status",
  label: "Status",
  // @ts-expect-error use input instead of string.
  type: "string",
};

const invalidNumberFilterType: DataFilterItemProps = {
  field: "amount",
  label: "Amount",
  // @ts-expect-error use number-input instead of number.
  type: "number",
};

const invalidDateFilterType: DataFilterItemProps = {
  field: "createdAt",
  label: "Created At",
  // @ts-expect-error use date-picker instead of date.
  type: "date",
};

const invalidInputFilterWithRange: DataFilterItemInputProps = {
  field: "status",
  label: "Status",
  // @ts-expect-error input filters do not support min.
  min: 0,
  type: "input",
};

const invalidInputFilterWithComparison: DataFilterItemInputProps = {
  field: "status",
  label: "Status",
  operators: [
    // @ts-expect-error input filters do not support comparison operators.
    "$gt",
  ],
  type: "input",
};

const invalidNumberInputFilterWithFullText: DataFilterItemNumberInputProps = {
  field: "amount",
  label: "Amount",
  operators: [
    // @ts-expect-error number-input filters do not support full-text operators.
    "$fulltext",
  ],
  type: "number-input",
};

const invalidCheckboxFilterWithFullText: DataFilterItemCheckboxProps = {
  field: "verified",
  label: "Verified",
  operators: [
    // @ts-expect-error checkbox filters do not support full-text operators.
    "$fulltext",
  ],
  type: "checkbox",
};

export {
  DataFilterApi,
  DataFilterDefaultCheckboxFieldApi,
  DataFilterDefaultDatePickerFieldApi,
  DataFilterDefaultInputFieldApi,
  DataFilterDefaultNumberInputFieldApi,
  DataFilterDefaultSelectFieldApi,
  DataFilterDefaultSelectFieldLegacyValueApi,
  DataFilterSearchOnlyApi,
  DataFilterTagItemApi,
  DataFilterWithRenderersApi,
  DataFilterWithoutSortApi,
  DataFilterWithoutSearchApi,
  baseFilter,
  betweenDatePickerOperator,
  betweenNumberInputOperator,
  checkboxFilter,
  checkboxWithNullRenderFilter,
  datePickerFilter,
  dataFilterProps,
  inputFilter,
  invalidBaseFilterWithIcon,
  invalidCheckboxFilterWithFullText,
  invalidDateFilterType,
  InvalidDataFilterWithOnValueChange,
  InvalidDataFilterWithValues,
  InvalidDataFilterDefaultCheckboxFieldItem,
  InvalidDataFilterDefaultDatePickerFieldValue,
  InvalidDataFilterDefaultInputFieldValue,
  InvalidDataFilterDefaultNumberInputFieldValue,
  InvalidDataFilterDefaultSelectFieldValue,
  InvalidDataFilterTagItemWithForwardedValue,
  invalidFilter,
  invalidFilterWithoutType,
  invalidSearchWithChange,
  invalidSearchWithClassName,
  invalidSearchWithDisabled,
  invalidSearchWithBlur,
  invalidSearchWithLeading,
  invalidSearchWithLoading,
  invalidSearchWithPrefix,
  invalidSearchWithSuffix,
  invalidSearchWithSubmit,
  invalidSearchWithTrailing,
  invalidSearchWithValue,
  invalidSelectOptionWithIcon,
  invalidSortWithChange,
  invalidSortWithSelected,
  invalidSortValue,
  invalidInputFilterWithComparison,
  invalidInputFilterWithRange,
  invalidNumberFilterType,
  invalidNumberInputFilterWithFullText,
  invalidStringFilterType,
  numberInputFilter,
  operator,
  value,
};
