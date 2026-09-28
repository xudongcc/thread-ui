import { useState } from "react";
import { fn } from "storybook/test";
import type { ComponentProps } from "react";
import type { User } from "./data-table-shared";
import { DataTable } from "@/components/thread-ui/data-table";
import { Button } from "@/components/thread-ui/button";

export function RowSelectionDataTableExample(
  args: ComponentProps<typeof DataTable<User>>,
) {
  const [selected, setSelected] = useState<User[]>([]);
  return (
    <div className="space-y-3">
      <DataTable
        {...args}
        bulkActions={
          <Button size="xs" variant="outline" onClick={fn()}>
            Export selected
          </Button>
        }
        onRowSelectionChange={setSelected}
      />
      <output aria-label="Selected people">
        {selected.map((row) => row.name).join(", ") || "None"}
      </output>
    </div>
  );
}

RowSelectionDataTableExample.displayName = "RowSelectionDataTableExample";
