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

export const dataTableWithUnsupportedLocaleProp = (
  <DataTable<Item>
    columns={[{ id: "name", header: "Name", accessorKey: "name" }]}
    data={[]}
    // @ts-expect-error locale is provided by AppProvider.
    locale="zh"
  />
);

export const dataTableWithPublicContexts = (
  <DataTable<Item, string>
    data={[]}
    columns={[
      {
        id: "name",
        accessorFn: (item) => item.name,
        render: (props, { getValue, row }) => {
          const value: string = getValue();
          // @ts-expect-error Internal table methods are not public API.
          row.getIsSelected();
          return <span {...props}>{value}</span>;
        },
        // @ts-expect-error Engine-specific options are not public API.
        enableSorting: true,
      },
    ]}
  />
);
