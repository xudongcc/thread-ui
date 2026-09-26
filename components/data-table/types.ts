import type { HTMLProps } from "@base-ui/react/types";
import type { ReactElement, ReactNode } from "react";

/** Base UI DOM props, including the ref and composed event handlers. */
export type DataTableRenderProps = HTMLProps;

export type DataTableRender<TState> =
  ReactElement | ((props: DataTableRenderProps, state: TState) => ReactElement);

export interface DataTableRowActionState<TData extends object> {
  row: DataTableRow<TData>;
  disabled: boolean;
  highlighted: boolean;
}

/** A row exposed to consumers, independent of the internal table engine. */
export interface DataTableRow<TData extends object> {
  readonly id: string;
  readonly index: number;
  readonly original: TData;
}

export interface DataTableHeaderContext<
  TData extends object,
  TValue = unknown,
> {
  column: DataTableColumnProps<TData, TValue>;
}

export interface DataTableCellContext<
  TData extends object,
  TValue = unknown,
> extends DataTableHeaderContext<TData, TValue> {
  row: DataTableRow<TData>;
  getValue: () => TValue;
}

/** Thread UI column options. Table-engine-specific options are intentionally private. */
export interface DataTableColumnProps<TData extends object, TValue = unknown> {
  id?: string;
  /** Object key or dotted path. When omitted, id is used as the accessor. */
  accessorKey?: string;
  accessorFn?: (row: TData, index: number) => TValue;
  header?: ReactNode;
  /** Replaces the content element inside th; forward props to your element. */
  headerRender?: DataTableRender<DataTableHeaderContext<TData, TValue>>;
  /** Replaces the content element inside td; forward props to your element. */
  render?: DataTableRender<DataTableCellContext<TData, TValue>>;
  size?: number;
  minSize?: number;
  maxSize?: number;
  pinned?: "left" | "right" | false;
}

export interface DataTablePaginationProps {
  hasPreviousPage?: boolean;
  hasNextPage?: boolean;
  onPreviousPage?: () => void;
  onNextPage?: () => void;
}

export interface DataTableRowActionProps<TData extends object> {
  disabled?: boolean;
  icon?: ReactElement;
  label: string;
  render?: DataTableRender<DataTableRowActionState<TData>>;
  onClick?: (row: DataTableRow<TData>) => Promise<void> | void;
}

export interface DataTableProps<TData extends object, TValue = unknown> {
  columns: Array<DataTableColumnProps<TData, TValue>>;
  data: Array<TData>;
  rowActions?: (
    row: DataTableRow<TData>,
  ) => Array<DataTableRowActionProps<TData>>;
  pagination?: DataTablePaginationProps;
  onRowSelectionChange?: (rows: Array<TData>) => void;
  onAllRowsSelectedChange?: (selected: boolean) => void;
  bulkActions?: ReactNode;
  empty?: ReactNode;
  getRowId?: (row: TData, index: number) => string;
  onRowClick?: (row: DataTableRow<TData>) => void;
}
