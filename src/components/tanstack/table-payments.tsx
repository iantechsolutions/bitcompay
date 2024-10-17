"use client";
import React, { useRef } from "react";
import { Table } from "@tanstack/react-table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Filters from "./filters";
import { Column } from "@tanstack/react-table";
import { cn } from "~/lib/utils";

// Define a TableRecord type that describes the structure of your table data.
interface TableRecord {
  // Define the properties of your table record here
  id: string; // Example property
  // Add other properties as needed
}

interface DataTableToolbarProps<TData extends TableRecord, TValue> {
  // Constrain TData to TableRecord
  table: Table<TData>;
  searchColumn?: string;
  columns?: Column<TData, TValue>[];
  containerClassName?: string;
}

// Define the type of ref that we will use with Filters
interface FiltersRef {
  clearFilters: () => void;
}

export default function TableToolbarPayment<TData extends TableRecord, TValue>({
  table,
  columns,
  searchColumn,
  containerClassName,
}: DataTableToolbarProps<TData, TValue>) {
  const filtersRef = useRef<FiltersRef>(null); // Ref for the Filters component

  console.log(table.getState().columnFilters);

  const handleClearFilters = () => {
    if (filtersRef.current) {
      filtersRef.current.clearFilters(); // Call clearFilters function from Filters component
    }
    table.resetColumnFilters(); // Also reset the table filters
  };

  return (
    <div
      className={cn(
        "flex flex-row justify-between items-center w-full py-5",
        containerClassName
      )}>
      <div className="w-full max-w-sm flex items-center place-content-center relative">
        {searchColumn !== undefined && table.getColumn(searchColumn ?? "") && (
          <>
            <Input
              placeholder={`Buscar por ${searchColumn}`}
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
              className="w-full h-7 p-5 rounded-full border-2 border-[#BEF0BB] focus-visible:ring-[#BEF0BB]"
            />
            <div className="rounded-full h-6 w-6 place-content-center absolute right-5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="#3E3E3E"
                className="">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                />
              </svg>
            </div>
          </>
        )}
      </div>
      <div className="flex gap-1 pl-1 items-center">
        {/* Pass the onClearFilters prop to the Filters component */}
        <Filters
          ref={filtersRef} // Pass the reference to the Filters component
          table={table}
          columns={columns}
          onClearFilters={handleClearFilters}
        />
        <div>
          {table.getState().columnFilters.length > 0 && (
            <Button
              variant="ghost"
              onClick={handleClearFilters} // Call handleClearFilters here
              className="h-8 px-2 lg:px-3 font-semibold text-[#bef0bb] hover:text-[#bef0bb] hover:bg-white">
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
