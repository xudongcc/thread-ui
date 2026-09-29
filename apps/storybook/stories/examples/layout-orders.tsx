import { useState } from "react";
import { LayoutExample } from "./layout";
import type { LayoutProps } from "@/components/thread-ui/layout";
import type {
  DataFilterConditionValue,
  DataFilterField,
  DataFilterValue,
} from "@/components/thread-ui/data-filter";
import { Button } from "@/components/thread-ui/button";
import {
  Page,
  PageActions,
  PageContent,
  PageDescription,
  PageHeader,
  PagePrimaryAction,
  PageSecondaryAction,
  PageTitle,
} from "@/components/thread-ui/page";
import {
  DataTable,
  createDataTableColumnHelper,
} from "@/components/thread-ui/data-table";
import { DataFilter } from "@/components/thread-ui/data-filter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/thread-ui/badge";

type Order = {
  id: string;
  customer: string;
  email: string;
  status: "Unfulfilled" | "Fulfilled";
  total: number;
};

const initialOrders: Order[] = Array.from({ length: 24 }, (_, index) => ({
  id: String(1001 + index),
  customer: ["Alice Johnson", "Bob Smith", "Charlie Brown", "Diana Prince"][
    index % 4
  ],
  email: [
    "alice@example.com",
    "bob@example.com",
    "charlie@example.com",
    "diana@example.com",
  ][index % 4],
  status: index % 3 === 0 ? "Unfulfilled" : "Fulfilled",
  total: 48 + index * 12.5,
}));

const orderColumnHelper = createDataTableColumnHelper<Order>();

const orderColumns = orderColumnHelper.columns([
  orderColumnHelper.column("id", {
    header: "Order",
    size: 100,
    render: (props, { getValue }) => (
      <span {...props} className="font-medium">
        #{getValue()}
      </span>
    ),
  }),
  orderColumnHelper.column("customer", {
    header: "Customer",
    size: 220,
    render: (props, { getValue, row }) => (
      <div {...props} className="space-y-1">
        <div className="font-medium">{getValue()}</div>
        <div className="text-muted-foreground text-xs">
          {row.original.email}
        </div>
      </div>
    ),
  }),
  orderColumnHelper.column("status", {
    header: "Fulfillment",
    size: 150,
    render: (props, { getValue }) => (
      <Badge {...props} color={getValue() === "Fulfilled" ? "green" : "amber"}>
        {getValue()}
      </Badge>
    ),
  }),
  orderColumnHelper.column("total", {
    header: "Total",
    size: 110,
    render: (props, { getValue }) => (
      <span {...props} className="tabular-nums">
        ${getValue().toFixed(2)}
      </span>
    ),
  }),
]);

const orderFilters: DataFilterField[] = [
  {
    field: "status",
    label: "Fulfillment",
    type: "select",
    operators: ["$in"],
    options: [
      { label: "Unfulfilled", value: "Unfulfilled" },
      { label: "Fulfilled", value: "Fulfilled" },
    ],
  },
  {
    field: "total",
    label: "Amount",
    type: "number-input",
    min: 0,
    decimalScale: 2,
    operators: ["$gte", "$lte", "$eq"],
  },
];

const emptyOrderFilter: DataFilterValue = { query: "", filter: {} };

function OrdersPage() {
  const [orders, setOrders] = useState(initialOrders);
  const [filterRevision, setFilterRevision] = useState(0);
  const [filterValue, setFilterValue] =
    useState<DataFilterValue>(emptyOrderFilter);
  const [pageIndex, setPageIndex] = useState(0);
  const [selected, setSelected] = useState<Order[]>([]);
  const [revision, setRevision] = useState(0);
  const pageSize = 8;
  const filtered = orders.filter((order) => {
    const status = filterValue.filter.status as
      DataFilterConditionValue | undefined;
    const total = filterValue.filter.total as
      DataFilterConditionValue | undefined;
    const statuses = status?.$in;
    return (
      `${order.id} ${order.customer} ${order.email}`
        .toLowerCase()
        .includes(filterValue.query.trim().toLowerCase()) &&
      (!Array.isArray(statuses) ||
        statuses.length === 0 ||
        statuses.includes(order.status)) &&
      (typeof total?.$gte !== "number" || order.total >= total.$gte) &&
      (typeof total?.$lte !== "number" || order.total <= total.$lte) &&
      (typeof total?.$eq !== "number" || order.total === total.$eq)
    );
  });
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(pageIndex, pageCount - 1);
  const visibleOrders = filtered.slice(
    currentPage * pageSize,
    (currentPage + 1) * pageSize,
  );
  const resetSelection = () => {
    setSelected([]);
    setRevision((value) => value + 1);
  };
  const changePage = (next: number) => {
    setPageIndex(next);
    resetSelection();
  };

  return (
    <Page className="max-w-6xl min-w-0" variant="full">
      <PageHeader>
        <PageTitle aria-level={1}>Orders</PageTitle>
        <PageDescription>
          Manage orders, review customers, and track fulfillment.
        </PageDescription>
        <PageActions>
          <PagePrimaryAction
            onClick={() => {
              const id = String(
                Math.max(...orders.map((order) => Number(order.id))) + 1,
              );
              setOrders([
                {
                  id,
                  customer: "New customer",
                  email: "customer@example.com",
                  status: "Unfulfilled",
                  total: 0,
                },
                ...orders,
              ]);
              setFilterValue(emptyOrderFilter);
              setFilterRevision((value) => value + 1);
              changePage(0);
            }}
          >
            Create order
          </PagePrimaryAction>
          <PageSecondaryAction
            onAction={() => {
              setFilterValue(emptyOrderFilter);
              setFilterRevision((value) => value + 1);
              changePage(0);
            }}
          >
            Reset filters
          </PageSecondaryAction>
        </PageActions>
      </PageHeader>
      <PageContent className="min-w-0">
        <Card>
          <CardContent>
            <div className="flex flex-col gap-2">
              <DataFilter
                key={`filters-${filterRevision}`}
                filters={orderFilters}
                value={filterValue}
                search={{
                  "aria-label": "Search orders",
                  placeholder: "Order number, customer, or email",
                }}
                onChange={(value) => {
                  setFilterValue(value);
                  changePage(0);
                }}
              />
              <DataTable
                // DataTable owns selection; remount when filters/pages change to clear it.
                key={`table-${revision}`}
                columns={orderColumns}
                data={visibleOrders}
                getRowId={(order) => order.id}
                bulkActions={
                  <Button
                    size="xs"
                    variant="outline"
                    onClick={() => {
                      const ids = new Set(selected.map((order) => order.id));
                      setOrders((current) =>
                        current.map((order) =>
                          ids.has(order.id)
                            ? { ...order, status: "Fulfilled" }
                            : order,
                        ),
                      );
                      resetSelection();
                    }}
                  >
                    Mark fulfilled
                  </Button>
                }
                pagination={{
                  hasPreviousPage: currentPage > 0,
                  hasNextPage: currentPage < pageCount - 1,
                  onPreviousPage: () => changePage(currentPage - 1),
                  onNextPage: () => changePage(currentPage + 1),
                }}
                onRowSelectionChange={setSelected}
              />
            </div>
          </CardContent>
        </Card>
      </PageContent>
    </Page>
  );
}

export function LayoutOrdersExample(args: LayoutProps) {
  return (
    <LayoutExample {...args} initialPage="orders">
      <OrdersPage />
    </LayoutExample>
  );
}

LayoutOrdersExample.displayName = "LayoutOrdersExample";
