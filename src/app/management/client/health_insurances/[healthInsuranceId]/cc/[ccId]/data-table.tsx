import { rankItem } from "@tanstack/match-sorter-utils";
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
    const [globalFilter, setGlobalFilter] = useState("");
    const table = useReactTable({
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getFacetedRowModel: getFacetedRowModel(),
      getFacetedUniqueValues: getFacetedUniqueValues(),
      getFilteredRowModel: getFilteredRowModel(),
      globalFilterFn: (row, columnId, filterValue) => {
        const searchColumns = ["description", "comprobanteNumber", "amount"];
        return searchColumns.some((col) => {
          const value = row.getValue(col);
          return rankItem(value?.toString() ?? "", filterValue).passed;
        });
      },
      state: {
        globalFilter, 
      },
      onGlobalFilterChange: setGlobalFilter, 
    });
    const desiredColumns = ["Estado", "Tipo comprobante"];
    const filteredColumns = Array.from(table.getAllColumns()).filter((column) =>
      desiredColumns.includes(column.id!)
    );
    return (
      <div>
      <TableToolbar 
      table={table}       
      columns={filteredColumns} 
      setGlobalFilter={setGlobalFilter} 
      containerClassName="py-2" />
      <Table>
          <TableBody className="mt-0">
              {table.getRowModel().rows.map((row)=>(
                   <TableRow
                   key={row.id}
                   className="border-b-2 border-gray-200 border-x-0 h-auto mt-0"
                 >
                      {row.getVisibleCells().map((cell)=>(
                          <TableCell key={cell.id} className="h-auto py-5 first:text-left text-center "> 
                              {flexRender(cell.column.columnDef.cell,cell.getContext()) }
                          </TableCell>
                      ))}
                  </TableRow>
              ))}
          </TableBody>
      </Table>
      <DataTablePagination table={table} containerClassName="mt-7"/>
      </div>
    );
  }