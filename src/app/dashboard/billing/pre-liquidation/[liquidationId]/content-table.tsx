import React from "react";
import {
  Table,
  TableCell,
  TableHead,
  TableHeader,
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
  comprobante: RouterOutputs["comprobantes"]["getByLiquidation"][number];
};

function ContentTable(props: propsContentTable) {
  const { comprobante } = props;
  return (
    <Table>
      <TableHeader className="bg-[#F7F7F7] rounded-lg">
        <TableHead className="pl-4 ">
          {" "}
          Concepto{" "}
        </TableHead>
        <TableHead className=" ">
          {" "}
          Importe{" "}
        </TableHead>
        <TableHead className=" ">
          {" "}
          IVA
        </TableHead>
        <TableHead className="">
          TOTAL
        </TableHead>
      </TableHeader>{" "}
      {comprobante?.items
        .filter((item) => item.concept != "Total factura")
        .map((item) => (
          <TableRow key={item.id} className="border-b last:border-none">
            <TableCell className="pl-4 ">
              {item.concept}
            </TableCell>
            <TableCell className=" ">
              ${item.amount}
            </TableCell>
            <TableCell className=" ">
              ${item.iva}
            </TableCell>
            <TableCell className=" ">
              ${item.total}
            </TableCell>
          </TableRow>
        ))}
    </Table>
  );
}

export default ContentTable;
