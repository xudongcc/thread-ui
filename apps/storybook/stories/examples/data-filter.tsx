import { options } from "./data-filter-shared";
import type { DataFilterField } from "@/components/thread-ui/data-filter";

export const filters: DataFilterField[] = [
  {
    field: "name",
    label: "Name",
    type: "input",
    operators: ["$eq", "$ne", "$fulltext"],
  },
  {
    field: "amount",
    label: "Amount",
    type: "number-input",
    min: 0,
    decimalScale: 2,
    operators: ["$eq", "$gte", "$between"],
  },
  {
    field: "createdAt",
    label: "Created at",
    type: "date-picker",
    operators: ["$eq", "$between"],
  },
  { field: "published", label: "Published", type: "checkbox" },
  { field: "status", label: "Status", type: "select", options },
];
