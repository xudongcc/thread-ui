import {
  ComplexFilter,
  ComplexFilterConditionRow,
  ComplexFilterGroup,
  ComplexFilterLogical,
  ComplexFilterType,
} from "../index";
import type {
  ComplexFilterCondition,
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

const ComplexFilterApi = () => (
  <ComplexFilter
    showClearAll
    filters={filters}
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

const ComplexFilterPartsApi = () => (
  <>
    <ComplexFilterConditionRow
      filters={filters}
      value={condition}
      onChange={() => undefined}
      onRemove={() => undefined}
    />
    <ComplexFilterGroup
      filters={filters}
      value={{ $and: [condition] }}
      onChange={() => undefined}
    />
  </>
);

const invalidI18nProps: ComplexFilterProps = {
  filters,
  // @ts-expect-error Component labels are configured through the provider resources.
  i18n: {},
};

export { ComplexFilterPartsApi, invalidI18nProps };
