"use client";
import { TableCell } from "~/components/ui/table";
import { CircleChevronDown } from "lucide-react";
import { useState } from "react";
import TriggerTable from "./trigger-table";
import ContentTable from "./content-table";
import { Factura } from "~/server/db/schema";
import type { RouterOutputs } from "~/trpc/shared";
import { computeBase } from "~/lib/utils";
import { api } from "~/trpc/react";

// cuotaValue: number;

// subTotal: number;

export default function TableRowContainer(props: {
  preliquidation: RouterOutputs["liquidations"]["get"];
  factura: any;
  periodo: string;
}) {
  const [active, setActive] = useState(false);
  console.log("facturasTT", props.factura);

  const total = parseFloat(props.factura[0].importe.toFixed(2));
  const { data: lastEvent } = api.events.getLastByDateAndCC.useQuery({
    ccId: props.factura[0].family_group?.cc?.id!,
    date: props.factura[0].liquidations?.createdAt ?? new Date(),
  });
  const subTotal = computeBase(total, Number(props.factura[0].iva!));
  return (
    <>
      <TriggerTable
        setActive={setActive}
        active={active}
        factura={props.factura[0]}
        preliquidation={props.preliquidation}
        total={total}
        interestValue={props.factura[0].items?.interest ?? 0}
        contributionValue={props.factura[0].items?.contribution ?? 0}
        bonificationValue={props.factura[0].items?.bonificacion ?? 0}
        previousBillValue={props.factura[0].items?.previous_bill ?? 0}
        currentAccountAmount={lastEvent?.current_amount ?? 0}
        cuotaValue={props.factura[0].items?.abono ?? 0}
      />
      {active &&
        props.factura.map((factura: any) => {
          return (
            <ContentTable
              factura={factura}
              period={props.periodo}
              interestValue={factura.items?.interest ?? 0}
              contributionValue={factura.items?.contribution ?? 0}
              bonificationValue={factura.items?.bonificacion ?? 0}
              previousBillValue={factura.items?.previous_bill ?? 0}
              cuotaValue={factura.items?.abono ?? 0}
              total={total}
            />
          );
        })}
    </>
  );
}
