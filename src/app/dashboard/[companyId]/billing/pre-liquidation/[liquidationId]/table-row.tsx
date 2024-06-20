"use client";
import { TableCell } from "~/components/ui/table";
import { CircleChevronDown } from "lucide-react";
import { useState } from "react";
import TriggerTable from "./trigger-table";
import ContentTable from "./content-table";
import { Facturas } from "~/server/db/schema";
import type { RouterOutputs } from "~/trpc/shared";
import { computeBase } from "~/lib/utils";

// cuotaValue: number;

// subTotal: number;

export default function TableRowContainer(props: {
  factura: RouterOutputs["facturas"]["list"][number];
  periodo: string;
}) {
  const [active, setActive] = useState(false);
  const total = parseFloat(props.factura.importe.toFixed(2));
  const subTotal = computeBase(total, Number(props.factura.iva!));
  return (
    <>
      <TriggerTable
        setActive={setActive}
        active={active}
        factura={props.factura}
        total={total}
        interestValue={props.factura.items?.interest ?? 0}
        contributionValue={props.factura.items?.contribution ?? 0}
        bonificationValue={props.factura.items?.bonificacion ?? 0}
        previousBillValue={props.factura.items?.previous_bill ?? 0}
        cuotaValue={props.factura.items?.abono ?? 0}
      />
      {active && (
        <ContentTable
          factura={props.factura}
          period={props.periodo}
          interestValue={props.factura.items?.interest ?? 0}
          contributionValue={props.factura.items?.contribution ?? 0}
          bonificationValue={props.factura.items?.bonificacion ?? 0}
          previousBillValue={props.factura.items?.previous_bill ?? 0}
          cuotaValue={props.factura.items?.abono ?? 0}
          total={total}
        />
      )}
    </>
  );
}
