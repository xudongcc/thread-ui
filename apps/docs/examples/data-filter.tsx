"use client";

import { useState } from "react";
import type {
  DataFilterItemProps,
  DataFilterValues,
} from "@/components/thread-ui/data-filter";
import { DataFilter } from "@/components/thread-ui/data-filter";
import { Input } from "@/components/ui/input";

export default function DataFilterExample() {
  const [values, setValues] = useState<DataFilterValues>({});

  const filters: DataFilterItemProps[] = [
    {
      field: "status",
      label: "Status",
      pinned: true,
      render: ({ field: { value, onChange } }) => (
        <div className="w-48 p-2">
          <Input
            placeholder="Filter by status..."
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      ),
    },
    {
      field: "category",
      label: "Category",
      render: ({ field: { value, onChange } }) => (
        <div className="w-48 p-2">
          <Input
            placeholder="Filter by category..."
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      ),
    },
  ];

  return (
    <div className="w-full space-y-4 rounded-lg border p-4">
      <DataFilter
        filters={filters}
        values={values}
        search={{
          placeholder: "Search anything...",
          onChange: (val) => console.log("Search:", val),
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
          selected: { field: "createdAt", direction: "DESC" },
          onChange: (val) => console.log("Sort:", val),
        }}
        onChange={setValues}
      />

      <div className="bg-muted mt-4 rounded-md p-4 text-sm">
        <strong>Current Values:</strong>
        <pre>{JSON.stringify(values, null, 2)}</pre>
      </div>
    </div>
  );
}
