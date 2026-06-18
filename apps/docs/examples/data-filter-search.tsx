"use client";

import { useState } from "react";
import type { DataFilterValue } from "@/components/thread-ui/data-filter";
import { DataFilter } from "@/components/thread-ui/data-filter";

export default function DataFilterSearchExample() {
  const [value, setValue] = useState<DataFilterValue>({
    filter: {},
    query: "",
  });

  return (
    <div className="w-full space-y-4 rounded-lg border p-4">
      <DataFilter
        filters={[]}
        value={value}
        search={{
          placeholder: "Search documents...",
        }}
        onChange={setValue}
      />

      <div className="bg-muted mt-4 rounded-md p-4 text-sm">
        <strong>Search Query:</strong> {value.query || "None"}
      </div>
    </div>
  );
}
