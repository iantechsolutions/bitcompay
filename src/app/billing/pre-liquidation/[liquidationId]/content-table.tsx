import React from "react";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/tablePreliq";

import { Router } from "next/router";
import { RouterOutputs } from "~/trpc/shared";
import { computeIva, computeBase, computeTotal } from "~/lib/utils";
import { formatCurrency } from "./detail-sheet";
type propsContentTable = {
  comprobante: RouterOutputs["comprobantes"]["getByLiquidation"][number];
};

export default function ContentTable(props: propsContentTable) {
  const { comprobante } = props;
  return (
    <Table>
      <TableHeader className="bg-[#F7F7F7] rounded-xl">
        <TableHead className="pl-4 "> Concepto </TableHead>
        <TableHead className=" "> Importe </TableHead>
        <TableHead className=" "> IVA</TableHead>
        <TableHead className="pr-1">TOTAL</TableHead>
      </TableHeader>{" "}
      {comprobante?.items
        .filter((item) => item.concept != "Total factura")
        .map((item) => {
          const amount = item.amount ?? 0;
          const iva = item.iva ?? 0;
          const total = item.total ?? 0;
          return (
            <TableRow key={item.id} className="border-b last:border-none">
              <TableCell className="pl-4 ">{item.concept}</TableCell>
              <TableCell className=" ">
              {formatCurrency(amount)}
              </TableCell>
              <TableCell className=" ">
              {formatCurrency(iva)}
              </TableCell>
              <TableCell className="pr-1 ">
              {formatCurrency(total)}
              </TableCell>
            </TableRow>
          );
        })}
    </Table>
  );
}

