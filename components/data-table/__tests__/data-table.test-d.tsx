import { DataTable } from "../index";

interface Item {
  id: string;
  name: string;
}

export const dataTableWithEmptyProp = (
  <DataTable<Item>
    columns={[{ id: "name", header: "Name", accessorKey: "name" }]}
    data={[]}
    empty={<div>No custom items</div>}
  />
);
