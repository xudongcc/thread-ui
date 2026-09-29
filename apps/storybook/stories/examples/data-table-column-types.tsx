import {
  DataTable,
  createDataTableColumnHelper,
} from "@/components/thread-ui/data-table";

interface Order {
  id: string;
  quantity: number;
  total: number;
  rate: number;
  date: string;
  createdAt: string;
  elapsed: number;
}

const orderColumnHelper = createDataTableColumnHelper<Order>();

const typedColumns = orderColumnHelper.columns([
  orderColumnHelper.column("id", { header: "Order" }),
  orderColumnHelper.column("quantity", {
    header: "Quantity",
    type: "number",
    precision: 0,
  }),
  orderColumnHelper.column("total", {
    header: "Total",
    type: "currency",
    currency: "USD",
  }),
  orderColumnHelper.column("rate", {
    header: "Rate",
    type: "percent",
    precision: 1,
  }),
  orderColumnHelper.column("elapsed", {
    header: "Duration",
    type: "duration",
    unit: "seconds",
  }),
  orderColumnHelper.column("date", {
    header: "Date",
    type: "date",
    locale: "en-GB",
  }),
  orderColumnHelper.column("createdAt", {
    header: "Created (Shanghai)",
    type: "datetime",
    locale: "zh-CN",
  }),
  orderColumnHelper.column("createdAtNewYork", {
    field: "createdAt",
    header: "Time (New York)",
    type: "time",
    hour12: false,
    timeZone: "America/New_York",
  }),
]);

const typedData: Order[] = [
  {
    id: "#1001",
    quantity: 1200,
    total: 1234.5,
    rate: 0.125,
    date: "2026-01-01",
    createdAt: "2026-01-01T01:00:00Z",
    elapsed: 3661,
  },
  {
    id: "#1002",
    quantity: 0,
    total: 0,
    rate: 0,
    date: "2026-01-02",
    createdAt: "2026-01-02T16:30:00Z",
    elapsed: 90.5,
  },
];

export function TypedColumnsDataTableExample() {
  return (
    <DataTable
      columns={typedColumns}
      data={typedData}
      locale="en-US"
      timeZone="Asia/Shanghai"
    />
  );
}

TypedColumnsDataTableExample.displayName = "TypedColumnsDataTableExample";
