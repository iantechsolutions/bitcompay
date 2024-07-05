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
  factura: RouterOutputs["facturas"]["list"][number];
  period: string;
  bonificationValue: number;
  contributionValue: number;
  interestValue: number;
  cuotaValue: number;
  previousBillValue: number;
  total: number;
};

function ContentTable(props: propsContentTable) {
  const {
    cuotaValue,
    factura,
    period,
    bonificationValue,
    contributionValue,
    interestValue,
    previousBillValue,
    total,
  } = props;
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
          </TableRow>
          <TableRow>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              {"NC"}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              Factura periodo anterior impaga
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              ${previousBillValue}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              $
              {computeIva(
                computeTotal(previousBillValue, parseFloat(factura?.iva) ?? 0),
                parseFloat(factura?.iva) ?? 0
              )}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              ${computeTotal(previousBillValue, parseFloat(factura?.iva) ?? 0)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              {factura?.tipoFactura ?? "FC"}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">{`Cuota Plan ${factura?.family_group?.plan?.description} ${period} `}</TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              ${cuotaValue}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              $
              {computeIva(
                computeTotal(cuotaValue, parseFloat(factura?.iva) ?? 0),
                parseFloat(factura?.iva) ?? 0
              )}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              ${computeTotal(cuotaValue, parseFloat(factura?.iva) ?? 0)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              {factura?.tipoFactura ?? "FC"}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              {/* {`Bonificacion ${Math.round(
                ((factura?.items?.bonificacion ?? 0) / cuotaValue) * 100
              )}%`} */}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              -${bonificationValue}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              -$
              {computeIva(
                computeTotal(bonificationValue, parseFloat(factura?.iva) ?? 0),
                parseFloat(factura?.iva) ?? 0
              )}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              -$
              {computeTotal(bonificationValue, parseFloat(factura?.iva) ?? 0)}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              {" "}
              {factura?.tipoFactura ?? "FC"}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              {" "}
              Aportes{" "}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              ${contributionValue}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              $
              {computeIva(
                computeTotal(contributionValue, parseFloat(factura?.iva) ?? 0),
                parseFloat(factura?.iva) ?? 0
              )}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              ${computeTotal(contributionValue, parseFloat(factura?.iva) ?? 0)}
            </TableCell>
          </TableRow>

          <TableRow>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              {factura?.tipoFactura ?? "FC"}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              Interes por pago fuera de término
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              ${interestValue}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              $
              {computeIva(
                computeTotal(interestValue, parseFloat(factura?.iva) ?? 0),
                parseFloat(factura?.iva) ?? 0
              )}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              ${computeTotal(interestValue, parseFloat(factura?.iva) ?? 0)}
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
              ${computeBase(total, parseFloat(factura?.iva) ?? 0)}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#ccfbf1] border-t-black">
              ${computeIva(total, parseFloat(factura?.iva) ?? 0)}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#ccfbf1] border-t-black">
              ${total}
            </TableCell>
          </TableRow>
        </Table>
      </OriginalTableCell>
    </OriginalTableRow>
  );
}

export default ContentTable;
