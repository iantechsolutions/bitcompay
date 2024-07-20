import { SlidersHorizontal } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { Button } from "../ui/button";
import { Table } from "@tanstack/react-table";
interface FiltersProps<TData> {
  table: Table<TData>;
}
export default function Filters<TData>({ table }: FiltersProps<TData>) {
  return (
    <Popover>
      <PopoverTrigger>
        <Button
          variant={"outline"}
          className="rounded-full px-5 bg-[#43d2b8] hover:bg-[#43d2b8] h-7 text-white hover:text-white"
          color="#43d2b8"
        >
          <SlidersHorizontal className="mr-2 h-3 w-auto" /> Filtros{" "}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="p-0" align="start">
        <div>Form</div>
      </PopoverContent>
    </Popover>
  );
}
