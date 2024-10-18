"use client";
import { FileText } from "lucide-react";
import { Title } from "~/components/title";
import { api } from "~/trpc/react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import LayoutContainer from "~/components/layout-container";
import { Button } from "~/components/ui/button";
// import { type TableRecord, columns } from "./columns";
// import DataTable from "./data-table";
import { Card } from "~/components/ui/card";
import Download02Icon from "~/components/icons/download-02-stroke-rounded";
import { RouterOutputs } from "~/trpc/shared";
import { formatCurrency } from "~/app/billing/pre-liquidation/[liquidationId]/detail-sheet";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import "dayjs/locale/es";
import DataTable from "./data-table";
import { columns, TableRecord } from "./columns";
dayjs.locale("es");
export default function AportesDetalles(props: {
  params: { integrantId: string };
}) {
  const integrantId = props.params.integrantId;

  const { data: integrant } = api.integrants.get.useQuery({
    integrantsId: integrantId,
  });

  const aportes = integrant?.aportes_os;

  const tableRows: TableRecord[] = [];

  if (aportes) {
    aportes.forEach((aporte) => {
      tableRows.push({
        id: aporte.id,
        createdAt: aporte.createdAt,
        amount: aporte.amount,
        id_affiliate: aporte.id_affiliate,
        cuil: aporte.cuil,
        process_date: aporte.process_date,
        contribution_date: aporte.contribution_date,
        support_date: aporte.support_date,
      });
    });
  }

  return (
    <LayoutContainer>
      <Title>Aportes historicos</Title>
      <h2 className=" font-semibold mb-2">{integrant?.name}</h2>
      <div className="flex gap-3 mt-5 mb-10">
        <Card className="py-4 px-6 w-1/4 grid grid-cols-2 items-center">
          <div className="flex flex-col">
            <p className="text-base font-medium block">SALDO ACTUAL</p>

            <h1>{aportes?.length}</h1>
          </div>
        </Card>
      </div>
      <DataTable data={tableRows} columns={columns} />
      <div className="flex flex-auto justify-end">
        {/* <Button
          variant="bitcompay"
          className=" text-base px-16 py-6 mt-5 gap-3 text-[#3e3e3e] rounded-full font-medium"
          onClick={async () => {
            await handleExport();
          }}>
          <Download02Icon />
          Exportar
        </Button> */}
      </div>
    </LayoutContainer>
  );
}
