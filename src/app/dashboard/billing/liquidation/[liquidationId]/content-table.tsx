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
  comprobante: RouterOutputs["comprobantes"]["getByLiquidation"][number];
};

function ContentTable(props: propsContentTable) {
  const { comprobante } = props;
  return (
    <Table>
      <TableRow className="">
        <TableHead className="  text-sm opacity-70  pl-0 border-b border-[#4af0d4] text-left">
          {" "}
          Concepto{" "}
        </TableHead>
        <TableHead className="   text-sm opacity-70  border-b border-[#4af0d4] ">
          {" "}
          Importe{" "}
        </TableHead>
        <TableHead className="    text-sm opacity-70  border-b border-[#4af0d4]">
          {" "}
          IVA
        </TableHead>
        <TableHead className="   text-sm opacity-70  border-b border-[#4af0d4]">
          TOTAL
        </TableHead>
      </TableRow>{" "}
      {comprobante?.items
        .filter((item) => item.concept != "Total factura")
        .map((item) => (
          <TableRow key={item.id}>
            <TableCell className=" border-b border-[#4af0d4] py-[0.25rem]  text-[#737171] text-left italic opacity-70 ">
              {item.concept}
            </TableCell>
            <TableCell className=" border-b border-[#4af0d4] py-[0.25rem] text-[#737171] font-semibold opacity-70 ">
              {item.amount}
            </TableCell>
            <TableCell className=" border-b border-[#4af0d4] py-[0.25rem] text-[#737171] font-semibold opacity-70">
              {item.iva}
            </TableCell>
            <TableCell className=" border-b border-[#4af0d4] py-[0.25rem] text-[#737171] font-semibold opacity-70">
              {item.total}
            </TableCell>
          </TableRow>
        ))}
    </Table>
  );
}

export default ContentTable;