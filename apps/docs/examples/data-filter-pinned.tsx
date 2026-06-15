"use client";

import { useState } from "react";
import type {
  DataFilterItemProps,
  DataFilterValues,
} from "@/components/thread-ui/data-filter";
import { DataFilter } from "@/components/thread-ui/data-filter";
import { Input } from "@/components/ui/input";

export default function DataFilterPinnedExample() {
  const [values, setValues] = useState<DataFilterValues>({ status: "active" });

  const filters: DataFilterItemProps[] = [
    {
      field: "status",
      label: "Status",
      pinned: true,
      render: ({ field: { value, onChange } }) => (
        <div className="min-w-48 p-2">
          <Input
            placeholder="e.g. active, archived..."
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
          />
        </div>
      ),
    },
    {
      field: "author",
      label: "Author",
      pinned: true,
      render: ({ field: { value, onChange } }) => (
        <div className="min-w-48 p-2">
          <Input
            placeholder="Search author..."
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
        search={false}
        values={values}
        onChange={setValues}
      />
    </div>
  );
}
