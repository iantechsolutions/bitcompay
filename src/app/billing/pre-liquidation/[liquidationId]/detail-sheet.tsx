import { ChevronDown, ChevronRight, FileText } from "lucide-react";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import { ScrollArea } from "~/components/ui/scroll-area";
import ContentTable from "./content-table";
import { RouterOutputs } from "~/trpc/shared";
import { useState } from "react";
import { api } from "~/trpc/react";
import Download02Icon from "~/components/icons/download-02-stroke-rounded";
import { format } from "path";
type DetailSheetProps = {
  data: {
    comprobantes: RouterOutputs["comprobantes"]["getByLiquidation"];
    currentAccountAmount: number;
    nombre: string;
    cuit: string;
  };
  open: boolean;
  setOpen: (open: boolean) => void;
};

type Comprobante = RouterOutputs["comprobantes"]["getByLiquidation"][number];

export function formatCurrency(amount: number) {
  return (Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    currencyDisplay: "narrowSymbol",
  }).format(amount));
}; 
export default function DetailSheet({ data, open, setOpen }: DetailSheetProps) {
  const [openFCAccordion, setOpenFCAccordion] = useState(true); // Qué es esto??
  const [openNCAccordion, setOpenNCAccordion] = useState(false);
  let comprobanteNCReciente =   data.comprobantes.find(
    (comprobante) => comprobante.origin === "Nota de credito"
  );
  let comprobanteFCReciente = data.comprobantes.find(
    (comprobante) => comprobante.origin === "Factura"
  );

  let FCTotal = null;
  let NCTotal = null;
  if (comprobanteFCReciente) {
    FCTotal = comprobanteFCReciente.items.find(
      (item) => item.concept === "Total factura"
    )?.total;
  }
  if (comprobanteNCReciente) {
    NCTotal = comprobanteNCReciente.items.find(
      (item) => item.concept === "Nota de credito"
    )?.amount;
  }

  const total_a_pagar = comprobanteFCReciente?.items.find(
    (item) => item.concept == "Total a pagar"
  )?.total;
  let saldo_a_pagar = FCTotal;
  if (FCTotal && total_a_pagar) {
    saldo_a_pagar = FCTotal - total_a_pagar;
  }
  

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="sm:max-w-[550px] px-10 py-12 overflow-y-scroll">
        <SheetHeader>
          <SheetTitle className="font-semibold text-2xl text-[#3e3e3e] ">
            Detalle del movimiento
          </SheetTitle>
          <SheetDescription>
            <ul className="mt-2 text-base">
              <li className="text-xs"> RECEPTOR </li>
              <li className="font-medium text-[#3e3e3e]">
                {" "}
                {data.nombre ?? "-"}
              </li>
              <br />
              <li className="text-xs"> CUIL/CUIT </li>
              <li className="font-medium text-[#3e3e3e]">{data.cuit ?? "-"}</li>
              <br />
            </ul>
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-row border-none justify-between items-center p-5 py-8 rounded-md mt-3 bg-[#f7f7f7]">
          <p className="text-lg font-medium">Saldo actual </p>
          <p className="text-[#6952EB] font-semibold text-xl">
            $ {data.currentAccountAmount}
          </p>
        </div>

        <div className="mt-5">
          {comprobanteNCReciente && (
            <>
              <h1 className="text-base font-bold mb-3">
                {comprobanteNCReciente.tipoComprobante}
              </h1>
              <ContentTable comprobante={comprobanteNCReciente} />
              <div className="mt-3">
                <div className="bg-[#DEF5DD] flex flex-row justify-between items-center p-3 rounded-md mt-2">
                  <p className=" text-[#6952EB] font-[550]">
                    Total:{" "}
                  </p>
                  <p className="text-[#6952EB] font-[550]">
                    {NCTotal ? `$ ${NCTotal}` : "N/A"}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="mt-4">
          {comprobanteFCReciente && (
            <>
              <h1 className="text-base font-bold mb-3">
                {comprobanteFCReciente.tipoComprobante}
              </h1>
              <ContentTable comprobante={comprobanteFCReciente} />
              <div className="mt-3">
                <div className="bg-[#DEF5DD] flex flex-row justify-between items-center p-3 rounded-md mt-2">
                  <p className=" text-[#6952EB] font-[550] ">
                    Saldo a pagar:{" "}
                  </p>
                  <p className="text-[#6952EB] font-[550] ">
                    {saldo_a_pagar ? `${formatCurrency(saldo_a_pagar)}` : "N/A"}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
