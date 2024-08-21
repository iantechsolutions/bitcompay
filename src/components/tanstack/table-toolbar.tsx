"use client";
import { Table } from "@tanstack/react-table";
import { Input } from "../ui/input";
import { Search } from "lucide-react";
import { Button } from "../ui/button";
import { X } from "lucide-react";
import Filters from "./filters";
import { Column } from "@tanstack/react-table";

interface DataTableToolbarProps<TData, TValue> {
  table: Table<TData>;
  searchColumn?: string;
  columns?: Column<TData, TValue>[];
}

export default function TableToolbar<TData, TValue>({
  table,
  columns,
  searchColumn,
}: DataTableToolbarProps<TData, TValue>) {
  console.log(table.getState().columnFilters);
  return (
    <div className="flex flex-row justify-between items-center w-full">
      <div className="w-full max-w-sm flex items-center place-content-center py-4 relative">
        {searchColumn !== undefined && table.getColumn(searchColumn ?? "") && (
          <>
            <Input
              placeholder={`Buscar por ... `}
              value={
                (table
                  .getColumn(searchColumn ?? "")
                  ?.getFilterValue() as string) ?? ""
              }
              onChange={(event) =>
                table
                  .getColumn(searchColumn ?? "")
                  ?.setFilterValue(event.target.value)
              }
              className="w-full h-7 p-5 rounded-full border-2 border-[#C8FF6D] focus-visible:ring-[#71EBD4]"></Input>
            <div className="rounded-full h-6 w-6 place-content-center absolute right-5">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#3E3E3E" className="size-1">
                <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
              </svg>
            </div>
          </>
        )}
      </div>
      <div className="flex gap-2">
        <Filters table={table} columns={columns} />
        <div className="flex gap-2">
          {table.getState().columnFilters.map((column) => (
            <div className="rounded-full h-7 border-2 border-[#71EBD4] px-2 text-muted-foreground text-sm flex items-center">
              {column.id}{" "}
              <Button
                variant="outline"
                className="h-3 w-auto ml-2 p-0 border-0 "
                onClick={() =>
                  table.getColumn(column.id)?.setFilterValue(undefined)
                }>
                <X className="h-3 w-auto" color="#71EBD4" />
              </Button>
            </div>
          ))}
        </div>
        <div>
          {table.getState().columnFilters.length > 0 && (
            <Button
              variant="ghost"
              onClick={() => table.resetColumnFilters()}
              className="h-8 px-2 lg:px-3 font-semibold text-[#71EBD4] hover:text-[#71EBD4] hover:bg-white">
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
