"use client";

import { useState } from "react";
import { DataFilter } from "@/components/thread-ui/data-filter";

export default function DataFilterSearchExample() {
  const [query, setQuery] = useState("");

  return (
    <div className="w-full space-y-4 rounded-lg border p-4">
      <DataFilter
        filters={[]}
        search={{
          value: query,
          placeholder: "Search documents...",
          onChange: setQuery,
        }}
      />

      <div className="bg-muted mt-4 rounded-md p-4 text-sm">
        <strong>Search Query:</strong> {query || "None"}
      </div>
    </div>
  );
}
