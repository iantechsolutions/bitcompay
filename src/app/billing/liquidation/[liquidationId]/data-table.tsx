"use client";

import { Search } from "lucide-react";

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
import { cachedAsyncFetch } from "~/lib/cache";
import { makeExcelRows } from "./utils";

type TData =
  RouterOutputs["family_groups"]["getByLiquidationFiltered"]["results"][0];

interface DataTableProps {
  columns: ColumnDef<TableRecord>[];
  summary: RouterOutputs["family_groups"]["getSummaryByLiqId"];
  liquidationId: string;
}

interface DetailData {
  comprobantes: RouterOutputs["comprobantes"]["getByLiquidation"];
  currentAccountAmount: number;
  nombre: string;
  cuit: string;
  id: string;
  [index: string]: any;
}

export function DataTable<TData, TValue>({
  columns,
  summary,
  liquidationId,
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

  const hiddenDataKeys = [
    "comprobantes",
    "currentAccountAmount",
    "nombre",
    "cuit",
  ];

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
      `liq-${liquidationId}-${cursor}-${pagination.pageSize}`,
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
        });
      },
      delayedColumnFilters.length > 0
    ).then((data) => {
      const dataArray: TableRecord[] = [];
      makeExcelRows(data, null, dataArray);
      setData(dataArray);
    });
  }, [pagination, delayedColumnFilters]);

  const handleRowClick = (row: Row<TableRecord>) => {
    let detailData = {} as DetailData;
    for (const key in row.original) {
      if (hiddenDataKeys.includes(key)) {
        detailData[key] = (
          row.original as unknown as Record<string, DetailData>
        )[key];
      }
    }

    detailData.id = row.original.id;
    setDetailData(detailData);
    setOpen(!open);
  };

  const desiredColumns = ["modo", "Plan", "UN"];
  const filteredColumns = Array.from(table.getAllColumns()).filter((column) =>
    desiredColumns.includes(column.id!)
  );

  // const totalAportes =
  // .flatMap((group) => group.integrants)
  // .flatMap((part) => part.aportes_os)
  // .filter((a) => a.contribution_date === input.period)
  // .reduce((sum, aporte) => sum + parseInt(aporte.amount), 0);
  // const aporteTotal = summary.summary.APORTES;
  // const total = summary.summary["APORTES"];

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
              <TableRow
                className="bg-[#f7f7f7] first:rounded-s-lg last:rounded-e-lg"
                key={headerGroup.id}
              >
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
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
                    className="border-b-2 border-gray-200 border-x-0 hover:bg-[#d7d3d395] hover:cursor-pointer"
                  >
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
                  className="h-24 text-center"
                >
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
