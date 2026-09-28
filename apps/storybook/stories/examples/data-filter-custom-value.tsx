import type { DataFilterField } from "@/components/thread-ui/data-filter";

export const customFilters: DataFilterField[] = [
  {
    field: "name",
    label: "Name",
    type: "input",
    renderValue: ({ value }) => <strong>{String(value)}</strong>,
  },
];
