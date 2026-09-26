import { DataTable } from "../index";
import type { DataTableColumnProps } from "../index";

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
