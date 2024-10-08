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
import Download02Icon from "~/components/icons/download-02-stroke-rounded";
import { formatCurrency } from "../../pre-liquidation/[liquidationId]/detail-sheet";

type Comprobante = RouterOutputs["comprobantes"]["getByLiquidation"][number];

export default function DetailSheet({ data, open, setOpen }: DetailSheetProps) {
  const [openFCAccordion, setOpenFCAccordion] = useState(true);
  const [openNCAccordion, setOpenNCAccordion] = useState(true);
  let comprobanteNCReciente = data.comprobantes.find(
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
          <SheetTitle className="font-medium text-2xl">
            Detalle del movimiento
          </SheetTitle>
          <SheetDescription>
            <ul className="mt-2">
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

        <div className="flex flex-row border justify-between items-center p-5 rounded-md mt-3 bg-[#f7f7f7]">
          <p className="text-lg font-medium-medium">Saldo actual </p>
          <p className="text-[#6952EB] font-semibold text-xl">
            {formatCurrency(data.currentAccountAmount)} 
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
                  <p className=" text-[#6952EB] font-semibold">
                    Total:{" "}
                  </p>
                  <p className="text-[#6952EB] font-semibold">
                    {NCTotal ? `${formatCurrency(NCTotal)}` : "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <div className="flex flex-auto justify-end">
                  <Button
                    variant="bitcompay"
                    className="text-base px-7 py-[1.27rem] mt-5 gap-3 text-[#3e3e3e] rounded-full font-medium"
                    onClick={() => {
                      !comprobanteNCReciente?.billLink
                        ? alert("El archivo no cargo todavia")
                        : window.open(comprobanteNCReciente?.billLink);
                      // : router.push(`${comprobante?.billLink}`);
                    }}
                  >
                    <Download02Icon className="h-5" />
                    Descargar Comprobante
                  </Button>
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
                  <p className=" text-[#6952EB] font-semibold ">
                    Saldo a pagar:{" "}
                  </p>
                  <p className="text-[#6952EB] font-semibold ">
                  {saldo_a_pagar ? `${formatCurrency(saldo_a_pagar)}` : "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <div className="flex flex-auto justify-end">
                  <Button
                    variant="bitcompay"
                    className="text-base px-7 py-[1.27rem] mt-5 gap-3 text-[#3e3e3e] rounded-full font-medium"
                    onClick={() => {
                      !comprobanteFCReciente?.billLink
                        ? alert("El archivo no cargo todavia")
                        : window.open(comprobanteFCReciente?.billLink);
                      // : router.push(`${comprobante?.billLink}`);
                    }}
                  >
                    <Download02Icon className="h-5" />
                    Descargar Comprobante
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
