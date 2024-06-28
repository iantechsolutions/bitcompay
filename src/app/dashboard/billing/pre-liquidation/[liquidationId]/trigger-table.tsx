"use client";
import {
  CircleChevronDown,
  CircleChevronRight,
  CircleChevronUp,
  FileText,
} from "lucide-react";
import { Router } from "next/router";
import { TableCell, TableRow } from "~/components/ui/tablePreliq";
import { Facturas } from "~/server/db/schema";
import { RouterOutputs } from "~/trpc/shared";
import { computeBase, computeIva } from "~/lib/utils";
import { RedirectButton } from "~/components/redirect-button";
import Link from "next/link";
import { Button } from "~/components/ui/button";
interface TriggerTableProps {
  setActive: (value: boolean) => void;
  active: boolean;
  factura: RouterOutputs["facturas"]["list"][number];
  preliquidation: RouterOutputs["liquidations"]["get"];
  bonificationValue: number;
  contributionValue: number;
  interestValue: number;
  cuotaValue: number;
  previousBillValue: number;
  total: number;
  currentAccountAmount: number;
}

export default function TriggerTable(props: TriggerTableProps) {
  const {
    cuotaValue,
    setActive,
    active,
    factura,
    bonificationValue,
    contributionValue,
    interestValue,
    previousBillValue,
    total,
    currentAccountAmount,
  } = props;

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
        {factura?.family_group?.numericalId ?? "N/A"}
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
        {cuotaValue}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {" "}
        {bonificationValue}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {" "}
        {factura.items?.differential_amount ?? 0}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {" "}
        {contributionValue}
      </TableCell>
      <TableCell className="border border-[#6cebd1] p-2 py-4">
        {" "}
        {interestValue}
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
            <div className="items-center justify-center">
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
