"use client";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { CalendarIcon, SlidersHorizontal } from "lucide-react";
import { Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Column, Table } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "../ui/form";
import { Input } from "../ui/input";
import { Calendar } from "~/components/ui/calendar";
import { cn } from "~/lib/utils";
import dayjs from "dayjs";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { ChevronDown } from "lucide-react";

// Definimos el tipo para las props del componente
interface FiltersProps<TData, TValue> {
  table: Table<TData>;
  columns?: Column<TData, TValue>[];
  onClearFilters: () => void; // Prop para manejar la limpieza de filtros desde fuera
}

// Este es el tipo de los métodos que queremos exponer a través del ref
interface FiltersRef {
  clearFilters: () => void;
}

const Filters = forwardRef<FiltersRef, FiltersProps<any, any>>(
  ({ table, columns, onClearFilters }, ref) => {
    const [showFilters, setShowFilters] = useState(false);
    const form = useForm();
    const [filterValues, setFilterValues] = useState<
      Record<string, string | undefined>
    >({});

    // Exponemos clearFilters a través de la ref usando useImperativeHandle
    useImperativeHandle(ref, () => ({
      clearFilters: () => {
        // Limpiar los valores en el formulario
        form.reset();

        // Limpiar los filtros de cada columna en la tabla
        columns?.forEach((column) => {
          const columnTable = table.getColumn(column.id);
          if (columnTable) {
            columnTable.setFilterValue(undefined);
          }
        });

        // Limpiar los valores del estado de selects
        setFilterValues({});
      },
    }));

    const onSubmit = () => {
      const data = form.getValues();
      Object.entries(data).forEach(([columnName, value]) => {
        const column = table.getColumn(columnName);
        if (column) {
          column.setFilterValue(value);
        }
      });
    };

    return (
      <div className="flex items-center p-0 bg-[#DEF5DD] rounded-full">
        <Button
          variant={"outline"}
          className="rounded-full px-5 py-5 bg-[#c0f4bc] hover:bg-[#c0f4bc] h-7 text-black shadow-none hover:text-black "
          color="#0DA485"
          onClick={() => setShowFilters(!showFilters)}
        >
          <img
            src="/public/tables/Frame-22.png"
            className={`h-5 w-auto ${showFilters ? "mr-2" : ""}`}
          />
          {showFilters && "Filtros"}
        </Button>
        <div
          className={`transition-all duration-700 ease-in-out overflow-hidden ${
            showFilters
              ? "opacity-100 max-h-[500px] "
              : "opacity-0 max-h-0 max-w-[0px]"
          }`}
        >
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex gap-3">
                {columns?.map((column) => {
                  const columnTable = table.getColumn(column.id);
                  return (
                    <FormField
                      key={column.id}
                      control={form.control}
                      name={column.id}
                      render={({ field }) => (
                        <FormItem>
                          <Select
                            onValueChange={(value) => {
                              columnTable?.setFilterValue(value);
                              setFilterValues((prev) => ({
                                ...prev,
                                [column.id]: value,
                              }));
                            }}
                            value={filterValues[column.id] ?? ""}
                          >
                            <FormControl>
                              <SelectTrigger
                                className="border-none"
                                rightIcon={
                                  <ChevronDown
                                    strokeWidth={1.4}
                                    className="h-3 w-auto"
                                  />
                                }
                              >
                                <SelectValue placeholder={column.id} />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {Array.from(
                                column.getFacetedUniqueValues().keys()
                              )
                                .filter((value) => value !== "")
                                .map((value) => {
                                  return (
                                    <SelectItem
                                      value={value}
                                      className="text-sm"
                                      key={value}
                                      onClick={() => {
                                        if (columnTable) {
                                          columnTable?.setFilterValue(value);
                                        }
                                      }}
                                    >
                                      {value}
                                    </SelectItem>
                                  );
                                })}
                            </SelectContent>
                          </Select>
                        </FormItem>
                      )}
                    />
                  );
                })}
              </div>
            </form>
          </Form>
        </div>
      </div>
    );
  }
);

export default Filters;
