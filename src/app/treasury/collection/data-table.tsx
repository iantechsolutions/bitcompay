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
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { DataTablePagination } from "~/components/tanstack/pagination";
import TableToolbar from "~/components/tanstack/table-toolbar";
import { Dispatch, SetStateAction, useState } from "react";
import { RouterOutputs } from "~/trpc/shared";
import { TableRecord } from "./columns";
import DataTableSummary from "~/components/tanstack/summary";
import { useRouter } from "next/navigation";
import TableToolbarPayment from "~/components/tanstack/table-payments";
import { ScrollArea, ScrollBar } from "~/components/ui/scroll-area";

export const recHeaders = [
  { key: "name", label: "Apellido y Nombre", width: 200 },
  // { key: "fiscal_id_number", label: "Nro ID Fiscal", width: 140 },
  // {
  //   key: "invoice_number",
  //   label: "Nro Comprobante",
  //   width: 140,
  //   alwaysRequired: true,
  // },
  { key: "g_c", label: "Marca", width: 50 },
  { key: "product_number", label: "Producto", width: 80, alwaysRequired: true },
  { key: "period", label: "Período", width: 140 },
  { key: "first_due_amount", label: "Importe 1er Vto.", width: 140 },
  { key: "first_due_date", label: "Fecha 1er Vto.", width: 140 },
  { key: "additional_info", label: "Info. Adicional", width: 250 },
  { key: "payment_date", label: "Fecha de Pago/Débito", width: 140 },
  // { key: "collected_amount", label: "Importe a cobrar", width: 140 },
  { key: "recollected_amount", label: "Importe cobrado", width: 140 },
  { key: "statusId", label: "Estado de Pago", width: 140 },
];

interface DataTableProps<TData, TValue> {
  data: TData[]; // Cambiado a tipo específico
  columns: ColumnDef<TData, TValue>[];
  setLoading: Dispatch<SetStateAction<boolean>>;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  setLoading,
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

  // const handleRowClick = (row: Row<TableRecord>) => {
  //   // Asegúrate de que el tipo coincida
  //   setLoading(true);
  //   setTimeout(() => {
  //     const originalData = row.original as { id: string };
  //     router.push(`/billing/pre-liquidation/${originalData.id}`);
  //   }, 100);
  // };
  const desiredColumns = ["Marca", "UN"];
  const filteredColumns = Array.from(table.getAllColumns()).filter((column) =>
    desiredColumns.includes(column.id!)
  );
  return (
    <>
      {/* <TableToolbarPayment
        table={table as any}
        columns={filteredColumns as any}
        searchColumn="invoice_number"
      /> */}
      <ScrollArea>
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow
                className="bg-[#F7F7F7] hover:bg-[#F7F7F7] rounded-lg "
                key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              <>
                {table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    className="border-b-2 border-gray-200 border-x-0 hover:bg-[#d7d3d395] hover:cursor-pointer">
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
