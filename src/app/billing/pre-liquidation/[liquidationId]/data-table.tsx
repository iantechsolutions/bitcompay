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
import { useState } from "react";
import DetailSheet from "./detail-sheet";
import { RouterOutputs } from "~/trpc/shared";
import { TableRecord } from "./columns";
import DataTableSummary from "~/components/tanstack/summary";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

interface DetailData {
  comprobantes: RouterOutputs["comprobantes"]["getByLiquidation"];
  currentAccountAmount: number;
  nombre: string;
  cuit: string;
  [index: string]: any;
}
export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [open, setOpen] = useState(false);
  const [detailData, setDetailData] = useState<DetailData | null>(null);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      columnFilters,
    },
  });

  const hiddenDataKeys = [
    "comprobantes",
    "currentAccountAmount",
    "nombre",
    "cuit",
  ];

  const handleRowClick = (row: Row<TData>) => {
    let detailData = {} as DetailData;
    for (const key in row.original) {
      if (hiddenDataKeys.includes(key)) {
        detailData[key] = row.original[key];
      }
    }
    console.log(detailData);
    setDetailData(detailData);
    setOpen(!open);
  };

  const desiredColumns = ["modo", "Plan"];
  const filteredColumns = Array.from(table.getAllColumns()).filter((column) =>
    desiredColumns.includes(column.id!)
  );

  console.log("desire columna", filteredColumns);
  return (
    <>
      <DataTableSummary table={table} />
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