"use client";
import { TableCell, TableRow } from "~/components/ui/tablePreliq";
import { Sheet, SheetContent } from "~/components/ui/sheet";
import { FileText } from "lucide-react";
import ContentTable from "./content-table";
import { comprobantes, family_groups } from "~/server/db/schema";
import type { RouterOutputs } from "~/trpc/shared";
import { api } from "~/trpc/react";
import { computeBase, computeIva } from "~/lib/utils";
import DetailSheet from "./detail-sheet";
import { Button } from "~/components/ui/button";
import Link from "next/link";
import { useState } from "react";
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
  const [open, setOpen] = useState(false);
  const comprobantes = family_group?.comprobantes;

  const original_comprobante = comprobantes?.find(
    (comprobante) => comprobante?.origin?.toLowerCase() === "original"
  );
  if (!original_comprobante) {
    return <div>No existe comprobante original</div>;
  }
  const total = parseFloat(original_comprobante.importe.toFixed(2));
  const { data: lastEvent } = api.events.getLastByDateAndCC.useQuery({
    ccId: family_group?.cc?.id!,
    date: preliquidation?.createdAt ?? new Date(),
  });
  const billResponsible = family_group?.integrants.find(
    (x) => x.isBillResponsible == true
  );
  const currentAccountAmount = lastEvent?.current_amount ?? 0;
  const abono = original_comprobante.items.find(
    (item) => item.concept === "Abono"
  );
  const bonification = original_comprobante.items.find(
    (item) => item.concept === "Bonificación"
  );
  const contribution = original_comprobante.items.find(
    (item) => item.concept === "Aporte"
  );
  const interest = original_comprobante.items.find(
    (item) => item.concept === "Interes"
  );
  const previousBill = original_comprobante.items.find(
    (item) => item.concept === "Comprobante Anterior"
  );

  const subTotal = computeBase(total, Number(original_comprobante.iva!));
  const iva = computeIva(total, Number(original_comprobante.iva!));

  const rowValues = [
    family_group?.numericalId ?? "N/A",
    billResponsible?.name ?? "",
    billResponsible?.fiscal_id_number ?? "-",
    currentAccountAmount,
    abono?.amount,
    bonification?.amount,
    0,
    contribution?.amount,
    interest?.amount,
    subTotal,
    iva,
    total,
  ];
  return (
    <>
      <TableRow
        onClick={() => setOpen(!open)}
        className="rounded-lg bg-[#f0f0f0] hover:bg-[#d7d3d395] hover:cursor-pointer transition-all duration-200 ease-in-out
    ">
        <TableCell className=" relative rounded-l-md border bg-inherit border-[#6cebd1]">
          {family_group?.numericalId ?? "N/A"}
        </TableCell>

        <TableCell className="border border-[#6cebd1] p-2 py-4">
          {billResponsible?.name ?? ""}
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
          {computeBase(total, parseFloat(original_comprobante?.iva) ?? 0)}
        </TableCell>
        <TableCell className="border border-[#6cebd1] p-2 py-4">
          {" "}
          {computeIva(total, parseFloat(original_comprobante?.iva) ?? 0)}
        </TableCell>
        <TableCell className="border border-[#6cebd1] p-2 py-4">
          {" "}
          {total}
        </TableCell>
        {preliquidation!.estado !== "pendiente" && (
          <TableCell className="rounded-r-md border border-[#6cebd1]">
            {original_comprobante.billLink &&
            original_comprobante.billLink !== "" ? (
              <div className="flex items-center justify-center">
                <Link href={original_comprobante.billLink}>
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
      <DetailSheet
        name={billResponsible?.name ?? ""}
        comprobantes={comprobantes!}
        open={open}
        setOpen={setOpen}
      />
    </>
  );
}
