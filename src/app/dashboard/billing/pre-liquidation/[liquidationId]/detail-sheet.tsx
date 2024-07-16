import { ChevronDown, ChevronRight } from "lucide-react";
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
  comprobantes: RouterOutputs["comprobantes"]["getByLiquidation"];
  currentAccountAmount: number;
  name: string;
  cuit: string;
  open: boolean;
  setOpen: (open: boolean) => void;
};

type Comprobante = RouterOutputs["comprobantes"]["getByLiquidation"][number];
export default function DetailSheet({
  comprobantes,
  currentAccountAmount,
  name,
  cuit,
  open,
  setOpen,
}: DetailSheetProps) {
  const [openFCAccordion, setOpenFCAccordion] = useState(false);
  const [openNCAccordion, setOpenNCAccordion] = useState(false);
  let comprobanteNCReciente = comprobantes.find(
    (comprobante) => comprobante.origin === "Nota de credito"
  );
  let comprobanteFCReciente = comprobantes.find(
    (comprobante) => comprobante.origin === "Original"
  );

  let FCTotal = null;
  let NCTotal = null;
  if (comprobanteFCReciente) {
    FCTotal = comprobanteFCReciente.items.find(
      (item) => item.concept === "Total a pagar"
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
  let saldo_a_pagar = null;
  if (FCTotal && total_a_pagar) {
    saldo_a_pagar = FCTotal - total_a_pagar;
  }
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <ScrollArea className="h-full overflow-auto">
        <SheetContent className="sm:max-w-[550px] px-10 py-12">
          <SheetHeader>
            <SheetTitle className="font-medium text-2xl">
              Detalle del movimientos
            </SheetTitle>
            <SheetDescription>
              <ul className="ml-3">
                <li className="">
                  {" "}
                  <span className="font-bold">Nombre:</span> {name}
                </li>
                <li className="">
                  <span className="font-bold">CUIT: </span>
                  {cuit}
                </li>
              </ul>
            </SheetDescription>
          </SheetHeader>

          <div className="bg-[#b7f3e8] flex flex-row justify-between px-1.5 py-2 rounded-md mt-2">
            <p className=" text-sm font-semibold opacity-70">Saldo actual: </p>
            <p className="text-[#9b9a9a] text-xs">$ {currentAccountAmount}</p>
          </div>
          <div className="mt-2">
            <div
              className="flex flex-row justify-between py-2 px-2 mb-3 rounded-md bg-[#c2bebe84] hover:bg-[#cbc7c7ce] transition-all hover:cursor-pointer"
              onClick={() => setOpenNCAccordion(!openNCAccordion)}
            >
              <p className="text-xl font-medium opacity-70 flex flex-row items-center ">
                NC
                {openNCAccordion ? (
                  <ChevronDown
                    className="ml-2 transition-transform duration-200"
                    size={12}
                  />
                ) : (
                  <ChevronRight
                    className="ml-2 transition-transform duration-200"
                    size={12}
                  />
                )}
              </p>
              <p className="text-lg font-semibold text-[#4af0d4]">
                {NCTotal ? `$ ${NCTotal}` : "N/A"}
              </p>
            </div>
            {openNCAccordion && comprobanteNCReciente && (
              <ContentTable comprobante={comprobanteNCReciente} />
            )}

            <div
              className="flex flex-row justify-between py-2 mb-3 rounded-md px-2 bg-[#c2bebe84] hover:bg-[#cbc7c7ce] mt-2 hover:cursor-pointer"
              onClick={() => setOpenFCAccordion(!openFCAccordion)}
            >
              <p className="text-xl font-medium opacity-70 flex flex-row items-center">
                FC
                {openFCAccordion ? (
                  <ChevronDown className="ml-2" size={12} />
                ) : (
                  <ChevronRight className="ml-2" size={12} />
                )}
              </p>
              <p className="text-lg font-semibold text-[#4af0d4]">
                {FCTotal ? `$ ${FCTotal * -1}` : "N/A"}
              </p>
            </div>
            {openFCAccordion && comprobanteFCReciente && (
              <ContentTable comprobante={comprobanteFCReciente} />
            )}
          </div>
          <div className="mt-3">
            <div className="bg-[#b7f3e8] flex flex-row justify-between px-1.5 py-2 rounded-md mt-2">
              <p className=" text-sm font-semibold opacity-70">
                Saldo a pagar:{" "}
              </p>
              <p className="text-[#9b9a9a] text-xs">
                {saldo_a_pagar ? `$ ${saldo_a_pagar}` : "N/A"}
              </p>
            </div>
          </div>
        </SheetContent>
      </ScrollArea>
    </Sheet>
  );
}
