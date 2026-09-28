import { data, userColumnHelper } from "./data-table-shared";
import { DataTable } from "@/components/thread-ui/data-table";

const inferredColumns = userColumnHelper.columns([
  userColumnHelper.column("displayName", {
    field: "name",
    header: "Name",
    render: (props, { getValue }) => (
      <strong {...props}>{getValue().toUpperCase()}</strong>
    ),
  }),
  userColumnHelper.column("contact", {
    getValue: (user) => `${user.name} <${user.email}>`,
    header: "Contact",
    render: (props, { getValue }) => <span {...props}>{getValue()}</span>,
  }),
  userColumnHelper.column("nameLength", {
    getValue: (user) => user.name.length,
    header: "Name length",
    type: "number",
    render: (props, { getValue }) => (
      <span {...props}>{getValue().toFixed(0)}</span>
    ),
  }),
  userColumnHelper.column("identity", {
    field: null,
    header: "Record",
    render: (props, { row }) => <span {...props}>User #{row.original.id}</span>,
  }),
]);

export function InferredValuesDataTableExample() {
  return <DataTable columns={inferredColumns} data={data} />;
}

InferredValuesDataTableExample.displayName = "InferredValuesDataTableExample";
