"use client";

import { useRender } from "@base-ui/react/use-render";
import {
  columnPinningFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  flexRender,
  rowSelectionFeature,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import type {
  Column,
  ColumnDef,
  Row,
  RowSelectionState,
} from "@tanstack/react-table";
import type { CSSProperties, ReactNode } from "react";
import type {
  DataTableProps,
  DataTableRender,
  DataTableRow,
  DataTableRowActionProps,
} from "./types";

import { Empty } from "@/components/thread-ui/empty";
import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

export type * from "./types";

// Keep table structure/pinning outside the replaceable content element.
function RenderContent<TState extends Record<string, unknown>>({
  render,
  state,
  children,
}: {
  render?: DataTableRender<TState>;
  state: TState;
  children?: ReactNode;
}) {
  return useRender({
    defaultTagName: "span",
    render:
      typeof render === "function"
        ? (props, { context }) => render(props, context)
        : render,
    state: { context: state },
    // Row data and functions belong to the render context, never DOM attributes.
    stateAttributesMapping: { context: () => null },
    props: { children },
  });
}

function RowActionItem<TData extends object>({
  action,
  row,
}: {
  action: DataTableRowActionProps<TData>;
  row: DataTableRow<TData>;
}) {
  const { render } = action;
  return (
    <DropdownMenuItem
      disabled={action.disabled}
      render={
        typeof render === "function"
          ? (props, state) =>
              render(props, {
                row,
                disabled: state.disabled,
                highlighted: state.highlighted,
              })
          : render
      }
      onClick={action.onClick ? () => action.onClick?.(row) : undefined}
    >
      {action.icon}
      {action.label}
    </DropdownMenuItem>
  );
}

const features = tableFeatures({
  columnPinningFeature,
  columnSizingFeature,
  columnVisibilityFeature,
  rowSelectionFeature,
});

type InternalColumn<TData extends object> = ColumnDef<
  typeof features,
  TData
> & {
  pinned?: "left" | "right" | false;
};

function publicRow<TData extends object>(
  row: Row<typeof features, TData>,
): DataTableRow<TData> {
  return { id: row.id, index: row.index, original: row.original };
}

function getCommonPinningClassNames<TData extends object>(
  column: Column<typeof features, TData>,
): string {
  const isPinned = column.getIsPinned();
  return cn(
    "w-(--column-width)",
    isPinned ? "sticky z-1" : "relative z-0",
    isPinned === "start" && "left-(--column-offset)",
    isPinned === "end" && "right-(--column-offset)",
  );
}

export function DataTable<TData extends object, TValue = unknown>({
  columns,
  data,
  pagination,
  bulkActions,
  empty,
  onRowSelectionChange,
  onAllRowsSelectedChange,
  getRowId = (row, index) =>
    (typeof row === "object" &&
    row !== null &&
    "id" in row &&
    (typeof row.id === "string" || typeof row.id === "number")
      ? row.id
      : index
    ).toString(),
  rowActions,
  onRowClick,
}: DataTableProps<TData, TValue>) {
  const { t } = useTranslation("thread-ui");
  const hasRowSelection = !!onRowSelectionChange;
  const hasRowActions = !!rowActions;

  const processedColumns = useMemo(() => {
    return [
      ...(hasRowSelection
        ? [
            {
              id: "$select",
              header: ({ table }) => (
                <Checkbox
                  aria-label={t("dataTable.selectAllRows")}
                  checked={table.getIsAllPageRowsSelected()}
                  onCheckedChange={(value) =>
                    table.toggleAllPageRowsSelected(!!value)
                  }
                />
              ),
              cell: ({ row }) => (
                <Checkbox
                  aria-label={t("dataTable.selectRow")}
                  checked={row.getIsSelected()}
                  onCheckedChange={(value) => row.toggleSelected(!!value)}
                  onClick={(event) => event.stopPropagation()}
                />
              ),
              enableHiding: false,
              size: 32,
              pinned: "left",
            } satisfies InternalColumn<TData>,
          ]
        : []),
      ...columns.map((column, index): InternalColumn<TData> => ({
        id: column.id ?? column.accessorKey ?? `column_${index}`,
        accessorKey: column.accessorKey ?? column.id,
        accessorFn: column.accessorFn,
        size: column.size,
        minSize: column.minSize,
        maxSize: column.maxSize,
        pinned: column.pinned,
        header: () =>
          typeof column.header === "function" ? (
            <RenderContent render={column.header} state={{ column }} />
          ) : (
            column.header
          ),
        cell: (context) => (
          <RenderContent
            render={column.render}
            state={{
              column,
              row: publicRow(context.row),
              getValue: () => context.getValue<TValue>(),
            }}
          >
            {context.getValue() == null ? null : String(context.getValue())}
          </RenderContent>
        ),
      })),
      ...(hasRowActions
        ? [
            {
              id: "$actions",
              header: () => (
                <span className="sr-only">{t("dataTable.openRowActions")}</span>
              ),
              cell: ({ row }) => (
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        aria-label={t("dataTable.openRowActions")}
                        className="cursor-pointer"
                        size="icon"
                        variant="ghost"
                        onClick={(event) => event.stopPropagation()}
                      >
                        <MoreHorizontal />
                      </Button>
                    }
                  />
                  <DropdownMenuContent align="end">
                    {rowActions?.(publicRow(row)).map((action) => (
                      <RowActionItem
                        key={action.label}
                        action={action}
                        row={publicRow(row)}
                      />
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              ),
              size: 60,
              pinned: "right",
            } satisfies InternalColumn<TData>,
          ]
        : []),
    ];
  }, [columns, hasRowSelection, hasRowActions, rowActions, t]);

  const tableColumns = processedColumns;

  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [isAllPageRowsSelected, setIsAllPageRowsSelected] = useState(false);
  const onRowSelectionChangeRef = useRef(onRowSelectionChange);
  const onAllRowsSelectedChangeRef = useRef(onAllRowsSelectedChange);
  const selectedRowCount = Object.keys(rowSelection).length;

  useEffect(() => {
    onRowSelectionChangeRef.current = onRowSelectionChange;
    onAllRowsSelectedChangeRef.current = onAllRowsSelectedChange;
  }, [onRowSelectionChange, onAllRowsSelectedChange]);

  const table = useTable({
    features,
    data,
    columns: tableColumns,
    state: {
      columnPinning: {
        start: processedColumns
          .filter((column) => column.pinned === "left")
          .map((column) => column.id!),
        end: processedColumns
          .filter((column) => column.pinned === "right")
          .map((column) => column.id!),
      },
      rowSelection,
    },
    getRowId,
    onRowSelectionChange: setRowSelection,
  });

  const lastSelectedRows = useRef<TData[] | undefined>(undefined);
  useEffect(() => {
    const rows = table.getSelectedRowModel().rows.map((row) => row.original);
    const previous = lastSelectedRows.current;
    if (
      !previous ||
      previous.length !== rows.length ||
      rows.some((row, index) => row !== previous[index])
    ) {
      lastSelectedRows.current = rows;
      onRowSelectionChangeRef.current?.(rows);
    }
  }, [rowSelection, data, table]);

  const handleAllRowsSelectedChange = useCallback((selected: boolean) => {
    setIsAllPageRowsSelected(selected);
    onAllRowsSelectedChangeRef.current?.(selected);
  }, []);

  return (
    <div className="flex flex-col gap-2">
      <div className="relative overflow-auto rounded-md">
        {selectedRowCount > 0 && (
          <div className="bg-card absolute top-0 left-0 z-100 flex h-10 w-full items-center gap-2 px-2">
            <Checkbox
              aria-label={t("dataTable.selectAllRows")}
              checked={table.getIsAllPageRowsSelected()}
              onCheckedChange={(value) =>
                table.toggleAllPageRowsSelected(!!value)
              }
            />

            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button size="xs" variant="ghost">
                    {isAllPageRowsSelected
                      ? t("dataTable.allSelected")
                      : t("dataTable.selectedRows", {
                          count: selectedRowCount,
                        })}
                    <ChevronDown />
                  </Button>
                }
              />
              <DropdownMenuContent>
                <DropdownMenuGroup>
                  {!table.getIsAllPageRowsSelected() && (
                    <DropdownMenuItem
                      onClick={() => table.toggleAllPageRowsSelected(true)}
                    >
                      {t("dataTable.selectAllRowsOnPage", {
                        count: table.getRowModel().rows.length,
                      })}
                    </DropdownMenuItem>
                  )}

                  {!isAllPageRowsSelected && (
                    <DropdownMenuItem
                      onClick={() => {
                        table.toggleAllPageRowsSelected(true);
                        handleAllRowsSelectedChange(true);
                      }}
                    >
                      {t("dataTable.selectAll")}
                    </DropdownMenuItem>
                  )}

                  <DropdownMenuItem
                    onClick={() => {
                      table.toggleAllPageRowsSelected(false);
                      handleAllRowsSelectedChange(false);
                    }}
                  >
                    {t("dataTable.unselectAll")}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>

            {bulkActions}
          </div>
        )}

        <Table className="bg-card table-fixed">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                key={headerGroup.id}
                className="group bg-card hover:bg-muted"
              >
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "bg-card group-hover:bg-muted whitespace-normal",
                      getCommonPinningClassNames<TData>(header.column),
                    )}
                    style={
                      {
                        "--column-width": `${header.column.getSize()}px`,
                        "--column-offset": `${
                          header.column.getIsPinned() === "end"
                            ? header.column.getAfter("end")
                            : header.column.getStart("start")
                        }px`,
                      } as CSSProperties
                    }
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() ? "selected" : undefined}
                  className={cn(
                    "group bg-card hover:bg-muted",
                    onRowClick && "cursor-pointer",
                  )}
                  {...(onRowClick
                    ? { onClick: () => onRowClick?.(publicRow(row)) }
                    : {})}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "bg-card group-hover:bg-muted whitespace-normal",
                        getCommonPinningClassNames<TData>(cell.column),
                        cell.column.id === "$actions" && "text-right",
                      )}
                      style={
                        {
                          "--column-width": `${cell.column.getSize()}px`,
                          "--column-offset": `${
                            cell.column.getIsPinned() === "end"
                              ? cell.column.getAfter("end")
                              : cell.column.getStart("start")
                          }px`,
                        } as CSSProperties
                      }
                      onClick={
                        cell.column.id === "$actions"
                          ? (event) => event.stopPropagation()
                          : undefined
                      }
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  className="bg-card h-24 text-center"
                  colSpan={tableColumns.length}
                >
                  {empty ?? (
                    <Empty
                      description={t("dataTable.emptyDescription")}
                      title={t("dataTable.emptyTitle")}
                    />
                  )}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pagination && (
        <div className="flex items-center justify-center">
          <ButtonGroup>
            <Button
              aria-label={t("dataTable.previousPage")}
              disabled={!pagination.hasPreviousPage}
              size="icon"
              variant="outline"
              onClick={pagination.onPreviousPage}
            >
              <ChevronLeft />
            </Button>
            <Button
              aria-label={t("dataTable.nextPage")}
              disabled={!pagination.hasNextPage}
              size="icon"
              variant="outline"
              onClick={pagination.onNextPage}
            >
              <ChevronRight />
            </Button>
          </ButtonGroup>
        </div>
      )}
    </div>
  );
}
