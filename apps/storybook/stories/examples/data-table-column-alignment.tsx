import { userColumnHelper } from "./data-table-shared";

export const alignedColumns = userColumnHelper.columns([
  userColumnHelper.column("name", { header: "Name" }),
  userColumnHelper.column("role", { header: "Role", align: "center" }),
  userColumnHelper.column("id", { header: "ID", align: "right" }),
]);
