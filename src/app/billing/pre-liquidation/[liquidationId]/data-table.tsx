"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnFiltersState,
  useReactTable,
  Row,
  getFacetedRowModel,
  getFacetedUniqueValues,
} from "@tanstack/react-table";

import { TableCell } from "~/components/ui/table";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/tablePreliq";
import { Sheet, SheetContent } from "~/components/ui/sheet";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { DataTablePagination } from "~/components/tanstack/pagination";
import TableToolbar from "~/components/tanstack/table-toolbar";
import { useEffect, useState } from "react";
import DetailSheet from "./detail-sheet";
import { RouterOutputs } from "~/trpc/shared";
import { TableRecord } from "./columns";
import DataTableSummary from "~/components/tanstack/summary";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
import { api } from "~/trpc/react";
import { makeExcelRows } from "./utils";
import { cachedAsyncFetch } from "~/lib/cache";

type TData =
  RouterOutputs["family_groups"]["getByLiquidationFiltered"]["results"][0];

interface DataTableProps {
  columns: ColumnDef<TableRecord>[];
  summary: RouterOutputs["family_groups"]["getSummaryByLiqId"];
  liquidationId: string;
  maxEventDate: Date;
}

interface DetailData {
  comprobantes: RouterOutputs["comprobantes"]["getByLiquidation"];
  currentAccountAmount: number;
  id: string;
  nombre: string;
  cuit: string;
  [index: string]: any;
}
export function DataTable({
  columns,
  summary,
  liquidationId,
  maxEventDate,
}: DataTableProps) {
  const [open, setOpen] = useState(false);
  const [detailData, setDetailData] = useState<DetailData | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [delayedColumnFilters, setDelayedColumnFilters] =
    useState<ColumnFiltersState>([]);

  const [data, setData] = useState<TableRecord[]>([]);
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  useEffect(() => {
    const timeOutId = setTimeout(
      () => setDelayedColumnFilters(columnFilters),
      750
    );
    return () => clearTimeout(timeOutId);
  }, [columnFilters]);

  const paginatedQuery =
    api.family_groups.getByLiquidationFiltered.useMutation();

  const table = useReactTable({
    data,
    columns,
    manualPagination: true,
    manualFiltering: true,
    rowCount: summary.totalRows,
    pageCount: Math.ceil(summary.totalRows / pagination.pageSize),
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    autoResetPageIndex: false,
    onPaginationChange: setPagination,
    state: {
      columnFilters,
      pagination,
    },
  });

  useEffect(() => {
    const cursor = pagination.pageIndex * pagination.pageSize;

    let filter: string | undefined = undefined;
    let filterModo: string | undefined = undefined;
    let filterPlan: string | undefined = undefined;
    let filterUN: string | undefined = undefined;

    for (const f of delayedColumnFilters) {
      const id = f.id.toLowerCase();
      if (id === "nombre") {
        filter = f.value as string;
      } else if (id === "modo") {
        filterModo = f.value as string;
      } else if (id === "plan") {
        filterPlan = f.value as string;
      } else if (id === "un") {
        filterUN = f.value as string;
      }
    }

    const filterN = Number(filter);

    let filterNumber: undefined | string = undefined;
    let filterName: undefined | string = undefined;
    if (Number.isFinite(filterN) && !Number.isNaN(filterN)) {
      filterNumber = filter;
    } else {
      filterName = filter;
    }

    cachedAsyncFetch(
      `preliq-${liquidationId}-${cursor}-${pagination.pageSize}`,
      60000,
      async () => {
        return await paginatedQuery.mutateAsync({
          liquidationId,
          limit: pagination.pageSize,
          cursor: pagination.pageIndex * pagination.pageSize,
          id_number_startsWith: filterNumber,
          name_contains: filterName,
          modoDesc: filterModo,
          plan: filterPlan,
          UN: filterUN,
          maxEventDate,
        });
      },
      delayedColumnFilters.length > 0
    ).then((data) => {
      const dataArray: TableRecord[] = [];
      makeExcelRows(data, liquidationId, null, dataArray);
      setData(dataArray);
    });
  }, [pagination, delayedColumnFilters]);

  const hiddenDataKeys = [
    "comprobantes",
    "currentAccountAmount",
    "id",
    "nombre",
    "cuit",
  ];

  const handleRowClick = (row: Row<TableRecord>) => {
    let detailData = {} as DetailData;
    for (const key in row.original) {
      if (hiddenDataKeys.includes(key)) {
        detailData[key] = (
          row.original as unknown as Record<string, DetailData>
        )[key];
      }
    }

    setDetailData(detailData);
    setOpen(!open);
  };

  const desiredColumns = ["modo", "Plan", "UN"];
  const filteredColumns = Array.from(table.getAllColumns()).filter((column) =>
    desiredColumns.includes(column.id!)
  );

  return (
    <>
      <DataTableSummary summary={summary.summary} />
      <TableToolbar
        table={table}
        searchColumn={"nombre"}
        columns={filteredColumns}
      />

      <ScrollArea className="pb-7">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      className="bg-[#f7f7f7] first:rounded-s-lg last:rounded-e-lg">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    onClick={() => handleRowClick(row)}
                    className="border-b-2 border-[#f6f6f6] hover:bg-[#f6f6f6] hover:cursor-pointer">
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))}
                {detailData && (
                  <DetailSheet
                    liquidationId={liquidationId}
                    open={open}
                    setOpen={setOpen}
                    data={detailData}
                  />
                )}
              </>
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>

      <DataTablePagination table={table} />
    </>
  );
}
