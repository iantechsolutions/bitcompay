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
import { GoBackArrow } from "~/components/goback-arrow";
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
        "Fecha de proceso": aporte.process_date ?? null,
        "Fecha de contribución": aporte.contribution_date ?? null,
        "Fecha de soporte": aporte.support_date ?? null,
      });
    });
  }

  return (
    <>
      <GoBackArrow />
      <LayoutContainer>
        <Title>Aportes historicos</Title>
        <h2 className=" font-semibold mb-2">{integrant?.name}</h2>
        <div className="flex gap-3 mt-5 mb-10">
          <Card className="py-4 px-6 w-1/4 flex items-center border-2 border-gray-300">
            {" "}
            {/* Cambié grid a flex y añadí un borde para hacer más grueso */}
            <p className="text-lg font-semibold">
              {" "}
              {/* Aumenté el tamaño y cambié a font-semibold para hacerlo más grueso */}
              Aportes registrados: {aportes?.length}
            </p>
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
    </>
  );
}
