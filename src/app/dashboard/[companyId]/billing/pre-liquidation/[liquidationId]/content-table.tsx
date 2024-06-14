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
type propsContentTable = {
  factura: RouterOutputs["facturas"]["list"][number];
  period: string;
};

function ContentTable({ factura, period }: propsContentTable) {
  const bonificationValue =
    (factura?.items?.bonificacion ?? 0) * (factura?.items?.abono ?? 0);
  const contributionValue =
    (factura?.items?.contribution ?? 0) * (factura?.items?.abono ?? 0);
  const interestValue =
    (factura?.items?.interest ?? 0) * (factura?.items?.abono ?? 0);
  return (
    <OriginalTableRow>
      <OriginalTableCell colSpan={13}>
        <Table>
          <TableCell
            className="text-center font-bold border-r border-gray-400 bg-[#ccfbf1]"
            rowSpan={9}
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
              $
              {factura?.items?.previous_bill
                ? factura?.items?.previous_bill
                : 0}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              $
              {computeIva(
                factura?.items?.previous_bill ?? 0,
                Number(factura?.iva) ?? 0
              )}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              $
              {computeTotal(
                factura?.items?.previous_bill ?? 0,
                Number(factura?.iva) ?? 0
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              {factura?.tipoFactura ?? "FC"}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">{`Cuota Plan ${factura?.family_group?.plan?.description} ${period} `}</TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              ${factura?.items?.abono}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              $
              {computeIva(
                factura?.items?.abono ?? 0,
                Number(factura?.iva) ?? 0
              )}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              $
              {computeTotal(
                factura?.items?.abono ?? 0,
                Number(factura?.iva) ?? 0
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              {factura?.tipoFactura ?? "FC"}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              {`Bonificacion ${factura?.items?.bonificacion}%`}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              ${bonificationValue}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              ${computeIva(bonificationValue, Number(factura?.iva) ?? 0)}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              ${computeTotal(bonificationValue, Number(factura?.iva) ?? 0)}
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
              ${computeIva(contributionValue, Number(factura?.iva) ?? 0)}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              ${computeTotal(contributionValue, Number(factura?.iva) ?? 0)}
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
              ${computeIva(interestValue, Number(factura?.iva) ?? 0)}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#b7f3e6]">
              ${computeTotal(interestValue, Number(factura?.iva) ?? 0)}
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
              $
              {factura?.items?.abono ??
                0 +
                  bonificationValue +
                  contributionValue +
                  (factura?.items?.previous_bill ?? 0) +
                  interestValue}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#ccfbf1] border-t-black">
              $
              {computeIva(
                factura?.items?.abono ??
                  0 +
                    bonificationValue +
                    contributionValue +
                    (factura?.items?.previous_bill ?? 0) +
                    interestValue,
                Number(factura?.iva) ?? 0
              )}
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#ccfbf1] border-t-black">
              $
              {computeTotal(
                factura?.items?.abono ??
                  0 +
                    bonificationValue +
                    contributionValue +
                    (factura?.items?.previous_bill ?? 0) +
                    interestValue,
                Number(factura?.iva) ?? 0
              )}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell className="font-bold border border-gray-400 bg-[#ccfbf1]">
              REC
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#ccfbf1]"></TableCell>
            <TableCell className="border border-gray-400 bg-[#ccfbf1]">
              $0
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#ccfbf1]">
              $0
            </TableCell>
            <TableCell className="border border-gray-400 bg-[#ccfbf1]">
              $0
            </TableCell>
          </TableRow>
        </Table>
      </OriginalTableCell>
    </OriginalTableRow>
  );
}

export default ContentTable;

function computeIva(field: number, iva: number) {
  return field * iva;
}
function computeTotal(field: number, iva: number) {
  return field + computeIva(field, iva);
}
