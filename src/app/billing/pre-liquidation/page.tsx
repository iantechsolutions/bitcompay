"use client";
import { api } from "~/trpc/react";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { CircleUserRound, Loader2Icon } from "lucide-react";
import AddPreLiquidation from "./add-pre-liquidation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";
import { type TableRecord } from "./columns";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useState } from "react";

dayjs.extend(utc);
dayjs.locale("es");
export const maxDuration = 300;
export const dynamic = "force-dynamic";

export default function Page() {
  let { data: liquidationsFull, isFetching } = api.liquidations.list.useQuery();
  let [loading, setLoading] = useState(false);
  // //filter liquidations where companyId is equal to the companyId in the URL and estado: "pendiente"
  // const { data: possibleBrands } = api.brands.list.useQuery();

  const tableData: TableRecord[] = [];
  if (liquidationsFull) {
    liquidationsFull = liquidationsFull.filter(
      (liquidation) => liquidation.estado.toLowerCase() === "pendiente"
    );
    for (const liquidation of liquidationsFull) {
      tableData.push({
        id: liquidation?.id!,
        number: String(liquidation?.number) ?? "NO NUMBER",
        Marca: liquidation?.brand?.name ?? "NO BRAND",
        period: dayjs(liquidation?.period).format("MM/YYYY"),
        processDate: dayjs(liquidation?.createdAt).format(
          "DD/MM/YYYY hh:mm:ss"
        ),
        UN: liquidation?.bussinessUnits?.description ?? "NO BU",
      });
    }
  }

  const showLoader = loading || isFetching;
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <div className="flex flex-row">
            <Title>Preliquidación</Title>
            {showLoader ? (
              <Loader2Icon className="animate-spin m-1.5 ml-2" size={20} />
            ) : (
              <></>
            )}
          </div>
          <AddPreLiquidation />
        </div>
        <DataTable columns={columns} data={tableData} setLoading={setLoading} />
      </section>
    </LayoutContainer>
  );
}
