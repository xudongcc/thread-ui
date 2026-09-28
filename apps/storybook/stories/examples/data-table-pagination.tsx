import { useState } from "react";
import { data } from "./data-table-shared";
import type { ComponentProps } from "react";
import type { User } from "./data-table-shared";
import { DataTable } from "@/components/thread-ui/data-table";

export function PaginationDataTableExample(
  args: ComponentProps<typeof DataTable<User>>,
) {
  const [page, setPage] = useState(0);
  return (
    <div className="space-y-3">
      <DataTable
        {...args}
        data={data.slice(page * 2, page * 2 + 2)}
        pagination={{
          hasPreviousPage: page > 0,
          hasNextPage: page < 1,
          onPreviousPage: () => setPage(page - 1),
          onNextPage: () => setPage(page + 1),
        }}
      />
      <output>Page {page + 1} of 2</output>
    </div>
  );
}

PaginationDataTableExample.displayName = "PaginationDataTableExample";
