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
  getFacetedUniqueValues,
  getFacetedRowModel,
} from "@tanstack/react-table";

import { TableCell } from "~/components/ui/table";
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/tablePreliq";

import { DataTablePagination } from "~/components/tanstack/pagination";
import TableToolbar from "~/components/tanstack/table-toolbar";
import { useState } from "react";

import { useRouter } from "next/navigation";
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}

export function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps<TData, TValue>) {
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getFacetedRowModel: getFacetedRowModel(),
    getFacetedUniqueValues: getFacetedUniqueValues(),
    state: {
      columnFilters,
    },
  });
  const router = useRouter();

  const handleRowClick = (row: Row<TData>) => {
    const originalData = row.original as { id: string };
    router.push(`/management/client/health_insurances/${originalData.id}`);
  };

  const desiredColumns = ["afip_status"];
  const filteredColumns = Array.from(table.getAllColumns()).filter((column) =>
    desiredColumns.includes(column.id!)
  );

  return (
    <>
      <TableToolbar
        table={table}
        columns={filteredColumns}
        searchColumn="responsibleName"
      />
      <Table>
        <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow
              className="bg-[#F7F7F7] hover:bg-[#F7F7F7] rounded-lg "
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
                  className="border-b-2 border-gray-200 border-x-0 hover:bg-[#F7F7F7] hover:cursor-pointer"
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
            </>
          ) : (
            <TableRow>
              <TableCell colSpan={columns.length} className="h-24 text-center">
                No results.
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DataTablePagination table={table} />
    </>
  );
}
