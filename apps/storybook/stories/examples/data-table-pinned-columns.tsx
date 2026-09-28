import { columns } from "./data-table";

export const pinnedColumns = columns.map((column, index) => ({
  ...column,
  size: 400,
  pinned: index === 0 ? ("left" as const) : (false as const),
}));
