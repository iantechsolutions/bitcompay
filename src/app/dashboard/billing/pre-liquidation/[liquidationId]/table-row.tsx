"use client";
import { TableCell } from "~/components/ui/table";
import { CircleChevronDown } from "lucide-react";
import { useState } from "react";
import TriggerTable from "./trigger-table";
import ContentTable from "./content-table";
import { Factura, family_groups } from "~/server/db/schema";
import type { RouterOutputs } from "~/trpc/shared";
import { computeBase } from "~/lib/utils";
import { api } from "~/trpc/react";

// cuotaValue: number;

// subTotal: number;

export default function TableRowContainer(props: {
  preliquidation: RouterOutputs["liquidations"]["get"];
  family_group: RouterOutputs["family_groups"]["getByLiquidation"][number];
  periodo: string;
}) {
  const [active, setActive] = useState(false);
  const facturas = props.family_group?.facturas;

  console.log("facturasTT", facturas);

  const original_factura = facturas?.find(
    (factura) => factura?.origin?.toLowerCase() === "original"
  );
  if (!original_factura) {
    return <div>No existe factura original</div>;
  }
  const total = parseFloat(original_factura.importe.toFixed(2));
  const { data: lastEvent } = api.events.getLastByDateAndCC.useQuery({
    ccId: props.family_group?.cc?.id!,
    date: props.preliquidation?.createdAt ?? new Date(),
  });

  const subTotal = computeBase(total, Number(original_factura.iva!));
  return (
    <>
      <TriggerTable
        setActive={setActive}
        active={active}
        factura={original_factura}
        preliquidation={props.preliquidation}
        total={total}
        family_group={props.family_group}
        currentAccountAmount={lastEvent?.current_amount ?? 0}
      />
      {active &&
        facturas?.map((factura) => {
          return (
            <ContentTable
              factura={factura}
              period={props.periodo}
              total={total}
            />
          );
        })}
    </>
  );
}
