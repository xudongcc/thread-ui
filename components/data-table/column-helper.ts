import type { ReactElement, ReactNode } from "react";
import type {
  DataTableColumnProps,
  DataTableField,
  DataTableFieldValue,
  DataTableRender,
  DataTableRenderProps,
} from "./types";

type Accessor<TData extends object> =
  DataTableField<TData> | ((row: TData, index: number) => unknown);

type AccessorValue<TData extends object, TAccessor> = TAccessor extends (
  ...args: never[]
) => infer TValue
  ? TValue
  : TAccessor extends string
    ? DataTableFieldValue<TData, TAccessor>
    : never;

// Distribute over the union to preserve each formatting type's own options.
type AccessorOptions<TColumn> = TColumn extends unknown
  ? Omit<TColumn, "field" | "getValue"> & {
      field?: never;
      getValue?: never;
    }
  : never;

// A heterogeneous list has no single TValue. Only validate the column shape
// here; each accessor call has already checked its render callback's value.
type ColumnInput<
  TData extends object,
  TColumn = DataTableColumnProps<TData>,
> = TColumn extends unknown
  ? Omit<TColumn, "header" | "render"> & {
      header?:
        | ReactNode
        | ((props: DataTableRenderProps, state: never) => ReactElement);
      render?: DataTableRender<never>;
    }
  : never;

/** Infer cell values from field paths or computed accessors without exposing the table engine. */
export function createDataTableColumnHelper<TData extends object>() {
  return {
    accessor<TAccessor extends Accessor<TData>>(
      accessor: TAccessor,
      options: AccessorOptions<
        DataTableColumnProps<TData, NoInfer<AccessorValue<TData, TAccessor>>>
      > &
        (TAccessor extends string ? { id?: string } : { id: string }),
    ): DataTableColumnProps<TData, AccessorValue<TData, TAccessor>> {
      return {
        ...options,
        ...(typeof accessor === "function"
          ? { getValue: accessor }
          : { field: accessor }),
      } as DataTableColumnProps<TData, AccessorValue<TData, TAccessor>>;
    },
    columns(columns: ColumnInput<TData>[]): DataTableColumnProps<TData>[] {
      // Erase individual value types only at the table boundary. The table
      // supplies each callback with the value from that same column's accessor.
      return columns as unknown as DataTableColumnProps<TData>[];
    },
  };
}
