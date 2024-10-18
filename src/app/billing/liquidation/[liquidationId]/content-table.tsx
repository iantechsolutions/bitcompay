import React from "react";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/tablePreliq";

import { RouterOutputs } from "~/trpc/shared";
import { formatCurrency } from "../../pre-liquidation/[liquidationId]/detail-sheet";

type propsContentTable = {
  comprobante: RouterOutputs["comprobantes"]["getByLiquidation"][number];
};

export default function ContentTable(props: propsContentTable) {
  const { comprobante } = props;

  const abono = comprobante?.items.find((item) => item.concept === "Abono");
  const diferencial = comprobante?.items.find(
    (item) => item.concept === "Diferencial"
  );

  const abonoYDiferencial =
    abono || diferencial
      ? {
          concept: "Abono",
          amount: (abono?.amount ?? 0) + (diferencial?.amount ?? 0),
          iva: (abono?.iva ?? 0) + (diferencial?.iva ?? 0),
          total: (abono?.total ?? 0) + (diferencial?.total ?? 0),
        }
      : null;

  const otherItems = comprobante?.items.filter(
    (item) =>
      item.concept !== "Abono" &&
      item.concept !== "Diferencial" &&
      item.concept != "Total factura"
  );

  return (
    <Table>
      <TableHeader className="bg-[#F7F7F7] rounded-xl">
        <TableHead className="pl-4">Concepto</TableHead>
        <TableHead>Importe</TableHead>
        <TableHead>IVA</TableHead>
        <TableHead className="pr-1">TOTAL</TableHead>
      </TableHeader>

      {abonoYDiferencial && abonoYDiferencial.amount > 0 && (
        <TableRow className="border-b last:border-none">
          <TableCell className="pl-4">{abonoYDiferencial.concept}</TableCell>
          <TableCell>{formatCurrency(abonoYDiferencial.amount)}</TableCell>
          <TableCell>{formatCurrency(abonoYDiferencial.iva)}</TableCell>
          <TableCell className="pr-1">
            {formatCurrency(abonoYDiferencial.total)}
          </TableCell>
        </TableRow>
      )}
      {otherItems?.map((item) => (
        <TableRow key={item.id} className="border-b last:border-none">
          <TableCell className="pl-4">{item.concept}</TableCell>
          <TableCell>{formatCurrency(item.amount ?? 0)}</TableCell>
          <TableCell>{formatCurrency(item.iva ?? 0)}</TableCell>
          <TableCell className="pr-1">
            {formatCurrency(item.total ?? 0)}
          </TableCell>
        </TableRow>
      ))}
    </Table>
  );
}
