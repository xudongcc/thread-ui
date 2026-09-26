"use client";

import type { DataTableColumnProps } from "@/components/thread-ui/data-table";
import { DataTable } from "@/components/thread-ui/data-table";

interface Order {
  id: string;
  quantity: number;
  total: number;
  rate: number;
  date: string;
  createdAt: string;
  elapsed: number;
}

const columns: DataTableColumnProps<Order>[] = [
  { field: "id", header: "Order" },
  { field: "quantity", header: "Quantity", type: "number", precision: 0 },
  { field: "total", header: "Total", type: "currency", currency: "USD" },
  { field: "rate", header: "Rate", type: "percent", precision: 1 },
  { field: "elapsed", header: "Duration", type: "duration", unit: "seconds" },
  { field: "date", header: "Date", type: "date", locale: "en-GB" },
  {
    field: "createdAt",
    header: "Created (Shanghai)",
    type: "datetime",
    locale: "zh-CN",
  },
  {
    id: "createdAtNewYork",
    field: "createdAt",
    header: "Time (New York)",
    type: "time",
    hour12: false,
    timeZone: "America/New_York",
  },
];

const data: Order[] = [
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

export default function Example() {
  return (
    <DataTable
      columns={columns}
      data={data}
      locale="en-US"
      timeZone="Asia/Shanghai"
    />
  );
}
