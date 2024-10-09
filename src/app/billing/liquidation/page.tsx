"use client";

import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { CircleUserRound, Loader2Icon } from "lucide-react";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";
import { type TableRecord } from "./columns";
import { columns } from "./columns";
import { DataTable } from "./data-table";
import { useState } from "react";
import { api } from "~/trpc/react";
dayjs.extend(utc);
dayjs.locale("es");

export default function Page() {
  let { data: liquidationsFull, isFetching } = api.liquidations.list.useQuery();
  let [loading, setLoading] = useState(false);

  const tableData: TableRecord[] = [];
  if (liquidationsFull) {
    console.log("a", liquidationsFull);
    const liquidations = liquidationsFull.filter(
      (liquidation) => liquidation.estado === "aprobada"
    );
    console.log("b", liquidations);
    for (const liquidation of liquidations) {
      tableData.push({
        id: liquidation?.id!,
        number: String(liquidation?.number) ?? "NO NUMBER",
        Marca: liquidation.brand?.name ?? "NO BRAND",
        period: dayjs(liquidation?.period).format("MM/YYYY"),
        processDate: dayjs(liquidation?.createdAt).format(
          "DD/MM/YYYY hh:mm:ss"
        ), //revisar
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
            <Title>Liquidación</Title>
            {showLoader ? (
              <Loader2Icon className="animate-spin m-1.5 ml-2" size={20} />
            ) : (
              <></>
            )}
          </div>
        </div>
        <DataTable columns={columns} data={tableData} setLoading={setLoading} />
      </section>
    </LayoutContainer>
  );
}
