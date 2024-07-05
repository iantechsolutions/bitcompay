"use client";
import {
  CircleChevronDown,
  CircleChevronRight,
  CircleChevronUp,
  FileText,
} from "lucide-react";
import { Router } from "next/router";
import { TableCell, TableRow } from "~/components/ui/tablePreliq";
import { Factura } from "~/server/db/schema";
import { RouterOutputs } from "~/trpc/shared";
import { computeBase, computeIva } from "~/lib/utils";
import { RedirectButton } from "~/components/redirect-button";
import Link from "next/link";
import { Button } from "~/components/ui/button";
import { FamilyListLiquidationId } from "~/server/api/routers/family_group-router";
interface TriggerTableProps {
  setActive: (value: boolean) => void;
  active: boolean;
  factura: RouterOutputs["facturas"]["getByLiquidation"][number];
  preliquidation: RouterOutputs["liquidations"]["get"];
  total: number;
  currentAccountAmount: number;
  family_group: RouterOutputs["family_groups"]["getByLiquidation"][number];
}

export default function TriggerTable(props: TriggerTableProps) {
  const {
    setActive,
    active,
    factura,
    preliquidation,
    total,
    currentAccountAmount,
    family_group,
  } = props;

  const billResponsible = family_group?.integrants.find(
    (x) => x.isBillResponsible == true
  );
  const bonification = factura.items.find(
    (item) => item.concept === "bonificacion"
  );
  const contribution = factura.items.find(
    (item) => item.concept === "contribucion"
  );
  const interest = factura.items.find((item) => item.concept === "interes");
  const previousBill = factura.items.find(
    (item) => item.concept === "factura periodo anterior impaga"
  );
  const abono = factura.items.find((item) => item.concept === "abono");
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
        {family_group?.numericalId ?? "N/A"}
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
        {computeBase(total, parseFloat(factura?.iva) ?? 0)}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {" "}
        {computeIva(total, parseFloat(factura?.iva) ?? 0)}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {" "}
        {total}
      </TableCell>
      {props.preliquidation!.estado !== "pendiente" && (
        <TableCell className="rounded-r-md border border-[#6cebd1]">
          {factura.billLink && factura.billLink !== "" ? (
            <div className="flex items-center justify-center">
              <Link href={factura.billLink}>
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
