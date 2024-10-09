"use client";
import React, { forwardRef, useImperativeHandle, useState } from "react";
import { Button } from "../ui/button";
import { Column, Table } from "@tanstack/react-table";
import { useForm } from "react-hook-form";
import { Form, FormControl, FormField, FormItem } from "../ui/form";

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
import { ChevronDown } from "lucide-react";
import { api } from "~/trpc/react";
import { RouterOutputs } from "~/trpc/shared";
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

type responseMap =
  | RouterOutputs["plans"]["list"]
  | RouterOutputs["modos"]["list"]
  | RouterOutputs["bussinessUnits"]["list"]
  | RouterOutputs["brands"]["list"];
function hasName(obj: any): obj is { name: string } {
  return obj && typeof obj.name === "string";
}

const Filters = forwardRef<FiltersRef, FiltersProps<any, any>>(
  ({ table, columns, onClearFilters }, ref) => {
    const [showFilters, setShowFilters] = useState(false);
    const form = useForm();
    const [filterValues, setFilterValues] = useState<
      Record<string, string | undefined>
    >({});
    const apiFetchMap: Record<string, responseMap | undefined> = {
      Plan: api.plans.list.useQuery().data,
      modo: api.modos.list.useQuery().data,
      Modalidad: api.modos.list.useQuery().data,
      UN: api.bussinessUnits.list.useQuery().data,
      Marca: api.brands.list.useQuery().data,
    };

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
          className="rounded-full px-5 py-5 gap-2 font-medium bg-[#c0f4bc] hover:bg-[#c0f4bc] h-7 text-black shadow-none hover:text-black "
          color="#0DA485"
          onClick={() => setShowFilters(!showFilters)}
        >
          <img
            src="/public/tables/Frame-22.png"
            className={`h-5 w-auto`}
          />
          Filtros
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
                              {apiFetchMap[column.id]?.map((item) =>
                                hasName(item) ? (
                                  <SelectItem
                                    key={item.id}
                                    value={item?.name}
                                  >
                                    {item?.name}
                                  </SelectItem>
                                ) : (
                                  <SelectItem
                                    key={item.id}
                                    value={item?.description}
                                  >
                                    {item?.description}
                                  </SelectItem>
                                )
                              )}
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
