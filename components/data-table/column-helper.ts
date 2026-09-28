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
// Type-only marker: column objects remain plain, serializable configuration.
declare const inferredColumn: unique symbol;
type InferredColumn<TData extends object, TValue> = DataTableColumnProps<
  TData,
  TValue
> & { readonly [inferredColumn]: true };

type InferredColumnInput<
  TData extends object,
  TColumn = DataTableColumnProps<TData>,
> = TColumn extends unknown
  ? Omit<TColumn, "header" | "render"> & {
      readonly [inferredColumn]: true;
      header?:
        | ReactNode
        | ((props: DataTableRenderProps, state: never) => ReactElement);
      render?: DataTableRender<never>;
    }
  : never;

/** Infer cell values from field paths or computed values without exposing the table engine. */
export function createDataTableColumnHelper<TData extends object>() {
  return {
    field<TField extends DataTableField<TData>>(
      field: TField,
      options: ColumnOptions<
        DataTableColumnProps<TData, NoInfer<DataTableFieldValue<TData, TField>>>
      >,
    ): InferredColumn<TData, DataTableFieldValue<TData, TField>> {
      return { ...options, field } as unknown as InferredColumn<
        TData,
        DataTableFieldValue<TData, TField>
      >;
    },
    getValue<TValue>(
      getValue: (row: TData, index: number) => TValue,
      options: ColumnOptions<DataTableColumnProps<TData, NoInfer<TValue>>> & {
        id: string;
      },
    ): InferredColumn<TData, TValue> {
      return { ...options, getValue } as unknown as InferredColumn<
        TData,
        TValue
      >;
    },
    columns(
      columns: (
        | InferredColumnInput<TData>
        | (DataTableColumnProps<TData> & { [inferredColumn]?: never })
      )[],
    ): DataTableColumnProps<TData>[] {
      // The helper has checked each inferred callback against its own value.
      return columns as unknown as DataTableColumnProps<TData>[];
    },
  };
}
