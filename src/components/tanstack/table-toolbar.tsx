"use client";
import React, { useRef, useState } from "react";
import { Table } from "@tanstack/react-table";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import Filters from "./filters";
import { Column } from "@tanstack/react-table";
import { api } from "~/trpc/react";
import { cn } from "~/lib/utils";

interface DataTableToolbarProps<TData, TValue> {
  table: Table<TData>;
  columns?: Column<TData, TValue>[];
  setGlobalFilter?: any ;
  containerClassName?: string;
}

// Definimos el tipo de ref que vamos a usar con Filters
interface FiltersRef {
  clearFilters: () => void;
}

export default function TableToolbar<TData, TValue>({
  table,
  columns,
  setGlobalFilter,
  containerClassName,
}: DataTableToolbarProps<TData, TValue>) {
  const filtersRef = useRef<FiltersRef>(null); // Ref para el componente Filters
  
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = (value: string) => {
    setSearchValue(value);
    setGlobalFilter(value);
  };
  
  const handleClearFilters = () => {
    if (filtersRef.current) {
      filtersRef.current.clearFilters(); // Llamamos a la función clearFilters del componente Filters
    }
    table.resetColumnFilters(); // Reseteamos también los filtros de la tabla
  };

  return (
    <div 
    className={cn(
      "flex flex-row justify-between items-center w-full py-5", 
      containerClassName)}>
      <div className="w-full max-w-sm flex items-center place-content-center relative">
        <Input
          placeholder="Buscar por..."
          value={searchValue}
          onChange={(event) => handleSearch(event.target.value)}
          className="w-full h-7 p-5 rounded-full border-2 border-[#BEF0BB] focus-visible:ring-[#BEF0BB]"
        />
        <div className="rounded-full h-6 w-6 place-content-center absolute right-5">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="#3E3E3E">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="m15.75 15.75-2.489-2.489m0 0a3.375 3.375 0 1 0-4.773-4.773 3.375 3.375 0 0 0 4.774 4.774ZM21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
            />
          </svg>
        </div>
      </div>
      <div className="flex gap-1 pl-1 items-center">
        <Filters
          ref={filtersRef}
          table={table}
          columns={columns}
          onClearFilters={handleClearFilters}
        />
        <div>
          {table.getState().columnFilters.length > 0 && (
            <Button variant="ghost" onClick={handleClearFilters} className="h-8 px-2 lg:px-3 font-semibold text-[#bef0bb] hover:text-[#bef0bb] hover:bg-white">
              Limpiar filtros
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

