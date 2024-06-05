"use client";
import { TableCell } from "~/components/ui/table";
import { CircleChevronDown } from "lucide-react";
import { useState } from "react";
import TriggerTable from "./trigger-table";
import ContentTable from "./content-table";
import { Facturas } from "~/server/db/schema";
import type { RouterOutputs } from "~/trpc/shared";

export default function TableRowContainer(props: {
  factura: RouterOutputs["facturas"]["list"][number];
  periodo: string;
}) {
  const [active, setActive] = useState(false);

  return (
    <>
      <TriggerTable
        setActive={setActive}
        active={active}
        factura={props.factura}
      />
      {active && (
        <ContentTable factura={props.factura} period={props.periodo} />
      )}
    </>
  );
}
