import {
  ComplexFilter,
  ComplexFilterLogical,
  ComplexFilterType,
} from "../index";
import type {
  ComplexFilterCondition,
  ComplexFilterI18n,
  ComplexFilterItem,
  ComplexFilterProps,
  ComplexFilterValue,
} from "../index";

const filters: Array<ComplexFilterItem> = [
  {
    field: "name",
    label: "Name",
    type: ComplexFilterType.STRING,
    render: ({ value, disabled, onChange }) => (
      <input
        disabled={disabled}
        value={(value as string | undefined) ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
    ),
  },
  {
    field: "age",
    label: "Age",
    type: ComplexFilterType.NUMBER,
    operators: ["$eq", "$lt"],
    render: ({ value, onChange }) => (
      <input
        type="number"
        value={(value as number | undefined) ?? ""}
        onChange={(event) => onChange(Number(event.target.value))}
      />
    ),
  },
];

const condition: ComplexFilterCondition = {
  name: { $eq: "Joe" },
};

const value: ComplexFilterValue = {
  [ComplexFilterLogical.AND]: [condition, { age: { $lt: 18 } }],
};

const i18n: ComplexFilterI18n = {
  operators: {
    $eq: "Equals",
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
  clearAll: "Clear all",
  selectField: "Select field",
  selectOperator: "Select operator",
  selectValue: "Select value",
};

const ComplexFilterApi = () => (
  <ComplexFilter
    showClearAll
    filters={filters}
    i18n={i18n}
    value={value}
    onChange={() => undefined}
  />
);

const complexFilterProps: ComplexFilterProps = {
  filters,
  value,
  onChange: () => undefined,
};

const invalidFilter: ComplexFilterItem = {
  field: "active",
  label: "Active",
  // @ts-expect-error type must use ComplexFilterType.
  type: "bool",
  render: () => null,
};

export { ComplexFilterApi, complexFilterProps, invalidFilter };
