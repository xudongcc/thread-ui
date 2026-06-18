"use client";

import { useState } from "react";
import type { DataFilterValue } from "@/components/thread-ui/data-filter";
import { DataFilter } from "@/components/thread-ui/data-filter";

export default function DataFilterSortExample() {
  const [value, setValue] = useState<DataFilterValue>({
    filter: {},
    orderBy: {
      field: "createdAt",
      direction: "DESC",
    },
    query: "",
  });

  return (
    <div className="w-full space-y-4 rounded-lg border p-4">
      <DataFilter
        filters={[]}
        value={value}
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
        }}
        onChange={setValue}
      />

      <div className="bg-muted mt-4 rounded-md p-4 text-sm">
        <strong>Current Sort:</strong>
        <pre>{JSON.stringify(value.orderBy, null, 2)}</pre>
      </div>
    </div>
  );
}
