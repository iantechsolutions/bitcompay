"use client";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import "dayjs/locale/es";
import { ChevronDown, ViewIcon, Printer } from "lucide-react";
import Edit02Icon from "~/components/icons/edit-02-stroke-rounded";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
export type TableRecord = {
  date: Date;
  description: string;
  amount: number;
  comprobanteType: string;
  comprobanteNumber: string;
  status: "Pagada" | "Pendiente";
  iva: number;
};

dayjs.locale("es");
export const columns: ColumnDef<TableRecord>[] = [
  {
    accessorKey: "description",
    header: () => null,
    cell: ({ row }) => {
      return (
        <div className="relative h-20 flex flex-col justify-center w-96">
          <p className="absolute top-0 text-[#c4c4c4] text-xs">
            {" "}
            {dayjs(row.getValue("date")).format("D [de] MMMM ")}
          </p>
          <p className="font-bold text-sm absolute top-1/2 transform -translate-y-1/2"> {row.getValue("description")} </p>
          <p className="text-[#c4c4c4] text-xs absolute top-1/2 transform translate-y-4">
            {" "}
            {row.getValue("comprobanteType")} - №{" "}
            {row.getValue("comprobanteNumber")}{" "}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "comprobanteType",
    header: () => null,
    cell: ({ row }) => {
      return null;
    },
  },
  {
    accessorKey: "comprobanteNumber",
    header: () => null,
    cell: ({ row }) => {
      return null;
    },
  },
  {
    accessorKey: "iva",
    header: () => null,
    cell: ({ row }) => {
      return null;
    },
  },
  {
    accessorKey: "status",
    header: () => null,
    cell: ({ row }) => {
      const status = row.getValue("status");
      const style =
        status === "pagado"
          ? "bg-[#DDF9CC] text-[#4E9F1D]"
          : "bg-[#F9E7CC] text-[#F69709]";
      return (
        <div>
          <div
            className={`rounded-full inline-block font-bold ${style} px-7 py-1`}
          >
            {" "}
            {row.getValue("status")}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "amount",
    header: () => null,
    cell: ({ row }) => {
      const amount = parseFloat(row.getValue("amount"));
      const formatted = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: "USD",
      }).format(amount);
      return (
        <div className="relative h-full flex flex-col justify-center items-center mx-10 mr-14">
          <div className="absolute top-1/2 transform -translate-y-1/2 font-bold">
            {formatted}
          </div>
          <div className="absolute top-1/2 transform translate-y-4 text-[#c4c4c4] text-xs">
            IVA: {(row.getValue("iva") as number) * 100} %
          </div>
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => (
      <DropdownMenu>
        <DropdownMenuTrigger asChild className="flex justify-between">
          <Button className="bg-[#f7f7f7] hover:bg-[#f7f7f7] rounded-xl p-0 text-[#3e3e3e] text-xs h-5 shadow-none px-4">
            Acciones
            <ChevronDown className="h-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-[#f7f7f7] hover:bg-[#f7f7f7] ">
          <DropdownMenuItem>
            <ViewIcon className="mr-1 h-4" /> Ver
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Printer className="mr-1 h-4" />
            Imprimir
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Edit02Icon className="mr-1 h-4" /> Ajustar
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    ),
  },
];
