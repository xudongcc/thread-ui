import type { ReactElement, ReactNode } from "react";
import type {
  DataTableColumnProps,
  DataTableField,
  DataTableFieldValue,
  DataTableRender,
  DataTableRenderProps,
} from "./types";

// Distribute over the union to preserve each formatting type's own options.
type ColumnOptions<TColumn> = TColumn extends unknown
  ? Omit<TColumn, "field" | "getValue"> & {
      field?: never;
      getValue?: never;
    }
  : never;

// Only helper-built columns may erase their individual value types at the
// table boundary. Plain objects must satisfy the public unknown-value contract.
// A named string key keeps spread/destructured exports declaration-emittable.
// This marker exists only in types; column objects have no extra runtime keys.
export type DataTableInferredColumn<
  TData extends object,
  TValue,
> = DataTableColumnProps<TData, TValue> & { readonly "~dataTableColumn": true };

type InferredColumnInput<
  TData extends object,
  TColumn = DataTableColumnProps<TData>,
> = TColumn extends unknown
  ? Omit<TColumn, "header" | "render"> & {
      readonly "~dataTableColumn": true;
      header?:
        | ReactNode
        | ((props: DataTableRenderProps, state: never) => ReactElement);
      render?: DataTableRender<never>;
    }
  : never;

/** A reusable helper whose inferred return types can be emitted in declarations. */
export interface DataTableColumnHelper<TData extends object> {
  field<TField extends DataTableField<TData>>(
    field: TField,
    options: ColumnOptions<
      DataTableColumnProps<TData, NoInfer<DataTableFieldValue<TData, TField>>>
    >,
  ): DataTableInferredColumn<TData, DataTableFieldValue<TData, TField>>;
  getValue<TValue>(
    getValue: (row: TData, index: number) => TValue,
    options: ColumnOptions<DataTableColumnProps<TData, NoInfer<TValue>>> & {
      id: string;
    },
  ): DataTableInferredColumn<TData, TValue>;
  columns(
    columns: (
      | InferredColumnInput<TData>
      | (DataTableColumnProps<TData> & { "~dataTableColumn"?: never })
    )[],
  ): DataTableColumnProps<TData>[];
}

/** Infer cell values from field paths or computed values without exposing the table engine. */
export function createDataTableColumnHelper<
  TData extends object,
>(): DataTableColumnHelper<TData> {
  return {
    field(field, options) {
      return { ...options, field } as unknown as DataTableInferredColumn<
        TData,
        DataTableFieldValue<TData, typeof field>
      >;
    },
    getValue(getValue, options) {
      return { ...options, getValue } as unknown as DataTableInferredColumn<
        TData,
        ReturnType<typeof getValue>
      >;
    },
    columns(columns) {
      // The helper has checked each inferred callback against its own value.
      return columns as unknown as DataTableColumnProps<TData>[];
    },
  };
}
