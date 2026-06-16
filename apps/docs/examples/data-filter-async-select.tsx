"use client";

import { useState } from "react";
import type {
  DataFilterItemProps,
  DataFilterSelectOption,
  DataFilterValues,
} from "@/components/thread-ui/data-filter";
import { DataFilter } from "@/components/thread-ui/data-filter";

const tagOptions: Array<DataFilterSelectOption> = [
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
  { label: "Semantic Release", value: "semantic-release" },
  { label: "PostgreSQL", value: "postgresql" },
  { label: "GraphQL", value: "graphql" },
];

const loadTagOptions = async (
  query: string,
): Promise<Array<DataFilterSelectOption>> => {
  await new Promise<void>((resolve) => {
    setTimeout(resolve, 350);
  });

  const keyword = query.trim().toLowerCase();

  if (!keyword) {
    return tagOptions.slice(0, 8);
  }

  return tagOptions
    .filter((option) => {
      return option.label.toLowerCase().includes(keyword);
    })
    .slice(0, 8);
};

const filters: Array<DataFilterItemProps> = [
  {
    defaultOperator: "$in",
    field: "tags",
    label: "Tags",
    options: loadTagOptions,
    placeholder: "Search tags...",
    type: "select",
  },
];

export default function DataFilterAsyncSelectExample() {
  const [values, setValues] = useState<DataFilterValues>({
    tags: {
      $in: ["cloudflare", "llm"],
    },
  });

  return (
    <div className="max-h-full w-full space-y-4 overflow-y-auto rounded-lg border p-4">
      <DataFilter filters={filters} values={values} onChange={setValues} />

      <div className="bg-muted mt-4 rounded-md p-4 text-sm">
        <strong>Current Values:</strong>
        <pre>{JSON.stringify(values, null, 2)}</pre>
      </div>
    </div>
  );
}
