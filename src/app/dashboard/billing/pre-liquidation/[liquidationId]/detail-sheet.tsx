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
export default function DetailSheet({ data, open, setOpen }: DetailSheetProps) {
  const [openFCAccordion, setOpenFCAccordion] = useState(true); // Qué es esto??
  const [openNCAccordion, setOpenNCAccordion] = useState(false);
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
              <li className="font-medium text-[#3e3e3e]"> {data.nombre}</li>
              <br /> 
              <li className="text-xs"> CUIL/CUIT </li>
              <li className="font-medium text-[#3e3e3e]">{data.cuit}</li>
              <br /> 
            </ul>
          </SheetDescription>
        </SheetHeader>

        <div className="flex flex-row border justify-between items-center p-5 rounded-md mt-3">
          <p className="text-lg font-medium-medium">Saldo actual </p>
          <p className="text-[#6952EB] font-semibold text-xl">
            $ {data.currentAccountAmount}
          </p>
        </div>

        <div className="mt-5">
          {/* {comprobanteNCReciente && (
            <div className="mt-2">
              <div
                className="flex flex-row justify-between items-center py-2 px-2 mb-3 rounded-md bg-[#c2bebe84] hover:bg-[#cbc7c7ce] transition-all hover:cursor-pointer"
                onClick={() => setOpenNCAccordion(!openNCAccordion)}
              >
                <p className="text-xl font-medium opacity-70 flex flex-row items-center">
                  {comprobanteNCReciente.billLink &&
                  comprobanteNCReciente.billLink !== "" ? (
                    <div className="items-center justify-center">
                      <Link href={comprobanteNCReciente.billLink}>
                        <FileText></FileText>
                      </Link>
                    </div>
                  ) : null}
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
              {openNCAccordion && (
                <ContentTable comprobante={comprobanteNCReciente} />
              )}
            </div>
          )}
          <div
            className="flex flex-row justify-between items-center py-2 px-2 mb-3 rounded-md bg-[#c2bebe84] hover:bg-[#cbc7c7ce] transition-all hover:cursor-pointer mt-5"
            onClick={() => setOpenFCAccordion(!openFCAccordion)}
          >
            <p className="text-xl font-medium opacity-70 flex flex-row items-center">
              {comprobanteFCReciente?.billLink &&
              comprobanteFCReciente?.billLink !== "" ? (
                <div className="items-center justify-center">
                  <Link href={comprobanteFCReciente?.billLink}>
                    <FileText></FileText>
                  </Link>
                </div>
              ) : null}
              FC
              {openFCAccordion ? (
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
              {FCTotal ? `$ ${FCTotal}` : "N/A"}
            </p>
          </div> */}
          {openFCAccordion && comprobanteFCReciente && (
            <ContentTable comprobante={comprobanteFCReciente} />
          )}
        </div>
        <div className="mt-3">
        <div className="bg-[#DEF5DD] flex flex-row justify-between items-center p-3 rounded-md mt-2">
            <p className=" text-[#4E9F1D] font-semibold opacity-60">Saldo a pagar: </p>
            <p className="text-[#4E9F1D] font-semibold opacity-60">
              {saldo_a_pagar ? `$ ${saldo_a_pagar}` : "N/A"}
            </p>
          </div>
          <div className="flex flex-auto justify-end">
                <Button
                    variant="bitcompay"
                    className=" text-lg px-8 py-6 mt-5 gap-3 text-[#3e3e3e] rounded-full font-medium"
                    onClick={() => {
                      !comprobanteFCReciente?.billLink
                        ? alert("El archivo no cargo todavia")
                        : window.open(comprobanteFCReciente?.billLink);
                      // : router.push(`${comprobante?.billLink}`);
                    }}
                  >
                   <Download02Icon />
                    Descargar Factura
                  </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
