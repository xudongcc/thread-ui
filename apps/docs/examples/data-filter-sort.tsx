"use client";

import { useState } from "react";
import type { DataFilterSortValue } from "@/components/thread-ui/data-filter";
import { DataFilter } from "@/components/thread-ui/data-filter";

export default function DataFilterSortExample() {
  const [sort, setSort] = useState<DataFilterSortValue>({
    field: "createdAt",
    direction: "DESC",
  });

  return (
    <div className="w-full space-y-4 rounded-lg border p-4">
      <DataFilter
        filters={[]}
        search={{
          placeholder: "Search with sort...",
        }}
        sort={{
          options: [
            {
              field: "createdAt",
              fieldLabel: "Created Date",
              direction: "DESC",
              directionLabel: "Newest first",
            },
            {
              field: "createdAt",
              fieldLabel: "Created Date",
              direction: "ASC",
              directionLabel: "Oldest first",
            },
            {
              field: "name",
              fieldLabel: "Alphabetical",
              direction: "ASC",
              directionLabel: "A-Z",
            },
            {
              field: "name",
              fieldLabel: "Alphabetical",
              direction: "DESC",
              directionLabel: "Z-A",
            },
          ],
          selected: sort,
          onChange: setSort,
        }}
      />

      <div className="bg-muted mt-4 rounded-md p-4 text-sm">
        <strong>Current Sort:</strong>
        <pre>{JSON.stringify(sort, null, 2)}</pre>
      </div>
    </div>
  );
}
