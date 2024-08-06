"use client";
import { api } from "~/trpc/react";
import { Title } from "~/components/title";
import { List, ListTile } from "~/components/list";
import LayoutContainer from "~/components/layout-container";
import { CircleUserRound } from "lucide-react";
import AddPreLiquidation from "./add-pre-liquidation";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import "dayjs/locale/es";
import { type TableRecord } from "./columns";
import { columns } from "./columns";
import { DataTable } from "./data-table";

dayjs.extend(utc);
dayjs.locale("es");

export default function Page() {
  let { data: liquidationsFull } = api.liquidations.list.useQuery();
  // //filter liquidations where companyId is equal to the companyId in the URL and estado: "pendiente"
  // const { data: possibleBrands } = api.brands.list.useQuery();
  const tableData: TableRecord[] = [];
  if (liquidationsFull) {
    liquidationsFull = liquidationsFull.filter(
      (liquidation) => liquidation.estado === "pendiente"
    );
    for (const liquidation of liquidationsFull) {
      tableData.push({
        id: liquidation?.id!,
        number: String(liquidation?.number) ?? "NO NUMBER",
        Marca: liquidation?.brand?.name ?? "NO BRAND",
        period: dayjs(liquidation?.period).format("MM-YYYY"),
        cuit: liquidation?.cuit ?? "NO CUIT",
        UN: liquidation?.bussinessUnits?.description ?? "NO BU",
      });
    }
  }
  console.log("liquidationsFull", liquidationsFull);
  return (
    <LayoutContainer>
      <section className="space-y-2">
        <div className="flex justify-between">
          <Title>Pre-Liquidation</Title>
          <AddPreLiquidation />
        </div>
        <DataTable columns={columns} data={tableData} />
      </section>
    </LayoutContainer>
  );
}
