import { ChevronDown, ChevronRight, FileText, TriangleAlert } from "lucide-react";
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
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogHeader,
} from "~/components/ui/dialog";
type DetailSheetProps = {
  data: {
    comprobantes: RouterOutputs["comprobantes"]["getByLiquidation"];
    currentAccountAmount: number;
    nombre: string;
    cuit: string;
    id: string;
  };
  open: boolean;
  setOpen: (open: boolean) => void;
  liquidationId: string;
};
import Download02Icon from "~/components/icons/download-02-stroke-rounded";
import { formatCurrency } from "../../pre-liquidation/[liquidationId]/detail-sheet";

type Comprobante = RouterOutputs["comprobantes"]["getByLiquidation"][number];

export default function DetailSheet({
  data,
  open,
  setOpen,
  liquidationId,
}: DetailSheetProps) {
  const [openFCAccordion, setOpenFCAccordion] = useState(true);
  const [openNCAccordion, setOpenNCAccordion] = useState(true);
  const [openNCError, setOpenNCError] = useState(false);
  const [openFCError, setOpenFCError] = useState(false);
  let comprobanteNCReciente = data.comprobantes.find(
    (comprobante) =>
      comprobante.origin === "Nota de credito" &&
      comprobante.liquidation_id === liquidationId
  );
  let comprobanteFCReciente = data.comprobantes.find(
    (comprobante) =>
      comprobante.origin === "Factura" &&
      comprobante.liquidation_id === liquidationId
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
            <Link
              href={`/management/client/affiliates/${data.id}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              <ul className="mt-2">
                <li className="text-xs"> RECEPTOR </li>
                <li className="font-medium text-[#3e3e3e]">
                  {" "}
                  {data.nombre ?? "-"}
                </li>
                <br />
                <li className="text-xs"> CUIL/CUIT </li>
                <li className="font-medium text-[#3e3e3e]">
                  {data.cuit ?? "-"}
                </li>
                <br />
              </ul>
            </Link>
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
                  <p className=" text-[#6952EB] font-semibold">Total: </p>
                  <p className="text-[#6952EB] font-semibold">
                    {NCTotal ? `${formatCurrency(NCTotal)}` : "N/A"}
                  </p>
                </div>
              </div>
              <div>
                <div className="flex flex-auto justify-end">

                  {
                    comprobanteNCReciente?.estado?.toLowerCase()==="error"
                    ?
                    (
                      <Button
                    className="text-base px-7 py-[1.27rem] mt-5 gap-3 bg-[#eb272753] hover:bg-[#eb272753] text-[#3e3e3e] rounded-full font-medium"
                    onClick={() => {
                      setOpenNCError(true);
                    }}
                  >
                    <TriangleAlert className="h-5" />
                    Este comprobante tiene errores
                    </Button>
                    )
                    :
                    (
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
                    )
                  }
                  
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
                {
                    comprobanteFCReciente?.estado?.toLowerCase()==="error" ?
                    
                    (
                      <Button
                    className="text-base px-7 py-[1.27rem] mt-5 gap-3 bg-[#eb272753] hover:bg-[#eb272753] text-[#3e3e3e] rounded-full font-medium"
                    onClick={() => {
                      setOpenFCError(true);
                    }}
                  >
                    <TriangleAlert className="h-5" />
                    Este comprobante tiene errores
                    </Button>
                    )
                    :
                    (

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
                    )
                  }

                  
                </div>
              </div>
            </>
          )}
        </div>
      </SheetContent>

      <Dialog open={openFCError} onOpenChange={setOpenFCError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="ml-2">
              {"Error enviandose a afip"}
            </DialogTitle>
          </DialogHeader>
          <div className="pb-1">
            Este comprobante no se pudo enviar a la AFIP por que surgio el siguiente error:
          </div>
          <div className="pb-2">
            <p className=" text-xs">
              {(comprobanteFCReciente?.afipError?.length ?? 0) > 200 ? ( comprobanteFCReciente?.afipError?.slice(0,200) + "..." ) : comprobanteFCReciente?.afipError }
            </p>
          </div>
          <Button
            className="h-7 bg-[#f7f7f7] hover:bg-[#f7f7f7] text-[#3e3e3e] font-medium-medium text-sm rounded-2xl py-4 px-4 shadow-none"
            onClick={() => {setOpenFCError(false)}}
            >
              Cerrar
            </Button>

        </DialogContent>
      </Dialog>
      <Dialog open={openNCError} onOpenChange={setOpenNCError}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="ml-2">
              {"Crear un plan"}
            </DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>

    </Sheet>
  );
}
