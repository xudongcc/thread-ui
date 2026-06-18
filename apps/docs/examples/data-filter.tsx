"use client";

import { useState } from "react";
import type {
  DataFilterItemProps,
  DataFilterValue,
} from "@/components/thread-ui/data-filter";
import { DataFilter } from "@/components/thread-ui/data-filter";

export default function DataFilterExample() {
  const [value, setValue] = useState<DataFilterValue>({
    filter: {
      amount: {
        $gte: 2450.75,
      },
      age: {
        $between: [18, 30],
      },
      createdAt: {
        $between: ["2025-03-01T00:00:00.000Z", "2025-03-15T00:00:00.000Z"],
      },
      customer: {
        $fulltext: "Acme",
      },
      archived: {
        $eq: true,
      },
      tags: {
        $in: ["cloudflare", "vector-database", "llm"],
      },
    },
    orderBy: { field: "createdAt", direction: "DESC" },
    query: "Acme",
  });

  const filters: DataFilterItemProps[] = [
    {
      defaultOperator: "$fulltext",
      field: "customer",
      label: "Customer",
      operators: ["$eq", "$ne", "$fulltext"],
      placeholder: "Filter by customer...",
      type: "input",
    },
    {
      decimalScale: 2,
      defaultOperator: "$gte",
      field: "amount",
      label: "Amount",
      max: 10000,
      min: 0,
      operators: ["$eq", "$ne", "$gt", "$gte", "$lt", "$lte"],
      placeholder: "Filter by amount...",
      step: 0.01,
      type: "number-input",
    },
    {
      defaultOperator: "$between",
      field: "age",
      label: "Age",
      max: 120,
      min: 0,
      operators: ["$eq", "$ne", "$gt", "$gte", "$lt", "$lte", "$between"],
      step: 1,
      type: "number-input",
    },
    {
      defaultOperator: "$between",
      field: "createdAt",
      label: "Created At",
      max: new Date("2026-12-31"),
      min: new Date("2024-01-01"),
      operators: ["$eq", "$ne", "$gt", "$gte", "$lt", "$lte", "$between"],
      placeholder: "Pick a date",
      type: "date-picker",
    },
    {
      defaultOperator: "$eq",
      field: "archived",
      label: "Archived",
      operators: ["$eq", "$ne"],
      type: "checkbox",
    },
    {
      defaultOperator: "$in",
      field: "tags",
      label: "Tags",
      operators: ["$in", "$nin"],
      options: [
        { label: "Cloudflare", value: "cloudflare" },
        { label: "Vector Database", value: "vector-database" },
        { label: "LLM", value: "llm" },
        { label: "AI", value: "ai" },
        { label: "Nvidia", value: "nvidia" },
        { label: "Grafana", value: "grafana" },
        { label: "Prometheus", value: "prometheus" },
        { label: "Redis", value: "redis" },
        { label: "ClickHouse", value: "clickhouse" },
        { label: "Kubernetes", value: "kubernetes" },
        { label: "GitHub Actions", value: "github-actions" },
      ],
      type: "select",
    },
  ];

  return (
    <div className="max-h-full w-full space-y-4 overflow-y-auto rounded-lg border p-4">
      <DataFilter
        filters={filters}
        value={value}
        search={{
          placeholder: "Search anything...",
        }}
        sort={{
          options: [
            {
              field: "createdAt",
              fieldLabel: "Created At",
              direction: "DESC",
              directionLabel: "Newest first",
            },
            {
              field: "createdAt",
              fieldLabel: "Created At",
              direction: "ASC",
              directionLabel: "Oldest first",
            },
          ],
        }}
        onChange={setValue}
      />

      <div className="bg-muted mt-4 rounded-md p-4 text-sm">
        <strong>Current Value:</strong>
        <pre>{JSON.stringify(value, null, 2)}</pre>
      </div>
    </div>
  );
}
