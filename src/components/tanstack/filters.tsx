"use client";
import { CalendarIcon, SlidersHorizontal } from "lucide-react";
import { Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Column, Table } from "@tanstack/react-table";
import { Path, useForm, type SubmitHandler } from "react-hook-form";

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
import { useState } from "react";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "../ui/select";
interface FiltersProps<TData, TValue> {
  table: Table<TData>;
  columns?: Column<TData, TValue>[];
}

export default function Filters<TData, TValue>({
  table,
  columns,
}: FiltersProps<TData, TValue>) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const form = useForm();
  // como sacar uniqueValues por cada columna
  console.log("columns", columns);
  if (columns) {
    columns.forEach((column) => {
      const uniqueValues = column?.getFacetedUniqueValues();
      console.log("uniqueValues", uniqueValues);
    });
  }

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
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className="rounded-full px-5 bg-[#0DA485] hover:bg-[#0DA485] h-7 text-white hover:text-white"
          color="#0DA485"
        >
          <SlidersHorizontal className="mr-2 h-3 w-auto" /> Filtros{" "}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="" align="start">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col gap-2"
          >
            <div className="grid grid-cols-2 gap-2">
              {columns?.map((column) => (
                <FormField
                  key={column.id}
                  control={form.control}
                  name={column.id}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">
                        {column.id}
                      </FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value as string}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {Array.from(
                            column.getFacetedUniqueValues().keys()
                          ).map((value) => (
                            <SelectItem
                              value={value}
                              className="text-sm"
                              key={value}
                            >
                              {value}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <Button
              variant="outline"
              className="self-end h-7 w-[6rem] bg-[#0DA485] hover:bg-[#0DA485] text-white hover:text-white rounded-full font-light"
            >
              <Search className="h-4 font-bold" />
              Buscar
            </Button>
          </form>
        </Form>
      </PopoverContent>
    </Popover>
  );
}
