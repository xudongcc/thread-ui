import { userColumnHelper } from "./data-table-shared";

export const hiddenColumns = userColumnHelper.columns([
  userColumnHelper.column("name", { header: "Name" }),
  userColumnHelper.column("email", { header: "Email", hidden: true }),
  userColumnHelper.column("role", { header: "Role" }),
]);
