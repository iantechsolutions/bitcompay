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
import { api } from "~/trpc/react";
import dayjs from "dayjs";

type propsContentTable = {
  aportesOS: RouterOutputs["aportes_os"]["list"];
};

export default function AportesTable(props: propsContentTable) {
  const {aportesOS} = props;
  const healthinsurances = api.healthInsurances.list.useQuery().data

  return (
    <Table>
      <TableHeader className="bg-[#F7F7F7] rounded-xl">
        <TableHead className="pl-4 text-left">Período</TableHead>
        <TableHead className="text-left">CUIT empleador</TableHead>
        <TableHead className="text-left">Obra social</TableHead>
        <TableHead className="pr-1 text-left">Monto</TableHead>
      </TableHeader>{" "}
      {aportesOS?.map((aporte) => {
          const periodo = aporte.support_date ?? 0;
          const cuit = aporte.employer_document_number ?? 0;
          const os = healthinsurances?.find(x=>x.id == aporte.healthInsurances_id);
          const amount = Number(aporte.amount) ?? 0;
          return (
            <TableRow key={aporte.id} className="border-b last:border-none">
              <TableCell className="pl-4 text-left">
              {dayjs(periodo).format("DD/MM/YY")}
              </TableCell>
              <TableCell className="text-left">
              {cuit}
              </TableCell>
              <TableCell className="text-left">
              {os?.name ?? "-"}
              </TableCell>
              <TableCell className="pr-1 text-left">
              {formatCurrency(amount)}
              </TableCell>
            </TableRow>
          );
        })}
    </Table>
  );
}

