import { DataTable, createDataTableColumnHelper } from "../index";
import type {
  DataTableCellContext,
  DataTableColumnProps,
  DataTableField,
  DataTableHeaderContext,
} from "../index";

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

const productColumnHelper = createDataTableColumnHelper<Product>();
const nameColumn = productColumnHelper.field("customer.name", {
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
const priceColumn = productColumnHelper.field("price", {
  type: "currency",
  currency: "USD",
  render: (props, { getValue }) => {
    const value: number = getValue();
    // @ts-expect-error The accessor determines the render value type.
    const _incorrect: string = getValue();
    return <span {...props}>{value.toFixed(2)}</span>;
  },
});
const computedColumn = productColumnHelper.getValue(
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
export const inferredColumns = productColumnHelper.columns([
  nameColumn,
  priceColumn,
  computedColumn,
  productColumnHelper.field("customer.address.city", {
    render: (props, { getValue }) => {
      const value: string | undefined = getValue();
      return <span {...props}>{value}</span>;
    },
  }),
  productColumnHelper.field("tags.0", {
    render: (props, { getValue }) => {
      const value: string | undefined = getValue();
      // @ts-expect-error An array may have no entry at the requested index.
      const _required: string = getValue();
      return <span {...props}>{value}</span>;
    },
  }),
  productColumnHelper.field("pair.1", {
    render: (props, { getValue }) => {
      const value: number = getValue();
      return <span {...props}>{value}</span>;
    },
  }),
  productColumnHelper.field("parent.parent.price", {}),
  productColumnHelper.field("createdAt", { type: "datetime" }),
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
productColumnHelper.field("customer.nmae", {});
// @ts-expect-error Tuple positions are checked.
productColumnHelper.field("pair.2", {});
// @ts-expect-error Dates are leaf values, not nested object paths.
productColumnHelper.field("createdAt.toISOString", {});
// @ts-expect-error Arrays use numeric indices, not implicit property projection.
productColumnHelper.field("tags.name", {});
// @ts-expect-error Decimal array paths would be split into separate path segments.
productColumnHelper.field("tags.1.5", {});
// @ts-expect-error Currency requirements remain intact in helper options.
productColumnHelper.field("price", { type: "currency" });
// @ts-expect-error Formatting options remain exclusive to their column type.
productColumnHelper.field("price", { type: "number", timeZone: "UTC" });
// @ts-expect-error A computed column needs an explicit stable ID.
productColumnHelper.getValue((product) => product.price * 2, {});
productColumnHelper.field("price", {
  // @ts-expect-error The options cannot replace the inferred accessor.
  getValue: (product: Product) => product.id,
});
// @ts-expect-error The options cannot replace the inferred field.
productColumnHelper.field("price", { field: "id" });
productColumnHelper.field("price", {
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
productColumnHelper.columns([{ type: "currency" }]);

const dynamicColumnHelper = createDataTableColumnHelper<{ payload: unknown }>();
dynamicColumnHelper.field("payload.value", {
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

interface DictionaryRow {
  id: string;
  amounts: Record<string, number>;
  numericAmounts: Record<number, number>;
  customers: Record<string, { name: string }>;
  knownAmounts: { total: number; [key: string]: number };
  price: number;
}
const dictionaryRowColumnHelper = createDataTableColumnHelper<DictionaryRow>();
export const dictionaryColumns = dictionaryRowColumnHelper.columns([
  dictionaryRowColumnHelper.field("amounts.missing", {
    render: (props, { getValue }) => {
      const value: number | undefined = getValue();
      // @ts-expect-error An index signature does not guarantee that the key exists.
      const _required: number = getValue();
      return <span {...props}>{value?.toFixed(2) ?? "—"}</span>;
    },
  }),
  dictionaryRowColumnHelper.field("numericAmounts.123", {
    render: (props, { getValue }) => {
      const value: number | undefined = getValue();
      // @ts-expect-error Numeric index signatures can also have missing entries.
      const _required: number = getValue();
      return <span {...props}>{value?.toFixed(2)}</span>;
    },
  }),
  dictionaryRowColumnHelper.field("customers.missing.name", {
    render: (props, { getValue }) => {
      const value: string | undefined = getValue();
      // @ts-expect-error A missing dictionary parent makes nested values optional.
      const _required: string = getValue();
      return <span {...props}>{value?.toUpperCase()}</span>;
    },
  }),
  dictionaryRowColumnHelper.field("knownAmounts.total", {
    render: (props, { getValue }) => {
      const value: number = getValue();
      return <span {...props}>{value.toFixed(2)}</span>;
    },
  }),
  {
    field: "price",
    render: (props, { getValue, row }) => {
      const value: unknown = getValue();
      const id: string = row.original.id;
      // @ts-expect-error Plain columns keep their unknown value contract.
      const _required: number = getValue();
      return (
        <span {...props}>
          {id}: {String(value)}
        </span>
      );
    },
  },
]);

const stringCell = (
  _props: unknown,
  { getValue }: DataTableCellContext<DictionaryRow, string>,
) => <span>{getValue().toUpperCase()}</span>;
const stringHeader = (
  _props: unknown,
  { column }: DataTableHeaderContext<DictionaryRow, string>,
) => <span>{column.id}</span>;
// @ts-expect-error A plain numeric column cannot bypass checking via columns().
dictionaryRowColumnHelper.columns([{ field: "price", render: stringCell }]);
// @ts-expect-error The same guarantee applies to header callbacks.
dictionaryRowColumnHelper.columns([{ field: "price", header: stringHeader }]);

// @ts-expect-error The old combined accessor API has been removed.
productColumnHelper.accessor("price", {});
productColumnHelper.getValue((row) => row.price, {
  id: "computed",
  // @ts-expect-error Computed callback annotations must not change the inferred return type.
  render: (_props, { getValue }: { getValue: () => string }) => (
    <span>{getValue()}</span>
  ),
});

// Exported helpers and individual columns must remain declaration-emittable.
export const itemColumnHelper = createDataTableColumnHelper<Item>();
export const itemNameColumn = itemColumnHelper.field("name", {
  header: "Name",
});
export const itemLengthColumn = itemColumnHelper.getValue(
  (row) => row.name.length,
  { id: "length" },
);

interface PatternRow {
  metrics: {
    [key: `amount_${string}`]: number;
    amount_total: number;
  };
  customers: Record<`customer_${number}`, { name: string }>;
}
const patternColumnHelper = createDataTableColumnHelper<PatternRow>();
patternColumnHelper.field("metrics.amount_missing", {
  render: (props, { getValue }) => {
    const value: number | undefined = getValue();
    // @ts-expect-error A template index signature does not guarantee a key exists.
    const _required: number = getValue();
    return <span {...props}>{value?.toFixed(2)}</span>;
  },
});
patternColumnHelper.field("metrics.amount_total", {
  render: (props, { getValue }) => {
    const value: number = getValue();
    return <span {...props}>{value.toFixed(2)}</span>;
  },
});
patternColumnHelper.field("customers.customer_1.name", {
  render: (props, { getValue }) => {
    const value: string | undefined = getValue();
    // @ts-expect-error A missing template-keyed parent makes nested values optional.
    const _required: string = getValue();
    return <span {...props}>{value?.toUpperCase()}</span>;
  },
});

// Common module reuse patterns must also produce valid declarations.
export const {
  field: itemField,
  getValue: itemGetValue,
  columns: itemColumns,
} = itemColumnHelper;
export const resizedNameColumn = { ...itemNameColumn, size: 180 };
export const reusedColumns = itemColumns([resizedNameColumn, itemLengthColumn]);
