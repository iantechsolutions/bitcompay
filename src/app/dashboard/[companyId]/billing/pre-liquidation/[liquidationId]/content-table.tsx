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
const ContentTable: React.FC = () => {
  return (
    <OriginalTableRow>
      <OriginalTableCell colSpan={13}>
        <Table>
          <TableCell
            className="text-center font-bold border-r border-gray-400 bg-[#ccfbf1]"
            rowSpan={5}
          >
            Mes Vigencia
          </TableCell>

          <TableRow>
            <TableHead className="text-black border-r border-gray-400 bg-[#ccfbf1]">
              {" "}
              Comprobantes{" "}
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
          </TableRow>

          <TableRow>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              Cell 1
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              Cell 2
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              Cell 3
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              Cell 4
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              Cell 5
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="font-bold border border-gray-400 border-t-black bg-[#ccfbf1]">
              Total FC B
            </TableCell>
            <Table className="border border-gray-400 bg-[#ccfbf1] border-t-black min-h-[22px]">
              {" "}
            </Table>
            <TableCell className="border border-gray-400 bg-[#ccfbf1] border-t-black">
              Cell 3
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#ccfbf1] border-t-black">
              Cell 4
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#ccfbf1] border-t-black">
              Cell 5
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-bold border border-gray-400 bg-[#ccfbf1]">
              REC
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#ccfbf1]"></TableCell>
            <TableCell className="border border-gray-400 bg-[#ccfbf1]">
              Cell 3
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#ccfbf1]">
              Cell 4
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#ccfbf1]">
              Cell 5
            </TableCell>
          </TableRow>
        </Table>
      </OriginalTableCell>
    </OriginalTableRow>
  );
};

export default ContentTable;
