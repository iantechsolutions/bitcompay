import React from "react";
import {
  Table,
  TableCell,
  TableHead,
  TableRow,
} from "~/components/ui/tablePreliq";

import {
  Table as OriginalTable,
  TableCell as OriginalTableCell,
  TableRow as OriginalTableRow,
  TableHead as OriginalTableHead,
} from "~/components/ui/table";
import { Router } from "next/router";
import { RouterOutputs } from "~/trpc/shared";
import { computeIva, computeBase, computeTotal } from "~/lib/utils";
type propsContentTable = {
  factura: RouterOutputs["facturas"]["getByLiquidation"][number];
  period: string;
  total: number;
};

function ContentTable(props: propsContentTable) {
  const { factura, period, total } = props;
  const contribution = factura.items.find(
    (item) => item.concept === "contribucion"
  );
  const interest = factura.items.find((item) => item.concept === "interes");
  const bonification = factura.items.find(
    (item) => item.concept === "bonificacion"
  );
  const previousBill = factura.items.find(
    (item) => item.concept === "factura periodo anterior impaga"
  );
  const abono = factura.items.find((item) => item.concept === "abono");
  return (
    <OriginalTableRow>
      <OriginalTableCell colSpan={13}>
        <Table>
          <TableCell
            className="text-center font-bold border-r border-gray-400 bg-[#ccfbf1]"
            rowSpan={8}
          >
            Mes Vigencia
          </TableCell>
          <TableRow>
            <TableHead className="text-black border-r border-gray-400 bg-[#ccfbf1]">
              {" "}
              Comprobante{" "}
            </TableHead>
            <TableHead className="text-black border-r border-gray-400 bg-[#ccfbf1]">
              {" "}
              Concepto{" "}
            </TableHead>
            <TableHead className="text-black border-r border-gray-400 bg-[#ccfbf1]">
              {" "}
              Importe{" "}
            </TableHead>
            <TableHead className="text-black border-r border-gray-400 bg-[#ccfbf1]">
              {" "}
              IVA
            </TableHead>
            <TableHead className="text-black bg-[#ccfbf1]">Total</TableHead>
          </TableRow>{" "}
          {factura?.items.map((item) => (
            <TableRow>
              <TableCell className="border border-gray-400 border-t-black bg-[#ccfbf1]">
                FC
              </TableCell>
              <TableCell className="border border-gray-400 border-t-black bg-[#ccfbf1]">
                {item.concept}
              </TableCell>
              <TableCell className="border border-gray-400 border-t-black bg-[#ccfbf1]">
                {item.amount}
              </TableCell>
              <TableCell className="border border-gray-400 border-t-black bg-[#ccfbf1]">
                {item.iva}
              </TableCell>
              <TableCell className="border border-gray-400 border-t-black bg-[#ccfbf1]">
                {item.total}
              </TableCell>
            </TableRow>
          ))}
          <TableRow>
            <TableCell className="font-bold border border-gray-400 border-t-black bg-[#ccfbf1]">
              Total FC B
            </TableCell>
            <Table className="border border-gray-400 bg-[#ccfbf1] border-t-black min-h-[22px]">
              {" "}
            </Table>
            <TableCell className="border border-gray-400 bg-[#ccfbf1] border-t-black">
              ${computeBase(total, parseFloat(factura?.iva) ?? 0)}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#ccfbf1] border-t-black">
              ${computeIva(total, parseFloat(factura?.iva) ?? 0)}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#ccfbf1] border-t-black">
              ${total}
            </TableCell>
          </TableRow>{" "}
        </Table>
      </OriginalTableCell>
    </OriginalTableRow>
  );
}

export default ContentTable;
