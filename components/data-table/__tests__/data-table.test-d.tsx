import { DataTable, createDataTableColumnHelper } from "../index";
import type { DataTableColumnProps, DataTableField } from "../index";

interface Item {
  id: string;
  name: string;
}

export const dataTableWithEmptyProp = (
  <DataTable<Item>
    columns={[{ id: "name", header: "Name", field: "name" }]}
    data={[]}
    empty={<div>No custom items</div>}
  />
);

export const dataTableWithFormattingLocale = (
  <DataTable<Item>
    columns={[{ id: "name", header: "Name", field: "name" }]}
    data={[]}
    locale="zh"
    timeZone="Asia/Shanghai"
  />
);

export const dataTableWithPublicContexts = (
  <DataTable<Item, string>
    data={[]}
    columns={[
      {
        id: "name",
        getValue: (item) => item.name,
        header: (props, { column }) => <strong {...props}>{column.id}</strong>,
        render: (props, { getValue, row }) => {
          const value: string = getValue();
          // @ts-expect-error Internal table methods are not public API.
          row.getIsSelected();
          return <span {...props}>{value}</span>;
        },
        // @ts-expect-error Engine-specific options are not public API.
        enableSorting: true,
      },
    ]}
  />
);

export const dataTableWithRemovedHeaderRender = (
  <DataTable<Item>
    data={[]}
    columns={[
      {
        field: "name",
        // @ts-expect-error Use header for both content and render functions.
        headerRender: <strong />,
      },
    ]}
  />
);

export const typedColumns: DataTableColumnProps<Item, number>[] = [
  { field: "name" },
  { type: "number", getValue: () => 2, precision: 0, locale: "en-US" },
  { type: "currency", currency: "CNY", precision: 2 },
  { type: "percent", precision: 1 },
  { type: "duration", unit: "milliseconds", style: "long", locale: "zh-CN" },
  { type: "date", timeZone: "UTC", locale: "zh-CN" },
  { type: "datetime", timeZone: "Asia/Shanghai" },
  { type: "time", timeZone: "Asia/Shanghai", locale: "en-GB", hour12: false },
  {
    type: "number",
    getValue: () => 12,
    render: (props, { getValue, column }) => {
      const value: number = getValue();
      if (column.type === "currency") {
        const currency: string = column.currency;
        return (
          <span {...props}>
            {currency}
            {value}
          </span>
        );
      }
      return <span {...props}>{value}</span>;
    },
  },
  // @ts-expect-error Duration is independent of time zones.
  { type: "duration", timeZone: "UTC" },
  // @ts-expect-error Calendar months are not fixed duration units.
  { type: "duration", unit: "months" },
  // @ts-expect-error Unknown duration style.
  { type: "duration", style: "clock" },
  // @ts-expect-error Units require a duration column.
  { field: "name", unit: "seconds" },
  // @ts-expect-error Styles require a duration column.
  { field: "name", style: "long" },
  // @ts-expect-error Clock options require a time column.
  { field: "name", hour12: true },
  // @ts-expect-error A time column does not accept numeric precision.
  { type: "time", precision: 2 },
  // @ts-expect-error A date column has no clock to configure.
  { type: "date", hour12: false },
  // @ts-expect-error Currency columns require a currency code.
  { type: "currency" },
  // @ts-expect-error Text columns do not format locales.
  { type: "text", locale: "en-US" },
  // @ts-expect-error A locale requires a formatting type.
  { field: "name", locale: "en-US" },
  // @ts-expect-error Precision is not a date option.
  { type: "date", precision: 2 },
  // @ts-expect-error Time zones are not number options.
  { type: "number", timeZone: "UTC" },
  // @ts-expect-error A currency code is only allowed on currency columns.
  { type: "percent", currency: "USD" },
];

interface Product {
  id: string;
  price: number;
  customer?: { name: string; address: { city: string } | null };
  tags: string[];
  pair: readonly [string, number];
  createdAt: Date;
  parent?: Product;
}

