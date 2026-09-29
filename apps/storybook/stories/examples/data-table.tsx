import { userColumnHelper } from "./data-table-shared";

export const columns = userColumnHelper.columns([
  userColumnHelper.column("name", { header: "Name" }),
  userColumnHelper.column("email", { header: "Email" }),
  userColumnHelper.column("role", { header: "Role" }),
]);
