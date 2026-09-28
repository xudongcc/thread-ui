import { DataTable, createDataTableColumnHelper } from "../index";
import type {
  DataTableBaseColumnProps,
  DataTableCellContext,
  DataTableColumnProps,
  DataTableCurrencyColumnProps,
  DataTableDateColumnProps,
  DataTableDateTimeColumnProps,
  DataTableDurationColumnProps,
  DataTableField,
  DataTableHeaderContext,
  DataTableNumberColumnProps,
  DataTablePercentColumnProps,
  DataTableTextColumnProps,
  DataTableTimeColumnProps,
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
const nameColumn = productColumnHelper.column("customer.name", {
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
const priceColumn = productColumnHelper.column("price", {
  type: "currency",
  currency: "USD",
  render: (props, { getValue }) => {
    const value: number = getValue();
    // @ts-expect-error The accessor determines the render value type.
    const _incorrect: string = getValue();
    return <span {...props}>{value.toFixed(2)}</span>;
  },
});
const computedColumn = productColumnHelper.column("summary", {
  getValue: (product, index) => `${index}: ${product.id}`,
  render: (props, { getValue }) => {
    const value: string = getValue();
    // @ts-expect-error Computed accessor return types are also inferred.
    const _incorrect: number = getValue();
    return <span {...props}>{value.toUpperCase()}</span>;
  },
});
export const inferredColumns = productColumnHelper.columns([
  nameColumn,
  priceColumn,
  computedColumn,
  productColumnHelper.column("customer.address.city", {
    render: (props, { getValue }) => {
      const value: string | undefined = getValue();
      return <span {...props}>{value}</span>;
    },
  }),
  productColumnHelper.column("tags.0", {
    render: (props, { getValue }) => {
      const value: string | undefined = getValue();
      // @ts-expect-error An array may have no entry at the requested index.
      const _required: string = getValue();
      return <span {...props}>{value}</span>;
    },
  }),
  productColumnHelper.column("pair.1", {
    render: (props, { getValue }) => {
      const value: number = getValue();
      return <span {...props}>{value}</span>;
    },
  }),
  productColumnHelper.column("parent.parent.price", {}),
  productColumnHelper.column("createdAt", { type: "datetime" }),
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
productColumnHelper.column("customer.nmae", {});
// @ts-expect-error Tuple positions are checked.
productColumnHelper.column("pair.2", {});
// @ts-expect-error Dates are leaf values, not nested object paths.
productColumnHelper.column("createdAt.toISOString", {});
// @ts-expect-error Arrays use numeric indices, not implicit property projection.
productColumnHelper.column("tags.name", {});
// @ts-expect-error Decimal array paths would be split into separate path segments.
productColumnHelper.column("tags.1.5", {});
// @ts-expect-error Currency requirements remain intact in helper options.
productColumnHelper.column("price", { type: "currency" });
productColumnHelper.column("price", {
  type: "number",
  // @ts-expect-error Formatting options remain exclusive to their column type.
  timeZone: "UTC",
});
// @ts-expect-error The former computed-column helper has been removed.
productColumnHelper.getValue((product: Product) => product.price * 2, {});
// @ts-expect-error The former field helper has been removed.
productColumnHelper.field("price", {});
productColumnHelper.column("price", {
  // @ts-expect-error Callback annotations must not alter field inference.
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
dynamicColumnHelper.column("payload.value", {
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
  dictionaryRowColumnHelper.column("amounts.missing", {
    render: (props, { getValue }) => {
      const value: number | undefined = getValue();
      // @ts-expect-error An index signature does not guarantee that the key exists.
      const _required: number = getValue();
      return <span {...props}>{value?.toFixed(2) ?? "—"}</span>;
    },
  }),
  dictionaryRowColumnHelper.column("numericAmounts.123", {
    render: (props, { getValue }) => {
      const value: number | undefined = getValue();
      // @ts-expect-error Numeric index signatures can also have missing entries.
      const _required: number = getValue();
      return <span {...props}>{value?.toFixed(2)}</span>;
    },
  }),
  dictionaryRowColumnHelper.column("customers.missing.name", {
    render: (props, { getValue }) => {
      const value: string | undefined = getValue();
      // @ts-expect-error A missing dictionary parent makes nested values optional.
      const _required: string = getValue();
      return <span {...props}>{value?.toUpperCase()}</span>;
    },
  }),
  dictionaryRowColumnHelper.column("knownAmounts.total", {
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
// @ts-expect-error A renderer cannot override the computed return type.
productColumnHelper.column("computed", {
  getValue: (row: Product) => row.price,
  render: (_props: unknown, { getValue }: { getValue: () => string }) => (
    <span>{getValue()}</span>
  ),
});

// Exported helpers and individual columns must remain declaration-emittable.
export const itemColumnHelper = createDataTableColumnHelper<Item>();
export const itemNameColumn = itemColumnHelper.column("name", {
  header: "Name",
});
export const itemLengthColumn = itemColumnHelper.column("length", {
  getValue: (row) => row.name.length,
});

interface PatternRow {
  metrics: {
    [key: `amount_${string}`]: number;
    amount_total: number;
  };
  customers: Record<`customer_${number}`, { name: string }>;
}
const patternColumnHelper = createDataTableColumnHelper<PatternRow>();
patternColumnHelper.column("metrics.amount_missing", {
  render: (props, { getValue }) => {
    const value: number | undefined = getValue();
    // @ts-expect-error A template index signature does not guarantee a key exists.
    const _required: number = getValue();
    return <span {...props}>{value?.toFixed(2)}</span>;
  },
});
patternColumnHelper.column("metrics.amount_total", {
  render: (props, { getValue }) => {
    const value: number = getValue();
    return <span {...props}>{value.toFixed(2)}</span>;
  },
});
patternColumnHelper.column("customers.customer_1.name", {
  render: (props, { getValue }) => {
    const value: string | undefined = getValue();
    // @ts-expect-error A missing template-keyed parent makes nested values optional.
    const _required: string = getValue();
    return <span {...props}>{value?.toUpperCase()}</span>;
  },
});

// Common module reuse patterns must also produce valid declarations.
export const { column: itemColumn, columns: itemColumns } = itemColumnHelper;
export const resizedNameColumn = { ...itemNameColumn, size: 180 };
export const reusedColumns = itemColumns([resizedNameColumn, itemLengthColumn]);

// Explicit fields infer their value independently of the ID.
productColumnHelper.column("customerName", {
  field: "customer.name",
  render: (props, { getValue }) => {
    const value: string | undefined = getValue();
    // @ts-expect-error A field alias must not widen to any.
    const _invalid: number = getValue();
    return <span {...props}>{value}</span>;
  },
});
productColumnHelper.column("actions", {
  field: null,
  render: (props, { getValue, row }) => {
    const value: undefined = getValue();
    // @ts-expect-error Display columns have no cell value.
    const _invalid: string = getValue();
    return (
      <span {...props}>
        {row.original.id}
        {value}
      </span>
    );
  },
});
// @ts-expect-error An unknown ID without an explicit source is a misspelled field.
productColumnHelper.column("actions", {});
// @ts-expect-error Explicit field paths are also checked.
productColumnHelper.column("alias", { field: "customer.nmae" });
// @ts-expect-error Field and computed sources are mutually exclusive.
productColumnHelper.column("total", {
  field: "price",
  getValue: (row: Product) => row.price,
});
// @ts-expect-error Display-only columns cannot also compute a value.
productColumnHelper.column("total", {
  field: null,
  getValue: (row: Product) => row.price,
});
// @ts-expect-error The ID cannot be overwritten in options.
productColumnHelper.column("price", { id: "other" });
// @ts-expect-error Even computed columns require an ID as the first argument.
productColumnHelper.column({ getValue: (row: Product) => row.price });
// @ts-expect-error Currency options stay required for explicit field aliases.
productColumnHelper.column("amount", { field: "price", type: "currency" });
// @ts-expect-error Currency options stay required for computed columns.
productColumnHelper.column("amount", {
  getValue: (row: Product) => row.price,
  type: "currency",
});

const doublePrice = (row: Product) => row.price * 2;
productColumnHelper.column("computedAfterRender", {
  render: (props, { getValue }) => {
    const value: number = getValue();
    // @ts-expect-error A separately typed computation preserves inference in any order.
    const _invalid: string = getValue();
    return <span {...props}>{value.toFixed(2)}</span>;
  },
  getValue: doublePrice,
});

// The public types enforce source exclusivity even without a helper.
export const plainSources: DataTableColumnProps<Item, string>[] = [
  { id: "name" },
  { id: "alias", field: "name" },
  { id: "computed", getValue: (row) => row.name },
  { id: "actions", field: null },
  // @ts-expect-error Field and computed sources cannot coexist on a plain column.
  { field: "name", getValue: (row: Item) => row.name },
  // @ts-expect-error A display-only source cannot also compute a value.
  { field: null, getValue: (row: Item) => row.name },
];

const conflictingSource = {
  field: "name" as const,
  getValue: (row: Item) => row.name,
};
// @ts-expect-error Non-literal objects cannot bypass source exclusivity.
export const invalidBaseSource: DataTableBaseColumnProps<Item, string> =
  conflictingSource;
// @ts-expect-error Named text columns also enforce exclusivity.
export const invalidTextSource: DataTableTextColumnProps<Item, string> =
  conflictingSource;
// @ts-expect-error Named number columns also enforce exclusivity.
export const invalidNumberSource: DataTableNumberColumnProps<Item> = {
  ...conflictingSource,
  type: "number",
};
// @ts-expect-error Named currency columns also enforce exclusivity.
export const invalidCurrencySource: DataTableCurrencyColumnProps<Item> = {
  ...conflictingSource,
  type: "currency",
  currency: "USD",
};
// @ts-expect-error Named percent columns also enforce exclusivity.
export const invalidPercentSource: DataTablePercentColumnProps<Item> = {
  ...conflictingSource,
  type: "percent",
};
// @ts-expect-error Named date columns also enforce exclusivity.
export const invalidDateSource: DataTableDateColumnProps<Item> = {
  ...conflictingSource,
  type: "date",
};
// @ts-expect-error Named datetime columns also enforce exclusivity.
export const invalidDateTimeSource: DataTableDateTimeColumnProps<Item> = {
  ...conflictingSource,
  type: "datetime",
};
// @ts-expect-error Named time columns also enforce exclusivity.
export const invalidTimeSource: DataTableTimeColumnProps<Item> = {
  ...conflictingSource,
  type: "time",
};
// @ts-expect-error Named duration columns also enforce exclusivity.
export const invalidDurationSource: DataTableDurationColumnProps<Item> = {
  ...conflictingSource,
  type: "duration",
};
// @ts-expect-error The columns boundary does not admit conflicting plain sources.
itemColumnHelper.columns([conflictingSource]);
export const conflictingSourceTable = (
  <DataTable<Item>
    // @ts-expect-error JSX input enforces exclusivity too.
    columns={[conflictingSource]}
    data={[]}
  />
);

// Reusing inferred columns must preserve their checked source/value relationship.
// @ts-expect-error An inferred field cannot be mutated after its renderer is checked.
priceColumn.field = "id";
// @ts-expect-error Computed sources cannot be removed in place.
computedColumn.getValue = undefined;
productColumnHelper.columns([
  // @ts-expect-error Spreading a column must not change its checked field path.
  { ...priceColumn, field: "id" },
]);
productColumnHelper.columns([
  {
    ...priceColumn,
    // @ts-expect-error A spread cannot replace a numeric renderer with a string renderer.
    render: (_props: unknown, { getValue }: { getValue: () => string }) => (
      <span>{getValue().toUpperCase()}</span>
    ),
  },
]);
productColumnHelper.columns([
  {
    ...priceColumn,
    // @ts-expect-error A spread header must retain the column value type too.
    header: (
      _props: unknown,
      { column }: DataTableHeaderContext<Product, string>,
    ) => <span>{column.id}</span>,
  },
]);
export const resizedPriceColumns = productColumnHelper.columns([
  { ...priceColumn, size: 200 },
  { ...nameColumn, header: "Customer name" },
]);

// Validation must distribute over arrays of columns with different value types.
const reusableColumnArray = [priceColumn, nameColumn, computedColumn];
export const reusedColumnArray =
  productColumnHelper.columns(reusableColumnArray);
const numericComputedColumn = productColumnHelper.column("computedPrice", {
  getValue: (row) => row.price,
});
export const updatedComputation = productColumnHelper.columns([
  { ...numericComputedColumn, getValue: (row: Product) => row.price * 2 },
]);
productColumnHelper.columns([
  {
    ...numericComputedColumn,
    // @ts-expect-error A reused computation must retain the checked result type.
    getValue: (row: Product) => row.id,
  },
]);
productColumnHelper.columns([
  {
    ...priceColumn,
    // @ts-expect-error Mixing in a contextual plain column cannot bypass validation.
    render: (_props: unknown, { getValue }: { getValue: () => string }) => (
      <span>{getValue().toUpperCase()}</span>
    ),
  },
  {
    field: "id",
    render: (props, { getValue }) => (
      <span {...props}>{String(getValue())}</span>
    ),
  },
]);
