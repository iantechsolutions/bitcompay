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
import { aportes_os } from "~/server/db/schema";
import AportesTable from "./aportes-table";
type DetailSheetProps = {
  data: {
    comprobantes: RouterOutputs["comprobantes"]["getByLiquidation"];
    currentAccountAmount: number;
    id: string;
    nombre: string;
    cuit: string;
  };
  open: boolean;
  liquidationId: string;
  setOpen: (open: boolean) => void;
};

export function formatCurrency(amount: number) {
  return Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    currencyDisplay: "narrowSymbol",
  }).format(amount);
}
export default function DetailSheet({
  data,
  open,
  setOpen,
  liquidationId,
}: DetailSheetProps) {
  const { data: familyGroup } = api.family_groups.getWithAportes.useQuery({
    family_groupsId: data.id,
  });

  let aportesOS: RouterOutputs["aportes_os"]["list"] = [];
  familyGroup?.integrants?.map((integrant) => {
    aportesOS = [...aportesOS, ...integrant.aportes_os];
  });

  console.log("comprobantes");
  console.log(data.comprobantes);

  let comprobanteNCReciente = data.comprobantes.find(
    (comprobante) =>
      comprobante.origin === "Nota de credito" &&
      comprobante.liquidation_id === liquidationId
  );
  console.log("comprobanteNCReciente", comprobanteNCReciente);
  let comprobanteFCReciente = data.comprobantes.find(
    (comprobante) =>
      comprobante.origin === "Factura" &&
      comprobante.liquidation_id === liquidationId
  );
  console.log("comprobanteFCReciente", comprobanteFCReciente);

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

  let total_aportes = 0;
  
  aportesOS?.forEach((aporte) => {
    total_aportes += parseInt(aporte.amount);
  });

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent className="sm:max-w-[550px] px-10 py-12 overflow-y-scroll">
        <SheetHeader>
          <SheetTitle className="font-semibold text-2xl text-[#3e3e3e] ">
            Detalle del movimiento
          </SheetTitle>
          <SheetDescription>
            <Link
              href={`/management/client/affiliates/${data.id}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              <ul className="mt-2 text-base">
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

        <div className="flex flex-row border-none justify-between items-center p-5 py-8 rounded-md mt-3 bg-[#f7f7f7]">
          <p className="text-lg font-medium">Saldo actual </p>
          <p className="text-[#6952EB] font-semibold text-xl">
            {formatCurrency(data.currentAccountAmount)}
          </p>
        </div>

        <div className="mt-4">
          {comprobanteNCReciente && (
            <>
              <h1 className="text-base uppercase font-bold mb-3">
                {String(comprobanteNCReciente.tipoComprobante).toLowerCase()}
              </h1>
              <ContentTable comprobante={comprobanteNCReciente} />
              <div className="mt-3">
                <div className="bg-[#DEF5DD] flex flex-row justify-between items-center p-3 rounded-md mt-2">
                  <p className=" text-[#6952EB] font-[550]">Total: </p>
                  <p className="text-[#6952EB] font-[550]">
                    {NCTotal ? `${formatCurrency(NCTotal)}` : "N/A"}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
        <div className="mt-4">
          {comprobanteFCReciente && (
            <>
              <h1 className="text-base uppercase font-bold mb-3">
                {String(comprobanteFCReciente.tipoComprobante).toLowerCase()}
              </h1>
              <ContentTable comprobante={comprobanteFCReciente} />
              <div className="mt-3">
                <div className="bg-[#DEF5DD] flex flex-row justify-between items-center p-3 rounded-md mt-2">
                  <p className=" text-[#6952EB] font-[550] ">Saldo a pagar:</p>
                  <p className="text-[#6952EB] font-[550] ">
                    {saldo_a_pagar ? `${formatCurrency(saldo_a_pagar)}` : "N/A"}
                  </p>
                </div>
              </div>
            </>
          )}
        </div>
        {/* <div className="mt-4">
          {aportesOS && aportesOS.length > 0 && (
            <>
              <h1 className="text-base uppercase font-bold mb-3">
                Detalle de aportes
              </h1>
              <AportesTable aportesOS={aportesOS ?? []} />
              <div className="mt-3">
                <div className="bg-[#DEF5DD] flex flex-row justify-between items-center p-3 rounded-md mt-2">
                  <p className=" text-[#6952EB] font-[550] ">Total:</p>
                  <p className="text-[#6952EB] font-[550] ">
                    {total_aportes
                      ? `${formatCurrency(total_aportes)}`
                      : "$0,00"}
                  </p>
                </div>
              </div>
            </>
          )}
        </div> */}
      </SheetContent>
    </Sheet>
  );
}
