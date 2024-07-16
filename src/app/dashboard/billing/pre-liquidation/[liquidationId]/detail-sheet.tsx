import { ChevronDown, ChevronRight } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "~/components/ui/sheet";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
} from "~/components/ui/accordion";
import ContentTable from "./content-table";
import { RouterOutputs } from "~/trpc/shared";
import { useState } from "react";

type DetailSheetProps = {
  facturas: RouterOutputs["facturas"]["getByLiquidation"];
  name: string;
  open: boolean;
  setOpen: (open: boolean) => void;
};
export default function DetailSheet({
  facturas,
  name,
  open,
  setOpen,
}: DetailSheetProps) {
  const [openFCAccordion, setOpenFCAccordion] = useState(false);
  const [openNCAccordion, setOpenNCAccordion] = useState(false);
  const summary = {
    "Cuota Planes": 175517.82,
    Bonificación: 175517.82,
    Diferencial: 175517.82,
    Aportes: 175517.82,
    Interés: 175517.82,
  };
  let facturaNCReciente = null;
  let facturaFCReciente = null;

  for (const factura of facturas) {
    if (factura.origin === "Nota de credito") {
      if (
        !facturaNCReciente ||
        new Date(factura.createdAt) > new Date(facturaNCReciente.createdAt)
      ) {
        facturaNCReciente = factura;
      }
    } else {
      if (
        !facturaFCReciente ||
        new Date(factura.createdAt) > new Date(facturaFCReciente.createdAt)
      ) {
        facturaFCReciente = factura;
      }
    }
  }
  let FCTotal = null;
  let NCTotal = null;
  if (facturaFCReciente) {
    FCTotal = facturaFCReciente.items.find(
      (item) => item.concept == "Total a pagar"
    )?.total;
  }
  if (facturaNCReciente) {
    NCTotal = facturaNCReciente.items.find(
      (item) => item.concept == "Nota de credito"
    )?.amount;
  }
  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="sm:max-w-[550px] px-10 py-12">
        <SheetHeader>
          <SheetTitle className="font-medium text-2xl">Detalle</SheetTitle>
          <SheetDescription>
            <ul className="ml-3">
              <li className="list-disc">
                {" "}
                <span className="font-bold">Nombre:</span> {name}
              </li>
              <li className="list-disc">
                <span className="font-bold">CUIT:</span>{" "}
              </li>
            </ul>
          </SheetDescription>
        </SheetHeader>

        <div className="bg-[#ecf7f5] flex flex-row justify-evenly gap-0.5 w-full mt-2 py-3">
          {Object.entries(summary).map(([key, value]) => (
            <div key={key}>
              <p className="font-medium text-xs">{key}</p>
              <p className="text-[#4af0d4] font-bold text-sm">$ {value}</p>
            </div>
          ))}
        </div>
        <div className="mt-2">
          <div
            className="flex flex-row justify-between py-2 mb-3 bg-[#fffefe] transition-all"
            onClick={() => setOpenNCAccordion(!openNCAccordion)}
          >
            <p className="text-2xl font-medium opacity-70 flex flex-row items-center">
              {openNCAccordion ? (
                <ChevronDown
                  className="mr-2 transition-transform duration-200"
                  size={20}
                />
              ) : (
                <ChevronRight
                  className="mr-2 transition-transform duration-200"
                  size={20}
                />
              )}
              NC
            </p>
            <p className="text-lg font-semibold text-[#4af0d4]">
              {NCTotal ? `$ ${NCTotal}` : "N/A"}
            </p>
          </div>
          {openNCAccordion && facturaNCReciente && (
            <ContentTable factura={facturaNCReciente} />
          )}

          <div
            className="flex flex-row justify-between py-2 mb-3 bg-[#fffefe] mt-2"
            onClick={() => setOpenFCAccordion(!openFCAccordion)}
          >
            <p className="text-2xl font-medium opacity-70 flex flex-row items-center">
              {openFCAccordion ? (
                <ChevronDown className="mr-2" size={20} />
              ) : (
                <ChevronRight className="mr-2" size={20} />
              )}
              FC
            </p>
            <p className="text-lg font-semibold text-[#4af0d4]">
              {FCTotal ? `$ ${FCTotal * -1}` : "N/A"}
            </p>
          </div>
          {openFCAccordion && facturaFCReciente && (
            <ContentTable factura={facturaFCReciente} />
          )}
        </div>
        <div className="mt-3">
          {Object.entries({
            "Saldo actual": 87567.23,
            "Saldo a pagar": 87567.23,
          }).map(([key, value]) => (
            <div className="bg-[#b7f3e8] flex flex-row justify-between px-1.5 py-2 rounded-md mt-2">
              <p className=" text-sm font-semibold opacity-70">{key}: </p>
              <p className="text-[#9b9a9a] text-xs">$ {value}</p>
            </div>
          ))}
        </div>
      </SheetContent>
    </Sheet>
  );
}
