import { options } from "./data-filter-shared";
import type { DataFilterField } from "@/components/thread-ui/data-filter";

export const asyncFilters = [
  {
    field: "status",
    label: "Status",
    type: "select",
    options: async (query) => {
      await new Promise((resolve) => setTimeout(resolve, 200));
      return options.filter((option) =>
        option.label.toLowerCase().includes(query.toLowerCase()),
      );
    },
    resolveSelectedOptions: async (values) =>
      options.filter((option) => values.includes(option.value)),
  },
] satisfies DataFilterField[];
