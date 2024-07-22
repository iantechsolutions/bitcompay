import {
  ChevronLeftIcon,
  ChevronRightIcon,
  DoubleArrowLeftIcon,
  DoubleArrowRightIcon,
} from "@radix-ui/react-icons";
import { Table } from "@tanstack/react-table";

import { Button } from "~/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";

interface DataTablePaginationProps<TData> {
  table: Table<TData>;
}

export function DataTablePagination<TData>({
  table,
}: DataTablePaginationProps<TData>) {
  const totalRows = table.getFilteredRowModel().rows.length;
  const { pageIndex, pageSize } = table.getState().pagination;
  const firstRowShown = pageIndex * pageSize + 1;
  const lastRowShown = Math.min(
    (pageIndex + 1) * pageSize,
    table.getFilteredRowModel().rows.length
  );
  const totalPages = Math.ceil(totalRows / pageSize);
  const goToPage = (pageNumber: number) => {
    table.setPageIndex(pageNumber);
  };
  return (
    <div className="flex items-center justify-between px-2 mt-2 w-full">
      <div className="flex items-center space-x-2">
        <p className="text-sm text-muted-foreground ">Mostrar</p>
        <Select
          value={`${table.getState().pagination.pageSize}`}
          onValueChange={(value) => {
            table.setPageSize(Number(value));
          }}
        >
          <SelectTrigger className="h-4 w-[70px]">
            <SelectValue placeholder={table.getState().pagination.pageSize} />
          </SelectTrigger>
          <SelectContent side="top">
            {[10, 20, 30, 40, 50].map((pageSize) => (
              <SelectItem
                key={pageSize}
                value={`${pageSize}`}
                className="text-xs"
              >
                {pageSize}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="ml-2 flex-1 text-sm text-muted-foreground">
        Mostrando <span className="font-bold"> {firstRowShown}</span> a{" "}
        <span className="font-bold"> {lastRowShown}</span> de{" "}
        <span className="font-bold">{totalRows} </span> entradas
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          className="h-8 w-auto p-0"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previo
        </Button>
        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index}
            className={`px-3 h-5 w-auto text-[0.6rem] rounded-md text-muted-foreground ${
              pageIndex === index ? "bg-[#71EBD4] " : "bg-gray-200"
            }`}
            onClick={() => goToPage(index)}
          >
            {index + 1}
          </button>
        ))}

        <Button
          variant="outline"
          className="h-8 w-auto p-0"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
}
