import { DataFilter } from "../index";
import type {
  DataFilterItemProps,
  DataFilterSearchConfig,
  DataFilterSortConfig,
  DataFilterSortValue,
  DataFilterValues,
} from "../index";

const filters: DataFilterItemProps[] = [
  {
    field: "status",
    label: "Status",
    pinned: true,
    render: ({ field: { value, onChange } }) => (
      <input
        value={(value as string | undefined) ?? ""}
        onChange={(event) => onChange(event.target.value)}
      />
    ),
    renderValue: ({ value }) => String(value),
  },
];

const values: DataFilterValues = {
  status: "active",
};

const search: DataFilterSearchConfig = {
  disabled: false,
  placeholder: "Search...",
  prefix: <span>Prefix</span>,
  suffix: <span>Suffix</span>,
  value: "query",
  onChange: () => undefined,
};

const sortValue: DataFilterSortValue = {
  direction: "DESC",
  field: "createdAt",
};

const sort: DataFilterSortConfig = {
  options: [
    {
      direction: "DESC",
      directionLabel: "Newest first",
      field: "createdAt",
      fieldLabel: "Created Date",
    },
  ],
  selected: sortValue,
  onChange: () => undefined,
};

const DataFilterApi = () => (
  <DataFilter
    filters={filters}
    i18n={{ addFilter: "Add filter" }}
    loading={false}
    search={search}
    sort={sort}
    values={values}
    renderers={{
      addFilter: () => <button type="button">Add</button>,
      filterItem: ({ label, value, remove }) => (
        <button type="button" onClick={remove}>
          {label}
          {value}
        </button>
      ),
    }}
    onChange={() => undefined}
  />
);

const DataFilterSearchOnlyApi = () => (
  <DataFilter filters={[]} search={search} />
);

const DataFilterWithoutSearchApi = () => (
  <DataFilter filters={filters} search={false} />
);

const invalidSortValue: DataFilterSortValue = {
  field: "createdAt",
  // @ts-expect-error direction only supports ASC or DESC.
  direction: "newest",
};

const invalidFilter: DataFilterItemProps = {
  field: "status",
  label: "Status",
  // @ts-expect-error render must return a React element.
  render: () => "Status",
};

export {
  DataFilterApi,
  DataFilterSearchOnlyApi,
  DataFilterWithoutSearchApi,
  invalidFilter,
  invalidSortValue,
};
