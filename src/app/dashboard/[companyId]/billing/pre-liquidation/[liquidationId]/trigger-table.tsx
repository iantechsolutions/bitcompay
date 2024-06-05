"use client";
import {
  CircleChevronDown,
  CircleChevronRight,
  CircleChevronUp,
} from "lucide-react";
import { Router } from "next/router";
import { TableCell, TableRow } from "~/components/ui/tablePreliq";
import { Facturas } from "~/server/db/schema";
import { RouterOutputs } from "~/trpc/shared";

interface TriggerTableProps {
  setActive: (value: boolean) => void;
  active: boolean;
  factura: RouterOutputs["facturas"]["list"][number];
}

export default function TriggerTable({
  setActive,
  active,
  factura,
}: TriggerTableProps) {
  const subTotal =
    (factura?.items?.bonificacion ?? 0) * (factura?.items?.abono ?? 0) +
    (factura?.items?.differential_amount ?? 0) * (factura?.items?.abono ?? 0) +
    (factura?.items?.contribution ?? 0) * (factura?.items?.abono ?? 0) +
    (factura?.items?.interest ?? 0) * (factura?.items?.abono ?? 0);
  const total = subTotal + subTotal * Number(factura?.iva ?? 0);
  const iva = Number(factura?.iva ?? 0) * subTotal;

  const billResponsible = factura?.family_group?.integrants[0];

  return (
    <TableRow
      className="rounded-lg bg-[#f0f0f0]
    "
    >
      <TableCell className=" relative rounded-l-md border border-[#6cebd1]">
        <button
          className=" p-0 absolute left-[-8px] top-0 bottom-0"
          onClick={() => setActive(!active)}
        >
          {active && (
            <CircleChevronDown className="bg-[#6cebd1] h-4 w-4 rounded-full" />
          )}
          {!active && (
            <CircleChevronRight className="bg-[#6cebd1] h-4 w-4 rounded-full" />
          )}
        </button>
        {factura.nroFactura ?? "N/A"}
      </TableCell>

      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {billResponsible?.name ?? "-"}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {billResponsible?.id_number}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {" "}
        {billResponsible?.fiscal_id_number ?? "-"}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {" "}
        saldo pagador{" "}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {" "}
        {factura?.items?.abono}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {" "}
        {(factura.items?.bonificacion ?? 0) * (factura?.items?.abono ?? 0)}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {" "}
        {(factura.items?.differential_amount ?? 0) *
          (factura?.items?.abono ?? 0)}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {" "}
        {(factura.items?.contribution ?? 0) * (factura?.items?.abono ?? 0)}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {" "}
        {(factura.items?.interest ?? 0) * (factura?.items?.abono ?? 0)}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {" "}
        {subTotal}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4"> {iva}</TableCell>
      <TableCell className="rounded-r-md border border-[#6cebd1]">
        {" "}
        {total}
      </TableCell>
    </TableRow>
  );
}
