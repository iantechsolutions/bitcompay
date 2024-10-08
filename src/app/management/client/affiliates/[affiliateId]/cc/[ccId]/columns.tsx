"use client";
import { ColumnDef } from "@tanstack/react-table";
import dayjs from "dayjs";
import "dayjs/locale/es";
import utc from "dayjs/plugin/utc";
import { ChevronDown, ViewIcon, Printer, CircleCheck, CircleX, CalendarIcon } from "lucide-react";
import Edit02Icon from "~/components/icons/edit-02-stroke-rounded";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "~/components/ui/dropdown-menu";
import { ChangeEvent, useState } from "react";
import DetailSheet from "./components_acciones/detail-sheet";
import DialogCC from "./components_acciones/dialog";
import { RouterOutputs } from "~/trpc/shared";

export type TableRecord = {
  date: Date;
  description: string;
  amount: number;
  comprobanteType: string;
  comprobanteNumber: string;
  status: "Pagada" | "Pendiente";
  iva: number;
  comprobantes?: RouterOutputs["comprobantes"]["getByLiquidation"];
  currentAccountAmount: number;
  saldo_a_pagar: number;
  nombre: string;
  cuit: string;
  [index: string]: any;
};

export const AjustarDialog = () => {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [adjustType, setAdjustType] = useState<string | null>(null);
  const [concept, setConcept] = useState<string | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [user, setUser] = useState<string>("");
  
  const handleDateChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSelectedDate(e.target.value);
  };
}; 


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
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
      return (
        <div className="relative h-full flex flex-col justify-center items-center mx-10 mr-14">
          <div className="absolute top-1/2 transform -translate-y-1/2 font-bold">
            {formatted}
          </div>
          <div className="absolute top-1/2 transform translate-y-4 text-[#c4c4c4] text-xs">
            IVA: {Math.round((row.getValue("iva") as number) * 100)} %
          </div>
        </div>
      );
    },
  },
  
    {
      id: "actions",
      cell: ({ row }) => {
        
        const [dialogOpen, setDialOpen] = useState(false);
        const [sheetOpen, setSheetOpen] = useState(false);
        const [detailData, setDetailData] = useState<TableRecord | null>(null);

        const handleMenuClick = () => {
          let detailData = row.original as TableRecord;

          setDetailData(detailData);
          setSheetOpen(!sheetOpen);
        };

         return (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild className="flex justify-between">
                <Button className="bg-[#f7f7f7] hover:bg-[#f7f7f7] rounded-xl p-0 text-[#3e3e3e] text-xs h-5 shadow-none px-4">
                  Acciones
                  <ChevronDown className="h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-[#f7f7f7] hover:bg-[#f7f7f7]">
                <DropdownMenuItem onClick={() => handleMenuClick()}>
                  <ViewIcon className="mr-1 h-4" /> Ver
                  
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <Printer className="mr-1 h-4" /> Imprimir
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => setDialOpen(true)}>
                  <Edit02Icon className="mr-1 h-4" /> Ajustar
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
    
           {detailData && <DetailSheet
              open={sheetOpen}
              setOpen={setSheetOpen}
              data={detailData}
              />}
            
             <DialogCC
             open={dialogOpen} 
             setOpen={setDialOpen}
             />   
            
    </>
  );
},
},
]