const productColumn = createDataTableColumnHelper<Product>();
const nameColumn = productColumn.accessor("customer.name", {
  header: "Customer",
  render: (props, { getValue, row }) => {
    const value: string | undefined = getValue();
    const product: Product = row.original;
    // @ts-expect-error An optional parent can make the nested value undefined.
    const _required: string = getValue();
    // @ts-expect-error Field inference does not widen to any.
    const _incorrect: number = getValue();
    return <span {...props}>{value ?? product.id}</span>;
  },
});
const priceColumn = productColumn.accessor("price", {
  type: "currency",
  currency: "USD",
  render: (props, { getValue }) => {
    const value: number = getValue();
    // @ts-expect-error The accessor determines the render value type.
    const _incorrect: string = getValue();
    return <span {...props}>{value.toFixed(2)}</span>;
  },
});
const computedColumn = productColumn.accessor(
  (product, index) => `${index}: ${product.id}`,
  {
    id: "summary",
    render: (props, { getValue }) => {
      const value: string = getValue();
      // @ts-expect-error Computed accessor return types are also inferred.
      const _incorrect: number = getValue();
      return <span {...props}>{value.toUpperCase()}</span>;
    },
  },
);
export const inferredColumns = productColumn.columns([
  nameColumn,
  priceColumn,
  computedColumn,
  productColumn.accessor("customer.address.city", {
    render: (props, { getValue }) => {
      const value: string | undefined = getValue();
      return <span {...props}>{value}</span>;
    },
  }),
  productColumn.accessor("tags.0", {
    render: (props, { getValue }) => {
      const value: string | undefined = getValue();
      // @ts-expect-error An array may have no entry at the requested index.
      const _required: string = getValue();
      return <span {...props}>{value}</span>;
    },
  }),
  productColumn.accessor("pair.1", {
    render: (props, { getValue }) => {
      const value: number = getValue();
      return <span {...props}>{value}</span>;
    },
  }),
  productColumn.accessor("parent.parent.price", {}),
  productColumn.accessor("createdAt", { type: "datetime" }),
  { id: "label", header: "Label" },
]);
export const inferredTable = (
  <DataTable columns={inferredColumns} data={[] as Product[]} />
);
export const explicitlyTypedTable = (
  <DataTable<Product> columns={inferredColumns} data={[]} />
);
export const typedAccessor:
  ((row: Product, index: number) => number) | undefined = priceColumn.getValue;

// @ts-expect-error Misspelled nested field paths are rejected.
productColumn.accessor("customer.nmae", {});
// @ts-expect-error Tuple positions are checked.
productColumn.accessor("pair.2", {});
// @ts-expect-error Dates are leaf values, not nested object paths.
productColumn.accessor("createdAt.toISOString", {});
// @ts-expect-error Arrays use numeric indices, not implicit property projection.
productColumn.accessor("tags.name", {});
// @ts-expect-error Decimal array paths would be split into separate path segments.
productColumn.accessor("tags.1.5", {});
// @ts-expect-error Currency requirements remain intact in helper options.
productColumn.accessor("price", { type: "currency" });
// @ts-expect-error Formatting options remain exclusive to their column type.
productColumn.accessor("price", { type: "number", timeZone: "UTC" });
// @ts-expect-error A computed column needs an explicit stable ID.
productColumn.accessor((product) => product.price * 2, {});
// @ts-expect-error The options cannot replace the inferred accessor.
productColumn.accessor("price", { getValue: (product: Product) => product.id });
// @ts-expect-error The options cannot replace the inferred field.
productColumn.accessor("price", { field: "id" });
productColumn.accessor("price", {
  // @ts-expect-error Callback annotations must not alter inference from the accessor.
  render: (_props, { getValue }: { getValue: () => string }) => (
    <span>{getValue()}</span>
  ),
});

export const checkedFields: DataTableColumnProps<Product>[] = [
  { field: "customer.name" },
  // @ts-expect-error Plain column definitions also validate field paths.
  { field: "missing.path" },
];
export const dynamicField: DataTableField<Record<string, unknown>> =
  "server.key";

// @ts-expect-error The columns boundary also retains required formatting options.
productColumn.columns([{ type: "currency" }]);

const dynamicColumn = createDataTableColumnHelper<{ payload: unknown }>();
dynamicColumn.accessor("payload.value", {
  render: (props, { getValue }) => {
    // @ts-expect-error Dynamic data stays unknown rather than becoming any or undefined.
    const _value: string | undefined = getValue();
    return <span {...props}>{String(getValue())}</span>;
  },
});

export const invalidInlineField = (
  <DataTable<Product>
    // @ts-expect-error JSX column definitions also check field paths.
    columns={[{ field: "price.missing" }]}
    data={[]}
  />
);
