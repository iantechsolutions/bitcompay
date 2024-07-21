"use client";
import { SlidersHorizontal } from "lucide-react";
import { Search } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Table } from "@tanstack/react-table";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Form, FormField, FormItem, FormLabel } from "../ui/form";
import { Input } from "../ui/input";
interface FiltersProps<TData> {
  table: Table<TData>;
  initialValues: Inputs;
}
type Inputs = {
  plan?: string;
  modo?: string;
};

export default function Filters<TData>({
  table,
  initialValues,
}: FiltersProps<TData>) {
  const form = useForm<Inputs>({ defaultValues: { ...initialValues } });
  const onSubmit: SubmitHandler<Inputs> = (data) => {
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
              {Object.entries(initialValues).map(([columnName]) => (
                <FormField
                  control={form.control}
                  name={columnName as keyof Inputs}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-muted-foreground">
                        {columnName}
                      </FormLabel>
                      <Input
                        {...field}
                        className=" h-6 border border-[#71EBD4]  focus-visible:ring-[#71EBD4]"
                      />
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
