import { userColumnHelper } from "./data-table-shared";

export const customCellColumns = userColumnHelper.columns([
  userColumnHelper.column("contact", {
    getValue: (person) => `${person.name} <${person.email}>`,
    header: "Contact",
    render: (props, { getValue }) => <strong {...props}>{getValue()}</strong>,
  }),
]);
