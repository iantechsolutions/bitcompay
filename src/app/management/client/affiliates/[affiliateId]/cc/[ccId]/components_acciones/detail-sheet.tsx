import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/tablePreliq";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { RouterOutputs } from "~/trpc/shared";
import { useState } from "react";
import { api } from "~/trpc/react";
import ContentTable from "~/app/billing/liquidation/[liquidationId]/content-table";

type DetailSheetProps = {
  data?: {
    date: Date;
    description: string;
    amount: string;
    "Tipo comprobante": string;
    comprobanteNumber: number;
    Estado: "Pagada" | "Pendiente";
    iva: number;
    comprobantes?: RouterOutputs["comprobantes"]["getByLiquidation"][number];
    currentAccountAmount: string;
    saldo_a_pagar: string;
    nombre: string;
    cuit: string;
    event: {
      id: string;
      description: string;
      createdAt: Date;
      comprobante_id: string | null;
      type: "NC" | "FC" | "REC" | null;
      currentAccount_id: string | null;
      event_amount: number;
      current_amount: number;
    } | null;
    [index: string]: any;
  };
  open: boolean;
  setOpen: (open: boolean) => void;
};

type comprobantes = RouterOutputs["comprobantes"]["getByLiquidation"];

export default function DetailSheet({ data, open, setOpen }: DetailSheetProps) {
  let comprobanteFCReciente = data?.comprobantes;
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="sm:max-w-[550px] px-10 py-12 overflow-y-scroll">
        <SheetHeader>
          <SheetTitle className="font-semibold text-2xl">
            Detalle del movimiento
          </SheetTitle>
          <SheetDescription>
            <ul className="mt-2">
              <li className="text-xs"> RECEPTOR </li>
              <li className="font-medium-medium text-[#3e3e3e]">
                {data?.nombre ?? "-"}
              </li>
              <br />
              <li className="text-xs"> CUIL/CUIT </li>
              <li className="font-medium-medium text-[#3e3e3e]">
                {data?.cuit ?? "-"}
              </li>
              <br />
            </ul>
          </SheetDescription>
        </SheetHeader>
        {data && data["Tipo comprobante"] == "Apertura de CC" ? (
          <div className="flex flex-row border justify-between items-center px-4 py-5 gap-2 rounded-md mt-3">
            <p className="text-base whitespace-nowrap font-medium-medium ">
              Saldo actual{" "}
            </p>
            <p className="text-[#6952EB] whitespace-nowrap font-semibold text-lg">
              {data?.amount}
            </p>
          </div>
        ) : (
          <>
            <div className="flex flex-row border justify-between items-center px-4 py-5 gap-2 rounded-md mt-3">
              <p className="text-base whitespace-nowrap font-medium-medium ">
                Saldo actual{" "}
              </p>
              <p className="text-[#6952EB] whitespace-nowrap font-semibold text-lg">
                {data?.currentAccountAmount}
              </p>
            </div>

            <div className="bg-[#DEF5DD] flex flex-row justify-between items-center py-4 px-6 rounded-md mt-4">
              <p className=" text-[#6952EB] font-semibold">Importe total: </p>
              <p className="text-[#6952EB] font-semibold">
                {data?.saldo_a_pagar}
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
