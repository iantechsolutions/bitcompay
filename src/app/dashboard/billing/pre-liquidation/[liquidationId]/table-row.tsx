"use client";
import { TableCell, TableRow } from "~/components/ui/tablePreliq";
import { FileText } from "lucide-react";
import { useState } from "react";
import ContentTable from "./content-table";
import { Factura, family_groups } from "~/server/db/schema";
import type { RouterOutputs } from "~/trpc/shared";
import { api } from "~/trpc/react";
import { computeBase, computeIva } from "~/lib/utils";
import DetailSheet from "./detail-sheet";
import { Button } from "~/components/ui/button";
import Link from "next/link";
type propsTableRowContainer = {
  preliquidation: RouterOutputs["liquidations"]["get"];
  family_group: RouterOutputs["family_groups"]["getByLiquidation"][number];
  periodo: string;
};

export default function TableRowContainer({
  preliquidation,
  family_group,
  periodo,
}: propsTableRowContainer) {
  const facturas = family_group?.facturas;

  console.log("facturasTT", facturas);

  const original_factura = facturas?.find(
    (factura) => factura?.origin?.toLowerCase() === "original"
  );
  if (!original_factura) {
    return <div>No existe factura original</div>;
  }
  const total = parseFloat(original_factura.importe.toFixed(2));
  const { data: lastEvent } = api.events.getLastByDateAndCC.useQuery({
    ccId: family_group?.cc?.id!,
    date: preliquidation?.createdAt ?? new Date(),
  });
  const billResponsible = family_group?.integrants.find(
    (x) => x.isBillResponsible == true
  );
  const currentAccountAmount = lastEvent?.current_amount ?? 0;
  const abono = original_factura.items.find((item) => item.concept === "Abono");
  const bonification = original_factura.items.find(
    (item) => item.concept === "Bonificación"
  );
  const contribution = original_factura.items.find(
    (item) => item.concept === "Aporte"
  );
  const interest = original_factura.items.find(
    (item) => item.concept === "Interes"
  );
  const previousBill = original_factura.items.find(
    (item) => item.concept === "Factura Anterior"
  );

  const subTotal = computeBase(total, Number(original_factura.iva!));
  return (
    <TableRow
      className="rounded-lg bg-[#f0f0f0]
    "
    >
      <TableCell className=" relative rounded-l-md border border-[#6cebd1]">
        {family_group?.numericalId ?? "N/A"}
      </TableCell>

      <TableCell className="border border-[#6cebd1] p-2 py-4">
        <DetailSheet name={billResponsible?.name ?? ""} facturas={facturas!} />
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
        {currentAccountAmount}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {" "}
        {abono?.amount}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {" "}
        {bonification?.amount}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4"> {0}</TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {" "}
        {contribution?.amount}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {" "}
        {interest?.amount}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {" "}
        {computeBase(total, parseFloat(original_factura?.iva) ?? 0)}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {" "}
        {computeIva(total, parseFloat(original_factura?.iva) ?? 0)}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {" "}
        {total}
      </TableCell>
      {preliquidation!.estado !== "pendiente" && (
        <TableCell className="rounded-r-md border border-[#6cebd1]">
          {original_factura.billLink && original_factura.billLink !== "" ? (
            <div className="flex items-center justify-center">
              <Link href={original_factura.billLink}>
                <FileText></FileText>
              </Link>
            </div>
          ) : (
            <div className="items-center justify-center">
              <Button disabled={true} variant="link">
                <FileText></FileText>
              </Button>
            </div>
          )}
        </TableCell>
      )}
    </TableRow>
  );
}
