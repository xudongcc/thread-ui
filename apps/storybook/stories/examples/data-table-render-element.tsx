import { userColumnHelper } from "./data-table-shared";
import type { DataTableRow } from "@/components/thread-ui/data-table";
import type { User } from "./data-table-shared";

export const renderElementColumns = userColumnHelper.columns([
  userColumnHelper.column("name", {
    header: <em>Name</em>,
    render: <strong />,
  }),
]);

export const profileRowActions = (row: DataTableRow<User>) => [
  { label: "View profile", render: <a href={`#person-${row.id}`} /> },
];
