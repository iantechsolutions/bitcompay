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
import { useState } from "react";
import { DataTablePagination } from "~/components/tanstack/pagination";
import TableToolbar from "~/components/tanstack/table-toolbar";
import { TableHead, TableHeader } from "~/components/ui/table";
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
} from "~/components/ui/tablePreliq";
interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}
export default function DataTable<Tdata, Tvalue>({
  columns,
  data,
}: DataTableProps<Tdata, Tvalue>) {
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
  const desiredColumns = ["Fecha de Proceso", "Fecha de Soporte"];
  const filteredColumns = Array.from(table.getAllColumns()).filter((column) =>
    desiredColumns.includes(column.id!)
  );
  return (
    <div>
      <TableToolbar
        table={table}
        searchColumn="Fecha de Proceso"
        columns={filteredColumns}
        containerClassName="py-2"
      />
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
        <TableBody className="mt-0">
          {table.getRowModel().rows.map((row) => (
            <TableRow
              key={row.id}
              className="border-b-2 border-gray-200 border-x-0 h-auto mt-0">
              {row.getVisibleCells().map((cell) => (
                <TableCell
                  key={cell.id}
                  className="h-auto py-5 first:text-left text-center ">
                  {flexRender(cell.column.columnDef.cell, cell.getContext())}
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <DataTablePagination table={table} containerClassName="mt-7" />
    </div>
  );
}
