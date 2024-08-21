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
import { ChevronDown } from "lucide-react";
interface FiltersProps<TData, TValue> {
  table: Table<TData>;
  columns?: Column<TData, TValue>[];
}

export default function Filters<TData, TValue>({
  table,
  columns,
}: FiltersProps<TData, TValue>) {
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const form = useForm();
  // como sacar uniqueValues por cada columna
  // console.log("columnaas", columns);
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
    <div className="flex items-center">
      <Button
        variant={"outline"}
        className="rounded-full px-5 py-5 mr-2 bg-[#D9FF9C] hover:bg-[#D9FF9C] h-7 text-black hover:text-black "
        color="#0DA485"
        onClick={() => setShowFilters(!showFilters)}
      >
        <img src="/public/tables/Frame-22.png" className="h-5 w-auto mr-2" />{" "}
        Filtros{" "}
      </Button>

      {showFilters && (
        <>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="flex gap-3">
                {columns?.map((column) => (
                  <FormField
                    key={column.id}
                    control={form.control}
                    name={column.id}
                    render={({ field }) => (
                      <FormItem>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value as string}
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
                            {Array.from(column.getFacetedUniqueValues().keys())
                              .filter((value) => value !== "")
                              .map((value) => (
                                <SelectItem
                                  value={value}
                                  className="text-sm"
                                  key={value}
                                  onClick={(value) =>
                                    column.setFilterValue(value)
                                  }
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
            </form>
          </Form>
        </>
      )}
    </div>
  );
}
